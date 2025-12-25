import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { ToastProvider } from './components/Toast'
import { LanguageProvider } from './locales/LanguageContext'
import { UnitsProvider } from './locales/UnitsContext'
import { AdProvider } from './contexts/AdContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LanguageProvider>
      <UnitsProvider>
        <AdProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AdProvider>
      </UnitsProvider>
    </LanguageProvider>
  </React.StrictMode>
)
