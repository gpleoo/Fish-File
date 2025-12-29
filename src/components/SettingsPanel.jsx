import React, { useState, useEffect, useRef } from 'react'
import { Settings, X, Download, Upload, RefreshCw, HardDrive, Trash2, ChevronDown, ChevronUp, Shield, FileText, ExternalLink, MapPin, Mic } from './Icons'
import { useToast } from './Toast'
import { useTranslation } from '../locales/LanguageContext'
import { useUnits, unitOptions } from '../locales/UnitsContext'
import {
    exportBackupToFile,
    importBackupFromFile,
    saveAutoBackup,
    getBackupHistory,
    deleteBackupFromHistory,
    getDataSize,
    saveToGoogleDrive,
    saveToDropbox
} from '../utils/backupService'

// Privacy Policy URL - Replace with your actual URL when available
const PRIVACY_POLICY_URL = 'https://gpleoo.github.io/Fish-File/privacy-policy.html'
const TERMS_OF_SERVICE_URL = 'https://gpleoo.github.io/Fish-File/terms-of-service.html'

const SettingsPanel = ({ onDataRestored }) => {
    const { t, language, setLanguage, availableLanguages, languageInfo } = useTranslation()
    const { units, setUnit } = useUnits()
    const toast = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const fileInputRef = useRef(null)
    const importDataRef = useRef(null)
    const panelRef = useRef(null)

    // Backup state
    const [backupHistory, setBackupHistory] = useState([])
    const [dataSize, setDataSize] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)

    // PWA Install state
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [canInstall, setCanInstall] = useState(false)

    // Privacy state
    const [showPrivacy, setShowPrivacy] = useState(false)
    const [showLanguage, setShowLanguage] = useState(false)
    const [showUnits, setShowUnits] = useState(false)
    const [showBackup, setShowBackup] = useState(false)
    const [locationConsent, setLocationConsent] = useState(() => {
        return localStorage.getItem('consent_location') === 'true'
    })
    const [microphoneConsent, setMicrophoneConsent] = useState(() => {
        return localStorage.getItem('consent_microphone') === 'true'
    })
    const [microphoneBlocked, setMicrophoneBlocked] = useState(false)
    const [locationBlocked, setLocationBlocked] = useState(false)

    // Check actual browser permission state when panel opens
    useEffect(() => {
        if (isOpen && navigator.permissions) {
            // Check microphone permission
            navigator.permissions.query({ name: 'microphone' }).then(status => {
                if (status.state === 'denied') {
                    setMicrophoneBlocked(true)
                    setMicrophoneConsent(false)
                    localStorage.setItem('consent_microphone', 'false')
                } else {
                    setMicrophoneBlocked(false)
                }
            }).catch(() => {})

            // Check location permission
            navigator.permissions.query({ name: 'geolocation' }).then(status => {
                if (status.state === 'denied') {
                    setLocationBlocked(true)
                    setLocationConsent(false)
                    localStorage.setItem('consent_location', 'false')
                } else {
                    setLocationBlocked(false)
                }
            }).catch(() => {})
        }
    }, [isOpen])

    // Load backup history and data size
    useEffect(() => {
        if (isOpen) {
            setBackupHistory(getBackupHistory())
            setDataSize(getDataSize())
        }
    }, [isOpen])

    // PWA Install setup
    useEffect(() => {
        const handleBeforeInstall = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setCanInstall(true)
        }

        const handleAppInstalled = () => {
            setDeferredPrompt(null)
            setCanInstall(false)
            toast.success(t('settings.appInstalled'))
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        if (window.matchMedia('(display-mode: standalone)').matches) {
            setCanInstall(false)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [toast, t])

    // Close panel when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isOpen])

    // PWA Install handler
    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setDeferredPrompt(null)
            setCanInstall(false)
        }
    }

    // Backup handlers
    const handleLocalBackup = () => {
        try {
            setIsLoading(true)
            const result = exportBackupToFile()
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.exportSuccess', { catture: result.catture, sessioni: result.sessioni }))
        } catch (error) {
            toast.error(t('backup.exportError'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileImport = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const conferma = window.confirm(t('backup.restoreConfirm'))
        if (!conferma) {
            event.target.value = ''
            return
        }

        try {
            setIsLoading(true)
            const result = await importBackupFromFile(file)
            toast.success(t('backup.restoreSuccess', { catture: result.catture, sessioni: result.sessioni }))

            if (onDataRestored) {
                onDataRestored()
            }

            setBackupHistory(getBackupHistory())
            setDataSize(getDataSize())
        } catch (error) {
            toast.error(t('backup.restoreError'))
        } finally {
            setIsLoading(false)
            // Reset input to allow re-importing same file
            try {
                event.target.value = ''
            } catch (e) {
                // Fallback for browsers that don't allow direct value reset
                event.target.type = 'text'
                event.target.type = 'file'
            }
        }
    }

    const handleAutoBackup = () => {
        try {
            setIsLoading(true)
            const result = saveAutoBackup()
            if (result) {
                setBackupHistory(getBackupHistory())
                toast.success(t('backup.autoBackupSuccess'))
            } else {
                toast.error(t('backup.autoBackupError'))
            }
        } catch (error) {
            toast.error(t('backup.autoBackupError'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleDrive = () => {
        try {
            setIsLoading(true)
            saveToGoogleDrive()
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.cloudInstructions'))
        } catch (error) {
            toast.error(t('backup.cloudError'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleDropbox = () => {
        try {
            setIsLoading(true)
            saveToDropbox()
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.cloudInstructions'))
        } catch (error) {
            toast.error(t('backup.cloudError'))
        } finally {
            setIsLoading(false)
        }
    }

    const handleDeleteBackup = (backupId) => {
        if (window.confirm(t('backup.deleteConfirm'))) {
            deleteBackupFromHistory(backupId)
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.deleted'))
        }
    }

    // Privacy handlers
    const handleLocationConsentToggle = async () => {
        if (!locationConsent) {
            // Request permission
            try {
                const result = await navigator.permissions.query({ name: 'geolocation' })
                if (result.state === 'denied') {
                    toast.error(t('privacy.permissionBlocked'), { duration: 5000 })
                    return
                }
                navigator.geolocation.getCurrentPosition(
                    () => {
                        setLocationConsent(true)
                        localStorage.setItem('consent_location', 'true')
                        toast.success(t('privacy.consentGranted'))
                    },
                    (err) => {
                        if (err.code === err.PERMISSION_DENIED) {
                            toast.error(t('privacy.permissionBlocked'), { duration: 5000 })
                        } else {
                            toast.error(t('privacy.consentDenied'))
                        }
                    }
                )
            } catch {
                // Fallback for browsers without permissions API
                navigator.geolocation.getCurrentPosition(
                    () => {
                        setLocationConsent(true)
                        localStorage.setItem('consent_location', 'true')
                        toast.success(t('privacy.consentGranted'))
                    },
                    () => {
                        toast.error(t('privacy.consentDenied'))
                    }
                )
            }
        } else {
            setLocationConsent(false)
            localStorage.setItem('consent_location', 'false')
            toast.info(t('privacy.consentRevoked'))
        }
    }

    const handleMicrophoneConsentToggle = async () => {
        if (!microphoneConsent) {
            // Request permission
            try {
                // Check if mediaDevices is available
                if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                    toast.error('Il tuo browser non supporta l\'accesso al microfono')
                    return
                }

                // Try to get microphone access directly
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                stream.getTracks().forEach(track => track.stop())
                setMicrophoneConsent(true)
                setMicrophoneBlocked(false)
                localStorage.setItem('consent_microphone', 'true')
                toast.success(t('privacy.consentGranted'))
            } catch (err) {
                console.error('Microphone permission error:', err.name, err.message)

                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setMicrophoneBlocked(true)
                    toast.error(t('privacy.permissionBlocked'), { duration: 5000 })
                } else if (err.name === 'NotFoundError') {
                    toast.error('Nessun microfono trovato sul dispositivo')
                } else if (err.name === 'NotReadableError' || err.name === 'AbortError') {
                    toast.error('Microfono già in uso da un\'altra applicazione')
                } else {
                    toast.error(`Errore microfono: ${err.message || err.name}`)
                }
            }
        } else {
            setMicrophoneConsent(false)
            localStorage.setItem('consent_microphone', 'false')
            toast.info(t('privacy.consentRevoked'))
        }
    }

    const handleExportUserData = () => {
        try {
            // Collect all user data from localStorage
            const userData = {
                exportDate: new Date().toISOString(),
                appVersion: '1.0',
                data: {
                    catture: JSON.parse(localStorage.getItem('diarioPesca_catture') || '[]'),
                    sessioni: JSON.parse(localStorage.getItem('diarioPesca_sessioniCompletate') || '[]'),
                    specieMemorizzate: JSON.parse(localStorage.getItem('diarioPesca_specie') || '[]'),
                    escheMemorizzate: JSON.parse(localStorage.getItem('diarioPesca_esche') || '[]'),
                    localitaMemorizzate: JSON.parse(localStorage.getItem('diarioPesca_localita') || '[]'),
                    canneMemorizzate: JSON.parse(localStorage.getItem('diarioPesca_canne') || '[]'),
                    traviMemorizzate: JSON.parse(localStorage.getItem('diarioPesca_travi') || '[]'),
                    amiMemorizzati: JSON.parse(localStorage.getItem('diarioPesca_ami') || '[]'),
                    piombiMemorizzati: JSON.parse(localStorage.getItem('diarioPesca_piombi') || '[]'),
                    noteMemorizzate: JSON.parse(localStorage.getItem('diarioPesca_note') || '[]')
                },
                consents: {
                    location: localStorage.getItem('consent_location') === 'true',
                    microphone: localStorage.getItem('consent_microphone') === 'true'
                },
                settings: {
                    language: localStorage.getItem('fishFileLanguage') || 'it'
                }
            }

            // Create and download file
            const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `fish-file-my-data-${new Date().toISOString().split('T')[0]}.json`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            URL.revokeObjectURL(url)

            toast.success(t('privacy.exportSuccess'))
        } catch (error) {
            console.error('Export error:', error)
            toast.error('Errore durante l\'esportazione')
        }
    }

    const handleImportUserData = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const importedData = JSON.parse(e.target.result)

                // Check if it's our format or the old analysis format
                let dataToImport = importedData.data || importedData

                // Validate that we have at least catture
                if (!dataToImport.catture || !Array.isArray(dataToImport.catture)) {
                    toast.error(t('privacy.invalidFile'))
                    return
                }

                // Confirm import
                const conferma = window.confirm(
                    t('privacy.importConfirm', { count: dataToImport.catture.length })
                )

                if (!conferma) return

                // Import data into localStorage with correct keys
                if (dataToImport.catture) {
                    localStorage.setItem('diarioPesca_catture', JSON.stringify(dataToImport.catture))
                }
                if (dataToImport.sessioni) {
                    localStorage.setItem('diarioPesca_sessioniCompletate', JSON.stringify(dataToImport.sessioni))
                }
                if (dataToImport.specieMemorizzate || dataToImport.specie) {
                    localStorage.setItem('diarioPesca_specie', JSON.stringify(dataToImport.specieMemorizzate || dataToImport.specie))
                }
                if (dataToImport.escheMemorizzate || dataToImport.esche) {
                    localStorage.setItem('diarioPesca_esche', JSON.stringify(dataToImport.escheMemorizzate || dataToImport.esche))
                }
                if (dataToImport.localitaMemorizzate || dataToImport.localita) {
                    localStorage.setItem('diarioPesca_localita', JSON.stringify(dataToImport.localitaMemorizzate || dataToImport.localita))
                }
                if (dataToImport.canneMemorizzate || dataToImport.attrezzature?.canne) {
                    localStorage.setItem('diarioPesca_canne', JSON.stringify(dataToImport.canneMemorizzate || dataToImport.attrezzature?.canne))
                }
                if (dataToImport.traviMemorizzate || dataToImport.attrezzature?.travi) {
                    localStorage.setItem('diarioPesca_travi', JSON.stringify(dataToImport.traviMemorizzate || dataToImport.attrezzature?.travi))
                }
                if (dataToImport.amiMemorizzati || dataToImport.attrezzature?.ami) {
                    localStorage.setItem('diarioPesca_ami', JSON.stringify(dataToImport.amiMemorizzati || dataToImport.attrezzature?.ami))
                }
                if (dataToImport.piombiMemorizzati || dataToImport.attrezzature?.piombi) {
                    localStorage.setItem('diarioPesca_piombi', JSON.stringify(dataToImport.piombiMemorizzati || dataToImport.attrezzature?.piombi))
                }

                toast.success(t('privacy.importSuccess', { count: dataToImport.catture.length }))

                // Reload app to reflect changes
                if (onDataRestored) {
                    onDataRestored()
                }

                setDataSize(getDataSize())
            } catch (err) {
                console.error('Import error:', err)
                toast.error(t('privacy.importError'))
            }
        }
        reader.readAsText(file)

        // Reset input
        try {
            event.target.value = ''
        } catch (e) {
            event.target.type = 'text'
            event.target.type = 'file'
        }
    }

    const handleDeleteAllData = () => {
        // First confirmation
        if (!window.confirm(t('privacy.deleteConfirm'))) {
            toast.info(t('privacy.deleteCancelled'))
            return
        }

        // Second confirmation with typed input
        const confirmText = language === 'it' ? 'ELIMINA' : 'DELETE'
        const userInput = window.prompt(t('privacy.deleteConfirmFinal'))

        if (userInput !== confirmText) {
            toast.info(t('privacy.deleteCancelled'))
            return
        }

        // Delete all data - use correct prefixed keys
        const keysToDelete = [
            'diarioPesca_catture',
            'diarioPesca_specie',
            'diarioPesca_esche',
            'diarioPesca_localita',
            'diarioPesca_note',
            'diarioPesca_canne',
            'diarioPesca_travi',
            'diarioPesca_ami',
            'diarioPesca_piombi',
            'diarioPesca_sessioneAttiva',
            'diarioPesca_datiSessione',
            'diarioPesca_sessioneCorrente',
            'diarioPesca_sessioniCompletate',
            'backupHistory',
            'consent_location',
            'consent_microphone'
        ]

        keysToDelete.forEach(key => localStorage.removeItem(key))

        // Reset state
        setLocationConsent(false)
        setMicrophoneConsent(false)
        setBackupHistory([])
        setDataSize('0 KB')

        toast.success(t('privacy.deleteSuccess'))

        // Reload app after short delay
        setTimeout(() => {
            if (onDataRestored) {
                onDataRestored()
            }
            window.location.reload()
        }, 1500)
    }

    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleString(language === 'it' ? 'it-IT' : 'en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            })
        } catch {
            return dateString
        }
    }

    const getBackupTypeIcon = (type) => {
        switch (type) {
            case 'google_drive': return '🌐'
            case 'dropbox': return '📦'
            case 'auto': return '🔄'
            default: return '💾'
        }
    }

    const getBackupTypeName = (type) => {
        switch (type) {
            case 'google_drive': return 'Google Drive'
            case 'dropbox': return 'Dropbox'
            case 'auto': return t('backup.auto')
            default: return t('backup.local')
        }
    }

    return (
        <>
            {/* Settings Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 left-4 z-40 bg-gray-800 border-2 border-cyan-500 rounded-full p-3 shadow-lg active:bg-gray-700 transition-colors"
                aria-label={t('settings.title')}
            >
                <Settings className="w-6 h-6 text-cyan-400" />
            </button>

            {/* Settings Panel Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center">
                    <div
                        ref={panelRef}
                        className="bg-gray-900 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl border-t-2 sm:border-2 border-cyan-500 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-cyan-400 flex items-center gap-2">
                                <Settings className="w-6 h-6" />
                                {t('settings.title')}
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-gray-400 active:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Language Section */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <button
                                    onClick={() => setShowLanguage(!showLanguage)}
                                    className="w-full flex items-center justify-between"
                                >
                                    <h3 className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                                        <span>🌍</span>
                                        {t('settings.language')}
                                        <span className="text-gray-500 text-xs font-normal">({languageInfo[language]?.flag} {language.toUpperCase()})</span>
                                    </h3>
                                    {showLanguage ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                {showLanguage && (
                                    <div className="grid grid-cols-4 gap-2 mt-4">
                                        {availableLanguages.map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => setLanguage(lang)}
                                                className={`py-2.5 px-2 rounded-lg font-bold text-xs transition-colors flex flex-col items-center gap-1 ${
                                                    language === lang
                                                        ? 'bg-cyan-600 text-white'
                                                        : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                                }`}
                                            >
                                                <span className="text-lg">{languageInfo[lang]?.flag}</span>
                                                <span>{lang.toUpperCase()}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Units Section */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <button
                                    onClick={() => setShowUnits(!showUnits)}
                                    className="w-full flex items-center justify-between"
                                >
                                    <h3 className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                                        <span>📏</span>
                                        {t('units.title')}
                                    </h3>
                                    {showUnits ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                {showUnits && (
                                    <div className="space-y-4 mt-4">
                                        {/* Weight */}
                                        <div>
                                            <p className="text-gray-400 text-xs mb-2">{t('units.weight')}</p>
                                            <div className="flex gap-2">
                                                {unitOptions.weight.map((unit) => (
                                                    <button
                                                        key={unit}
                                                        onClick={() => setUnit('weight', unit)}
                                                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${
                                                            units.weight === unit
                                                                ? 'bg-cyan-600 text-white'
                                                                : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                                        }`}
                                                    >
                                                        {unit}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Length */}
                                        <div>
                                            <p className="text-gray-400 text-xs mb-2">{t('units.length')}</p>
                                            <div className="flex gap-2">
                                                {unitOptions.length.map((unit) => (
                                                    <button
                                                        key={unit}
                                                        onClick={() => setUnit('length', unit)}
                                                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${
                                                            units.length === unit
                                                                ? 'bg-cyan-600 text-white'
                                                                : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                                        }`}
                                                    >
                                                        {unit}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Temperature */}
                                        <div>
                                            <p className="text-gray-400 text-xs mb-2">{t('units.temperature')}</p>
                                            <div className="flex gap-2">
                                                {unitOptions.temperature.map((unit) => (
                                                    <button
                                                        key={unit}
                                                        onClick={() => setUnit('temperature', unit)}
                                                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${
                                                            units.temperature === unit
                                                                ? 'bg-cyan-600 text-white'
                                                                : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                                        }`}
                                                    >
                                                        °{unit}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Time Format */}
                                        <div>
                                            <p className="text-gray-400 text-xs mb-2">{t('units.timeFormat')}</p>
                                            <div className="flex gap-2">
                                                {unitOptions.timeFormat.map((format) => (
                                                    <button
                                                        key={format}
                                                        onClick={() => setUnit('timeFormat', format)}
                                                        className={`flex-1 py-2 px-3 rounded-lg font-bold text-sm transition-colors ${
                                                            units.timeFormat === format
                                                                ? 'bg-cyan-600 text-white'
                                                                : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                                        }`}
                                                    >
                                                        {format}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Date Format */}
                                        <div>
                                            <p className="text-gray-400 text-xs mb-2">{t('units.dateFormat')}</p>
                                            <div className="flex gap-2">
                                                {unitOptions.dateFormat.map((format) => (
                                                    <button
                                                        key={format}
                                                        onClick={() => setUnit('dateFormat', format)}
                                                        className={`flex-1 py-1.5 px-1 rounded-lg font-bold text-xs transition-colors ${
                                                            units.dateFormat === format
                                                                ? 'bg-cyan-600 text-white'
                                                                : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                                        }`}
                                                    >
                                                        {format.replace('/YYYY', '')}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Backup Section */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <button
                                    onClick={() => setShowBackup(!showBackup)}
                                    className="w-full flex items-center justify-between"
                                >
                                    <h3 className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                                        <span>💾</span>
                                        {t('backup.title')}
                                    </h3>
                                    {showBackup ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                {showBackup && (
                                    <div className="mt-4">
                                        {/* Data Size */}
                                        <div className="bg-gray-900 rounded-lg p-3 mb-4 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <HardDrive className="w-5 h-5 text-cyan-400" />
                                                <span className="text-gray-300 text-sm">{t('backup.dataSize')}</span>
                                            </div>
                                            <span className="text-cyan-400 font-bold">{dataSize}</span>
                                        </div>

                                        {/* Local Backup */}
                                        <div className="mb-4">
                                    <p className="text-gray-400 text-xs mb-2">{t('backup.localBackup')}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleLocalBackup}
                                            disabled={isLoading}
                                            className="flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 px-3 rounded-lg font-bold text-sm active:bg-green-700 disabled:opacity-50"
                                        >
                                            <Download className="w-4 h-4" />
                                            {t('backup.export')}
                                        </button>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isLoading}
                                            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-3 rounded-lg font-bold text-sm active:bg-blue-700 disabled:opacity-50"
                                        >
                                            <Upload className="w-4 h-4" />
                                            {t('backup.import')}
                                        </button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".json"
                                        onChange={handleFileImport}
                                        className="hidden"
                                    />
                                </div>

                                {/* Auto Backup */}
                                <div className="mb-4">
                                    <button
                                        onClick={handleAutoBackup}
                                        disabled={isLoading}
                                        className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-2.5 px-3 rounded-lg font-bold text-sm active:bg-purple-700 disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        {t('backup.createAutoBackup')}
                                    </button>
                                    <p className="text-gray-500 text-xs mt-1 text-center">{t('backup.autoBackupHint')}</p>
                                </div>

                                {/* Cloud Backup */}
                                <div className="mb-4">
                                    <p className="text-gray-400 text-xs mb-2">{t('backup.cloudBackup')}</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleGoogleDrive}
                                            disabled={isLoading}
                                            className="flex items-center justify-center gap-2 bg-white text-gray-800 py-2.5 px-3 rounded-lg font-bold text-sm active:bg-gray-100 disabled:opacity-50 border border-gray-300"
                                        >
                                            <span>🌐</span>
                                            Google Drive
                                        </button>
                                        <button
                                            onClick={handleDropbox}
                                            disabled={isLoading}
                                            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2.5 px-3 rounded-lg font-bold text-sm active:bg-blue-600 disabled:opacity-50"
                                        >
                                            <span>📦</span>
                                            Dropbox
                                        </button>
                                    </div>
                                    <p className="text-gray-500 text-xs mt-1 text-center">{t('backup.cloudHint')}</p>
                                </div>

                                {/* Backup History */}
                                {backupHistory.length > 0 && (
                                    <div className="border-t border-gray-700 pt-3">
                                        <button
                                            onClick={() => setShowHistory(!showHistory)}
                                            className="w-full flex items-center justify-between mb-2"
                                        >
                                            <span className="text-gray-400 text-xs">
                                                {t('backup.history')} ({backupHistory.length})
                                            </span>
                                            {showHistory ? (
                                                <ChevronUp className="w-4 h-4 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-4 h-4 text-gray-400" />
                                            )}
                                        </button>

                                            {showHistory && (
                                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                                    {backupHistory.map((backup) => (
                                                        <div
                                                            key={backup.id}
                                                            className="bg-gray-900 rounded-lg p-2 flex items-center justify-between text-xs"
                                                        >
                                                            <div className="flex items-center gap-2">
                                                                <span>{getBackupTypeIcon(backup.type)}</span>
                                                                <div>
                                                                    <p className="text-white font-medium">{getBackupTypeName(backup.type)}</p>
                                                                    <p className="text-gray-500">{formatDate(backup.date)}</p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => handleDeleteBackup(backup.id)}
                                                                className="text-red-400 p-1"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    </div>
                                )}
                            </div>

                            {/* Install App Section */}
                            {canInstall && (
                                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                    <h3 className="text-cyan-400 font-semibold mb-3 text-sm">{t('settings.installApp')}</h3>
                                    <button
                                        onClick={handleInstall}
                                        className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white py-3 px-4 rounded-lg font-bold active:bg-cyan-700"
                                    >
                                        <Download className="w-5 h-5" />
                                        {t('settings.installButton')}
                                    </button>
                                    <p className="text-gray-500 text-xs mt-2 text-center">{t('settings.installHint')}</p>
                                </div>
                            )}

                            {/* Privacy Section */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <button
                                    onClick={() => setShowPrivacy(!showPrivacy)}
                                    className="w-full flex items-center justify-between"
                                >
                                    <h3 className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                                        <Shield className="w-5 h-5" />
                                        {t('privacy.title')}
                                    </h3>
                                    {showPrivacy ? (
                                        <ChevronUp className="w-5 h-5 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>

                                {showPrivacy && (
                                    <div className="mt-4 space-y-4">
                                        {/* Legal Documents */}
                                        <div className="space-y-2">
                                            <a
                                                href={PRIVACY_POLICY_URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between bg-gray-900 rounded-lg p-3 active:bg-gray-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-cyan-400" />
                                                    <span className="text-white text-sm">{t('privacy.privacyPolicy')}</span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </a>
                                            <a
                                                href={TERMS_OF_SERVICE_URL}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center justify-between bg-gray-900 rounded-lg p-3 active:bg-gray-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-cyan-400" />
                                                    <span className="text-white text-sm">{t('privacy.termsOfService')}</span>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-400" />
                                            </a>
                                        </div>

                                        {/* Consents */}
                                        <div className="border-t border-gray-700 pt-4">
                                            <p className="text-gray-400 text-xs mb-3">{t('privacy.consents')}</p>

                                            {/* Location Consent */}
                                            <div className={`flex items-center justify-between rounded-xl p-4 mb-3 ${locationBlocked ? 'bg-red-900/20 border border-red-500/30' : 'bg-gray-900'}`}>
                                                <div className="flex items-center gap-3 flex-1 mr-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${locationBlocked ? 'bg-red-500/20' : locationConsent ? 'bg-green-500/20' : 'bg-gray-700'}`}>
                                                        <MapPin className={`w-5 h-5 ${locationBlocked ? 'text-red-400' : locationConsent ? 'text-green-400' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white text-sm font-medium">{t('privacy.locationConsent')}</p>
                                                        {locationBlocked ? (
                                                            <p className="text-red-400 text-xs mt-0.5">{t('privacy.permissionBlocked')}</p>
                                                        ) : (
                                                            <p className="text-gray-500 text-xs mt-0.5">{t('privacy.locationDescription')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleLocationConsentToggle}
                                                    disabled={locationBlocked}
                                                    className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
                                                        locationBlocked
                                                            ? 'bg-red-500/50 cursor-not-allowed'
                                                            : locationConsent
                                                                ? 'bg-green-500 shadow-lg shadow-green-500/30'
                                                                : 'bg-gray-600'
                                                    }`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                                                        locationConsent ? 'left-7' : 'left-1'
                                                    }`} />
                                                </button>
                                            </div>

                                            {/* Microphone Consent */}
                                            <div className={`flex items-center justify-between rounded-xl p-4 ${microphoneBlocked ? 'bg-red-900/20 border border-red-500/30' : 'bg-gray-900'}`}>
                                                <div className="flex items-center gap-3 flex-1 mr-4">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${microphoneBlocked ? 'bg-red-500/20' : microphoneConsent ? 'bg-purple-500/20' : 'bg-gray-700'}`}>
                                                        <Mic className={`w-5 h-5 ${microphoneBlocked ? 'text-red-400' : microphoneConsent ? 'text-purple-400' : 'text-gray-400'}`} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-white text-sm font-medium">{t('privacy.microphoneConsent')}</p>
                                                        {microphoneBlocked ? (
                                                            <p className="text-red-400 text-xs mt-0.5">{t('privacy.permissionBlocked')}</p>
                                                        ) : (
                                                            <p className="text-gray-500 text-xs mt-0.5">{t('privacy.microphoneDescription')}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={handleMicrophoneConsentToggle}
                                                    disabled={microphoneBlocked}
                                                    className={`relative w-14 h-8 rounded-full transition-all duration-300 flex-shrink-0 ${
                                                        microphoneBlocked
                                                            ? 'bg-red-500/50 cursor-not-allowed'
                                                            : microphoneConsent
                                                                ? 'bg-purple-500 shadow-lg shadow-purple-500/30'
                                                                : 'bg-gray-600'
                                                    }`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
                                                        microphoneConsent ? 'left-7' : 'left-1'
                                                    }`} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Data Management */}
                                        <div className="border-t border-gray-700 pt-4 space-y-2">
                                            <button
                                                onClick={handleExportUserData}
                                                className="w-full flex items-center justify-between bg-gray-900 rounded-lg p-3 active:bg-gray-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Download className="w-5 h-5 text-blue-400" />
                                                    <div className="text-left">
                                                        <p className="text-white text-sm">{t('privacy.exportData')}</p>
                                                        <p className="text-gray-500 text-xs">{t('privacy.exportDataDescription')}</p>
                                                    </div>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                                            </button>

                                            <button
                                                onClick={() => importDataRef.current?.click()}
                                                className="w-full flex items-center justify-between bg-gray-900 rounded-lg p-3 active:bg-gray-700"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Upload className="w-5 h-5 text-green-400" />
                                                    <div className="text-left">
                                                        <p className="text-white text-sm">{t('privacy.importData')}</p>
                                                        <p className="text-gray-500 text-xs">{t('privacy.importDataDescription')}</p>
                                                    </div>
                                                </div>
                                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90" />
                                            </button>
                                            <input
                                                ref={importDataRef}
                                                type="file"
                                                accept=".json"
                                                onChange={handleImportUserData}
                                                className="hidden"
                                            />

                                            <button
                                                onClick={handleDeleteAllData}
                                                className="w-full flex items-center justify-between bg-red-900/30 border border-red-500/30 rounded-lg p-3 active:bg-red-900/50"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Trash2 className="w-5 h-5 text-red-400" />
                                                    <div className="text-left">
                                                        <p className="text-red-400 text-sm font-semibold">{t('privacy.deleteData')}</p>
                                                        <p className="text-red-300/60 text-xs">{t('privacy.deleteDataDescription')}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Version */}
                            <div className="text-center pt-2">
                                <p className="text-gray-600 text-xs">Fish File v1.0 - 2025 Giampietro Leonoro</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default SettingsPanel
