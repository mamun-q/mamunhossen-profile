import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// P-08: offline support — production only (the dev/preview server
// must never be shadowed by a worker). The worker itself is
// network-first for pages, so deploys are never trapped stale.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* offline support is an enhancement, never a blocker */
    });
  });
}
