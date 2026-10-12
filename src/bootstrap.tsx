import {StrictMode, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import './index.css';

function AppReady() {
  useLayoutEffect(() => {
    delete document.documentElement.dataset.appLoading;
    document.getElementById('app-loading')?.remove();
  }, []);
  return null;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <App />
        <AppReady />
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>,
);
