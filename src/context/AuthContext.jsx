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

  const sendOtp = async (email) => {
    const res = await fetch('http://localhost:5000/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch verification code');
    }
    return data;
  };

  const verifyOtp = async (email, otp) => {
    const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'OTP verification failed');
    }
    return data;
  };

  const login = async (email, password) => {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Laboratory authentication failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('etongue_user', JSON.stringify(data.user));
    localStorage.setItem('etongue_token', data.token);
    toast.success(`Welcome back, ${data.user.name}!`);
    return true;
  };

  const signup = async (name, email, password, role, institution, otp) => {
    const res = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role, institution, otp }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Sign up registration failed');
    }

    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('etongue_user', JSON.stringify(data.user));
    localStorage.setItem('etongue_token', data.token);
    toast.success(`Account registered for ${data.user.name}`);
    return true;
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
        sendOtp,
        verifyOtp,
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
