import {StrictMode, useLayoutEffect} from 'react';
import {createRoot} from 'react-dom/client';
import type { Language } from './types';
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

export function mount(region: { country: string; language: Language }) {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <AuthProvider>
        <SettingsProvider region={region}>
          <App />
          <AppReady />
        </SettingsProvider>
      </AuthProvider>
    </StrictMode>,
  );
}
