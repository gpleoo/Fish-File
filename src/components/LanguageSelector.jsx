import React from 'react'
import { useTranslation } from '../locales/LanguageContext'

/**
 * Language toggle button (IT/EN)
 */
const LanguageSelector = () => {
    const { language, toggleLanguage } = useTranslation()

    return (
        <button
            onClick={toggleLanguage}
            className="fixed bottom-4 left-4 z-40 bg-gray-800 border border-gray-600 rounded-full px-3 py-2 flex items-center gap-2 text-sm font-bold shadow-lg active:bg-gray-700 transition-colors"
            aria-label="Change language"
        >
            <span className={`${language === 'it' ? 'text-cyan-400' : 'text-gray-500'}`}>
                IT
            </span>
            <span className="text-gray-600">/</span>
            <span className={`${language === 'en' ? 'text-cyan-400' : 'text-gray-500'}`}>
                EN
            </span>
        </button>
    )
}

export default LanguageSelector
