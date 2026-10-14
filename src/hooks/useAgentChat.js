import { create } from 'zustand';

/**
 * Zustand Store for Agent Chat with SSE streaming
 */
export const useAgentChatStore = create((set, get) => ({
  messages: [
    {
      id: 'welcome',
      sender: 'agent',
      text: "Namaste! I am the **Dravya Autonomous AI Agent**. I run on strict multi-agent tool loops with 8 read-only diagnostic tools. All incoming requests are Zod-validated, and real verified database rows are injected into analytical charts. Ask me about live voltages, botanical identification, or adulteration markers!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  isStreaming: false,
  activeTools: [],
  lastFailedQuery: null,

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  setActiveTools: (tools) => set({ activeTools: tools }),

  setIsStreaming: (status) => set({ isStreaming: status }),

  clearHistory: () =>
    set({
      messages: [
        {
          id: 'welcome_' + Date.now(),
          sender: 'agent',
          text: 'History cleared. Ready for new chemometrics query.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }),

  sendQuery: async (queryText) => {
    const textToSend = queryText?.trim();
    if (!textToSend || get().isStreaming) return;

    const userMsgId = 'usr_' + Date.now();
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    set((state) => ({
      messages: [...state.messages, userMsg],
      isStreaming: true,
      activeTools: [],
      lastFailedQuery: null,
    }));

    const agentMsgId = 'agent_' + Date.now();
    const token = localStorage.getItem('etongue_auth_token') || 'demo_token';

    try {
      const response = await fetch('http://localhost:5000/api/v1/agent/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: textToSend, query: textToSend }),
      });

      if (!response.ok || !response.body) {
        throw new Error('SSE stream connection refused');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      let currentAgentText = '';
      let generativeComponents = [];

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim()) continue;

          const eventMatch = line.match(/^event:\s*(\w+)/m);
          const dataMatch = line.match(/^data:\s*(.*)/m);

          const eventType = eventMatch ? eventMatch[1] : 'message';
          let eventData = {};

          try {
            if (dataMatch && dataMatch[1]) {
              eventData = JSON.parse(dataMatch[1]);
            }
          } catch (e) {
            eventData = { raw: dataMatch ? dataMatch[1] : '' };
          }

          if (eventType === 'tool_start') {
            set((state) => ({
              activeTools: [
                ...state.activeTools,
                { tool: eventData.tool, input: eventData.arguments, status: 'running' },
              ],
            }));
          } else if (eventType === 'tool_end') {
            set((state) => ({
              activeTools: state.activeTools.map((t) =>
                t.tool === eventData.tool
                  ? { ...t, status: 'completed', result: eventData.result }
                  : t
              ),
            }));
          } else if (eventType === 'final') {
            currentAgentText = eventData.text || eventData.message || '';
            if (eventData.ui && Array.isArray(eventData.ui)) {
              generativeComponents = eventData.ui;
            } else if (eventData.component) {
              generativeComponents = [eventData.component];
            }

            set((state) => ({
              messages: [
                ...state.messages,
                {
                  id: agentMsgId,
                  sender: 'agent',
                  text: currentAgentText,
                  components: generativeComponents,
                  sources: eventData.sources || [],
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ],
            }));
          } else if (eventType === 'error') {
            set({ lastFailedQuery: textToSend });
          }
        }
      }
    } catch (err) {
      // Fallback if server is undergoing reboot
      set((state) => ({
        lastFailedQuery: textToSend,
        messages: [
          ...state.messages,
          {
            id: agentMsgId,
            sender: 'agent',
            text: `Agent Error: ${err.message || 'Unable to connect to SSE stream'}. Please check backend connection.`,
            components: [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ],
      }));
    } finally {
      set({ isStreaming: false, activeTools: [] });
    }
  },

  retryLastQuery: () => {
    const failed = get().lastFailedQuery;
    if (failed) {
      get().sendQuery(failed);
    }
  },
}));
