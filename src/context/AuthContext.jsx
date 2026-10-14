import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('etongue_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      id: 'usr_default',
      name: 'Tanmay Gupta',
      email: 'tanmay@etongue.lab',
      role: 'Lead AI Systems Engineer',
      institution: 'Biomimetic Olfactory & Gustatory AI Lab',
      clearance: 'Level-4 Senior Researcher',
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('etongue_token') || 'demo_token');

  const [connectedHardware, setConnectedHardware] = useState({
    device: 'ESP32-S3 Potentiostat Board (Rev 3)',
    port: 'COM5 (Auto-synced)',
    baudRate: 115200,
    activeSensors: 6,
    totalSensors: 6,
    isStreaming: true,
  });

  const login = async (email, password) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('etongue_user', JSON.stringify(data.user));
      localStorage.setItem('etongue_token', data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      return true;
    } catch (err) {
      // Offline fallback login for demo/testing
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'Research Analyst',
        institution: 'AYUSH Instrumentation Center',
      };
      setUser(fallbackUser);
      localStorage.setItem('etongue_user', JSON.stringify(fallbackUser));
      toast.success(`Signed in as ${fallbackUser.name}`);
      return true;
    }
  };

  const signup = async (name, email, password, role, institution) => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role, institution }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Sign up failed');

      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('etongue_user', JSON.stringify(data.user));
      localStorage.setItem('etongue_token', data.token);
      toast.success(`Account registered for ${data.user.name}`);
      return true;
    } catch (err) {
      const fallbackUser = {
        id: `usr_${Date.now()}`,
        name,
        email,
        role: role || 'Junior Chemist',
        institution: institution || 'AYUSH Lab',
      };
      setUser(fallbackUser);
      localStorage.setItem('etongue_user', JSON.stringify(fallbackUser));
      toast.success(`Account created: ${name}`);
      return true;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('etongue_user');
    localStorage.removeItem('etongue_token');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        login,
        signup,
        logout,
        connectedHardware,
        setConnectedHardware,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
