import React, { useState, useRef, useEffect } from 'react'
import { Cloud, Download, Upload, RefreshCw, Trash2, HardDrive, ChevronDown, ChevronUp } from './Icons'
import Section from './Section'
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

const BackupManager = ({ activeSection, setActiveSection, onDataRestored }) => {
    const { t } = useTranslation()
    const toast = useToast()
    const fileInputRef = useRef(null)

    const [backupHistory, setBackupHistory] = useState([])
    const [dataSize, setDataSize] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showHistory, setShowHistory] = useState(false)

    // Carica cronologia e dimensione dati
    useEffect(() => {
        setBackupHistory(getBackupHistory())
        setDataSize(getDataSize())
    }, [])

    // Aggiorna dimensione dati quando cambia la sezione
    useEffect(() => {
        if (activeSection === 'backup') {
            setDataSize(getDataSize())
            setBackupHistory(getBackupHistory())
        }
    }, [activeSection])

    // Backup locale (file)
    const handleLocalBackup = () => {
        try {
            setIsLoading(true)
            const result = exportBackupToFile()
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.exportSuccess', { catture: result.catture, sessioni: result.sessioni }))
        } catch (error) {
            toast.error(t('backup.exportError'))
            console.error('Backup error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Ripristino da file
    const handleFileImport = async (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        // Conferma ripristino
        const conferma = window.confirm(t('backup.restoreConfirm'))
        if (!conferma) {
            event.target.value = ''
            return
        }

        try {
            setIsLoading(true)
            const result = await importBackupFromFile(file)
            toast.success(t('backup.restoreSuccess', { catture: result.catture, sessioni: result.sessioni }))

            // Notifica App per ricaricare i dati
            if (onDataRestored) {
                onDataRestored()
            }

            setBackupHistory(getBackupHistory())
            setDataSize(getDataSize())
        } catch (error) {
            toast.error(t('backup.restoreError'))
            console.error('Import error:', error)
        } finally {
            setIsLoading(false)
            event.target.value = ''
        }
    }

    // Backup automatico
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
            console.error('Auto backup error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Google Drive
    const handleGoogleDrive = () => {
        try {
            setIsLoading(true)
            const result = saveToGoogleDrive()
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.cloudInstructions'))
        } catch (error) {
            toast.error(t('backup.cloudError'))
            console.error('Google Drive error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Dropbox
    const handleDropbox = () => {
        try {
            setIsLoading(true)
            const result = saveToDropbox()
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.cloudInstructions'))
        } catch (error) {
            toast.error(t('backup.cloudError'))
            console.error('Dropbox error:', error)
        } finally {
            setIsLoading(false)
        }
    }

    // Elimina backup dalla cronologia
    const handleDeleteBackup = (backupId) => {
        if (window.confirm(t('backup.deleteConfirm'))) {
            deleteBackupFromHistory(backupId)
            setBackupHistory(getBackupHistory())
            toast.success(t('backup.deleted'))
        }
    }

    // Formatta data per visualizzazione
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleString('it-IT', {
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

    // Icona per tipo backup
    const getBackupTypeIcon = (type) => {
        switch (type) {
            case 'google_drive':
                return '🌐'
            case 'dropbox':
                return '📦'
            case 'auto':
                return '🔄'
            default:
                return '💾'
        }
    }

    // Nome tipo backup
    const getBackupTypeName = (type) => {
        switch (type) {
            case 'google_drive':
                return 'Google Drive'
            case 'dropbox':
                return 'Dropbox'
            case 'auto':
                return t('backup.auto')
            default:
                return t('backup.local')
        }
    }

    return (
        <Section
            icon={Cloud}
            title={t('backup.title')}
            isActive={activeSection === 'backup'}
            onToggle={() => setActiveSection(activeSection === 'backup' ? null : 'backup')}
        >
            {/* Info dimensione dati */}
            <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-4 border border-gray-700">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HardDrive className="w-5 h-5 text-cyan-400" />
                        <span className="text-gray-300 text-sm">{t('backup.dataSize')}</span>
                    </div>
                    <span className="text-cyan-400 font-bold">{dataSize}</span>
                </div>
            </div>

            {/* Backup Locale */}
            <div className="mb-4">
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm">{t('backup.localBackup')}</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleLocalBackup}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg font-bold active:bg-green-700 disabled:opacity-50 transition-colors"
                    >
                        <Download className="w-5 h-5" />
                        <span className="text-sm">{t('backup.export')}</span>
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg font-bold active:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Upload className="w-5 h-5" />
                        <span className="text-sm">{t('backup.import')}</span>
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

            {/* Backup Automatico */}
            <div className="mb-4">
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm">{t('backup.autoBackup')}</h4>
                <button
                    onClick={handleAutoBackup}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg font-bold active:bg-purple-700 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>{t('backup.createAutoBackup')}</span>
                </button>
                <p className="text-gray-500 text-xs mt-1 text-center">
                    {t('backup.autoBackupHint')}
                </p>
            </div>

            {/* Cloud Backup */}
            <div className="mb-4">
                <h4 className="text-cyan-400 font-semibold mb-2 text-sm">{t('backup.cloudBackup')}</h4>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        onClick={handleGoogleDrive}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-white text-gray-800 py-3 px-4 rounded-lg font-bold active:bg-gray-100 disabled:opacity-50 transition-colors border border-gray-300"
                    >
                        <span className="text-lg">🌐</span>
                        <span className="text-sm">Google Drive</span>
                    </button>
                    <button
                        onClick={handleDropbox}
                        disabled={isLoading}
                        className="flex items-center justify-center gap-2 bg-blue-500 text-white py-3 px-4 rounded-lg font-bold active:bg-blue-600 disabled:opacity-50 transition-colors"
                    >
                        <span className="text-lg">📦</span>
                        <span className="text-sm">Dropbox</span>
                    </button>
                </div>
                <p className="text-gray-500 text-xs mt-1 text-center">
                    {t('backup.cloudHint')}
                </p>
            </div>

            {/* Cronologia Backup */}
            {backupHistory.length > 0 && (
                <div className="border-t border-gray-700 pt-4">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="w-full flex items-center justify-between mb-2"
                    >
                        <h4 className="text-cyan-400 font-semibold text-sm">
                            {t('backup.history')} ({backupHistory.length})
                        </h4>
                        {showHistory ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                    </button>

                    {showHistory && (
                        <div className="space-y-2">
                            {backupHistory.map((backup) => (
                                <div
                                    key={backup.id}
                                    className="bg-gray-900 rounded-lg p-3 flex items-center justify-between border border-gray-700"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl">{getBackupTypeIcon(backup.type)}</span>
                                        <div>
                                            <p className="text-white text-sm font-medium">
                                                {getBackupTypeName(backup.type)}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                {formatDate(backup.date)}
                                            </p>
                                            <p className="text-gray-500 text-xs">
                                                {backup.catture} {t('map.catches')} • {backup.sessioni} {t('sessions.title')}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteBackup(backup.id)}
                                        className="text-red-400 p-2 active:text-red-300"
                                        aria-label={t('common.delete')}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </Section>
    )
}

export default BackupManager
