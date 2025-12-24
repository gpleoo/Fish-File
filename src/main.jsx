import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastProvider } from './components/Toast'
import { LanguageProvider } from './locales/LanguageContext'
import { UnitsProvider } from './locales/UnitsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <UnitsProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </UnitsProvider>
    </LanguageProvider>
  </React.StrictMode>
)
