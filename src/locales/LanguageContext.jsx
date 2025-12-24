import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import it from './it'
import en from './en'
import es from './es'
import fr from './fr'

// Available languages
const languages = { it, en, es, fr }

// Language metadata
export const languageInfo = {
    it: { name: 'Italiano', flag: '🇮🇹' },
    en: { name: 'English', flag: '🇬🇧' },
    es: { name: 'Español', flag: '🇪🇸' },
    fr: { name: 'Français', flag: '🇫🇷' }
}
const STORAGE_KEY = 'diarioPesca_language'

// Create context
const LanguageContext = createContext()

/**
 * Language Provider component
 */
export const LanguageProvider = ({ children }) => {
    // Load saved language or default to Italian
    const [language, setLanguageState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved && languages[saved] ? saved : 'it'
        } catch {
            return 'it'
        }
    })

    // Get current translations
    const translations = languages[language] || languages.it

    // Change language function
    const setLanguage = useCallback((lang) => {
        if (languages[lang]) {
            setLanguageState(lang)
            try {
                localStorage.setItem(STORAGE_KEY, lang)
            } catch (e) {
                console.error('Error saving language preference:', e)
            }
        }
    }, [])

    // Toggle between IT and EN
    const toggleLanguage = useCallback(() => {
        setLanguage(language === 'it' ? 'en' : 'it')
    }, [language, setLanguage])

    /**
     * Get translation by key path (e.g., 'session.title')
     * Supports interpolation with {placeholder} syntax
     */
    const t = useCallback((key, params = {}) => {
        const keys = key.split('.')
        let value = translations

        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k]
            } else {
                // Key not found, return the key itself
                console.warn(`Translation key not found: ${key}`)
                return key
            }
        }

        // If it's not a string, return the key
        if (typeof value !== 'string') {
            return key
        }

        // Replace placeholders {name} with params
        return value.replace(/\{(\w+)\}/g, (match, name) => {
            return params[name] !== undefined ? params[name] : match
        })
    }, [translations])

    const value = {
        language,
        setLanguage,
        toggleLanguage,
        t,
        translations,
        availableLanguages: Object.keys(languages),
        languageInfo
    }

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    )
}

/**
 * Hook to use translations
 */
export const useTranslation = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useTranslation must be used within a LanguageProvider')
    }
    return context
}

export default LanguageContext
