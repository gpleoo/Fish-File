import React, { useState, useEffect, useRef } from 'react'
import { Settings, X, Download, Upload, RefreshCw, HardDrive, Trash2, ChevronDown, ChevronUp } from './Icons'
import { useToast } from './Toast'
import { useTranslation } from '../locales/LanguageContext'
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

const SettingsPanel = ({ onDataRestored }) => {
    const { t, language, toggleLanguage } = useTranslation()
    const toast = useToast()
    const [isOpen, setIsOpen] = useState(false)
    const fileInputRef = useRef(null)
    const panelRef = useRef(null)

    // Backup state
    const [backupHistory, setBackupHistory] = useState([])
    const [dataSize, setDataSize] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)

    // PWA Install state
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [canInstall, setCanInstall] = useState(false)

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
            event.target.value = ''
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
                                <h3 className="text-cyan-400 font-semibold mb-3 text-sm">{t('settings.language')}</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => language !== 'it' && toggleLanguage()}
                                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                                            language === 'it'
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                        }`}
                                    >
                                        🇮🇹 Italiano
                                    </button>
                                    <button
                                        onClick={() => language !== 'en' && toggleLanguage()}
                                        className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-colors ${
                                            language === 'en'
                                                ? 'bg-cyan-600 text-white'
                                                : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                                        }`}
                                    >
                                        🇬🇧 English
                                    </button>
                                </div>
                            </div>

                            {/* Backup Section */}
                            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                                <h3 className="text-cyan-400 font-semibold mb-3 text-sm">{t('backup.title')}</h3>

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
