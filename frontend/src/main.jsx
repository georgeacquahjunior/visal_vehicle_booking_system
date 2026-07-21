import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import initAnalytics from './utils/initAnalytics'

const GA_ID = import.meta.env.VITE_GA_ID;
if (GA_ID) {
  const s1 = document.createElement('script');
  s1.async = true;
  s1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(s1);

  const s2 = document.createElement('script');
  s2.innerHTML = `\n    window.dataLayer = window.dataLayer || [];\n    function gtag(){dataLayer.push(arguments);}\n    gtag('js', new Date());\n    gtag('config', '${GA_ID}', { send_page_view: false });\n  `;
  document.head.appendChild(s2);

  // initialize auto-tracking helpers
  initAnalytics();
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
