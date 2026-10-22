import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import './index.css';
import App from './App.jsx';

// Global safeguard: Intercept console errors & warnings to prevent leaking internal problems,
// database diagnostics, or sensitive administrative information into the browser console.
const SENSITIVE_PATTERNS = [
  /mongo/i,
  /mongoose/i,
  /e11000/i,
  /duplicate key/i,
  /brevo/i,
  /deepak/i,
  /@gmail\.com/i,
  /jwt/i,
  /token/i,
  /secret/i,
  /econnrefused/i,
  /enotfound/i,
  /stack trace/i,
  /internal server/i,
  /uncaught \(in promise\)/i,
  /failed to fetch/i,
  /networkerror/i,
  /database/i,
  /atlas/i,
  /cluster/i,
  /status 500/i,
  /500/i
];

const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  const isInternal = args.some(arg => {
    const text = typeof arg === 'string' ? arg : (arg?.message || arg?.stack || (typeof arg === 'object' ? JSON.stringify(arg) : ''));
    return SENSITIVE_PATTERNS.some(p => p.test(text));
  });
  if (isInternal) {
    return; // Suppress internal sensitive/diagnostic output
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  const isInternal = args.some(arg => {
    const text = typeof arg === 'string' ? arg : (arg?.message || arg?.stack || (typeof arg === 'object' ? JSON.stringify(arg) : ''));
    return SENSITIVE_PATTERNS.some(p => p.test(text));
  });
  if (isInternal) {
    return;
  }
  originalConsoleWarn(...args);
};

if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    const text = event?.message || event?.error?.message || '';
    if (SENSITIVE_PATTERNS.some(p => p.test(text))) {
      event.preventDefault();
    }
  });

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    const text = typeof reason === 'string' ? reason : (reason?.message || reason?.stack || '');
    if (SENSITIVE_PATTERNS.some(p => p.test(text))) {
      event.preventDefault();
    }
  });
}

// Seamlessly route API requests to remote backend in production (e.g., Render)
const API_BASE_URL = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').replace(/\/$/, '');
if (API_BASE_URL && API_BASE_URL !== 'http://localhost:5000' && typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  window.fetch = (url, options) => {
    if (typeof url === 'string' && url.startsWith('/api')) {
      return originalFetch(`${API_BASE_URL}${url}`, options);
    }
    return originalFetch(url, options);
  };
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);


