import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#613c48ff',
              color: '#F8FAFC',
              border: '1px solid #4a481eff',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              borderRadius: '0.375rem',
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
