# E-TONGUE PRO: MULTI-AGENT DEVELOPMENT GUIDELINES
> Shared rules & contract for **Claude Code** (Backend/CLI) and **Antigravity** (Frontend/WebGL/UI).

---

## 🏛️ Architecture & Division of Responsibility

| Tool | Primary Domain | Work Scope |
| :--- | :--- | :--- |
| **Claude Code** | **Backend / Server** (`server/` or `etongue-server/`) | Express/TypeScript, Mongoose models, Zod validation, JWT middleware, SSE `/api/v1/agent/chat`, Nightly batch jobs, Unit & integration tests. |
| **Antigravity** | **Frontend / UI** (`src/`) | React 18, Three.js / R3F WebGL, Lenis, Tailwind, Awwwards-caliber visual design, ChatPanel, GenerativeRenderer, Recharts. |

---

## 🔒 Non-Negotiable Security & LLM Safety Rules

1. **Zod Validation on Every Route**:
   - Every incoming HTTP request body, query parameter, and route parameter must be parsed through a strict Zod schema before hitting controller logic.
2. **LLM Has NO Direct Database Access**:
   - The LLM orchestrator (`src/agent/orchestrator.ts`) can only call predefined, read-only tools with role checks. It NEVER executes raw SQL, Mongoose queries, or writes to collections.
3. **Server Injects Real Data Rows (No Hallucinated Chart Data)**:
   - When the LLM decides to render a chart or card, it returns `{ datasetId, columns, chartType }`. The server/frontend injects real, verified database rows. If a dataset or column does not exist, the component drops safely.
4. **`Sample.notes` is NEVER sent to the LLM**:
   - Free-text notes from technicians/users are sanitized and omitted from LLM prompts to prevent prompt injection vectors.
5. **Git-Centric Workflow**:
   - All code exchanges must occur through git commits on the repository, not zip files or raw pastebins.
   - Commit after every completed phase. Run `tsc` and test suites before committing.

---

## 📡 Core API Contract Summary

- `POST /api/auth/register` & `POST /api/auth/login` (JWT bearer auth, `sub`, `role`)
- `POST /api/samples` (Persist 6-channel potentiostat array + auxiliary pH/TDS/ORP)
- `GET  /api/samples?page=1&limit=10&dravya=tulsi` (Paginated audit ledger)
- `GET  /api/samples/:id` (Full potential curve + SHA-256 monograph)
- `POST /api/predict` (Random Forest inference -> `{ dravya, confidence, top3[] }`)
- `GET  /api/dravya` & `GET /api/dravya/:id` (Standardized Ayurvedic reference monographs)
- `GET  /api/reports/:id/pdf` (ISO-17025 certificate stream)
- `POST /api/v1/agent/chat` (SSE events: `tool_start`, `tool_end`, `final`, `error`)
- `WS   /live` (250 S/s telemetry broadcast + tare command)

---

## 📦 Required Environment Variables (`.env`)

```ini
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/etongue?retryWrites=true&w=majority
JWT_ACCESS_SECRET=etongue_ayurveda_dravya_sih2025_secure_key_98347
LLM_PROVIDER=gemini        # 'gemini' | 'grok'
GEMINI_API_KEY=AIzaSy...
GROK_API_KEY=xai-...
ML_SERVICE_URL=http://localhost:8000
SERIAL_PORT=COM3
SERIAL_BAUD=115200
```
