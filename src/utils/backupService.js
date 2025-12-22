/**
 * Backup Service - Gestisce backup locali e cloud
 * Supporta: backup automatici, backup manuali, Google Drive, Dropbox
 */

const BACKUP_HISTORY_KEY = 'fishfile_backup_history'
const AUTO_BACKUP_KEY = 'fishfile_auto_backup'
const MAX_LOCAL_BACKUPS = 5

/**
 * Genera un ID univoco per il backup
 */
const generateBackupId = () => {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Ottiene la cronologia dei backup locali
 */
export const getBackupHistory = () => {
    try {
        const history = localStorage.getItem(BACKUP_HISTORY_KEY)
        return history ? JSON.parse(history) : []
    } catch (e) {
        console.error('Error reading backup history:', e)
        return []
    }
}

/**
 * Salva un nuovo backup nella cronologia locale
 */
const saveBackupToHistory = (backupInfo) => {
    try {
        const history = getBackupHistory()
        history.unshift(backupInfo)

        // Mantieni solo gli ultimi MAX_LOCAL_BACKUPS
        const trimmedHistory = history.slice(0, MAX_LOCAL_BACKUPS)
        localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(trimmedHistory))

        return true
    } catch (e) {
        console.error('Error saving backup history:', e)
        return false
    }
}

/**
 * Crea un oggetto backup con tutti i dati dell'app
 */
export const createBackupData = () => {
    const backupData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        data: {}
    }

    // Raccogli tutti i dati da localStorage
    const keysToBackup = [
        'catture',
        'sessioni_completate',
        'specie_memorizzate',
        'localita_memorizzate',
        'esche_memorizzate',
        'canne_memorizzate',
        'travi_memorizzate',
        'ami_memorizzati',
        'piombi_memorizzati',
        'note_memorizzate',
        'fishfile_language'
    ]

    keysToBackup.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
            try {
                backupData.data[key] = JSON.parse(value)
            } catch {
                backupData.data[key] = value
            }
        }
    })

    return backupData
}

/**
 * Ripristina i dati da un backup
 */
export const restoreFromBackup = (backupData) => {
    if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data')
    }

    // Ripristina tutti i dati
    Object.entries(backupData.data).forEach(([key, value]) => {
        try {
            const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
            localStorage.setItem(key, stringValue)
        } catch (e) {
            console.error(`Error restoring ${key}:`, e)
        }
    })

    return true
}

/**
 * Esporta backup come file JSON scaricabile
 */
export const exportBackupToFile = () => {
    const backupData = createBackupData()
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `fishfile-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Salva nella cronologia
    const backupInfo = {
        id: generateBackupId(),
        date: new Date().toISOString(),
        type: 'file',
        catture: backupData.data.catture?.length || 0,
        sessioni: backupData.data.sessioni_completate?.length || 0
    }
    saveBackupToHistory(backupInfo)

    return backupInfo
}

/**
 * Importa backup da file JSON
 */
export const importBackupFromFile = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result)

                // Valida struttura backup
                if (!backupData.data) {
                    // Potrebbe essere un vecchio formato di export
                    if (backupData.catture) {
                        // Converti vecchio formato
                        const convertedData = {
                            version: '1.0',
                            timestamp: new Date().toISOString(),
                            data: {
                                catture: backupData.catture,
                                sessioni_completate: backupData.sessioni || [],
                                specie_memorizzate: backupData.specie || [],
                                localita_memorizzate: backupData.localita || [],
                                esche_memorizzate: backupData.esche || [],
                                canne_memorizzate: backupData.attrezzature?.canne || [],
                                travi_memorizzate: backupData.attrezzature?.travi || [],
                                ami_memorizzati: backupData.attrezzature?.ami || [],
                                piombi_memorizzati: backupData.attrezzature?.piombi || []
                            }
                        }
                        restoreFromBackup(convertedData)
                        resolve({
                            catture: convertedData.data.catture?.length || 0,
                            sessioni: convertedData.data.sessioni_completate?.length || 0,
                            converted: true
                        })
                        return
                    }
                    reject(new Error('Invalid backup format'))
                    return
                }

                restoreFromBackup(backupData)
                resolve({
                    catture: backupData.data.catture?.length || 0,
                    sessioni: backupData.data.sessioni_completate?.length || 0,
                    date: backupData.timestamp
                })
            } catch (err) {
                reject(new Error('Error parsing backup file'))
            }
        }

        reader.onerror = () => reject(new Error('Error reading file'))
        reader.readAsText(file)
    })
}

/**
 * Salva backup automatico locale
 */
export const saveAutoBackup = () => {
    try {
        const backupData = createBackupData()
        localStorage.setItem(AUTO_BACKUP_KEY, JSON.stringify(backupData))

        const backupInfo = {
            id: generateBackupId(),
            date: new Date().toISOString(),
            type: 'auto',
            catture: backupData.data.catture?.length || 0,
            sessioni: backupData.data.sessioni_completate?.length || 0
        }
        saveBackupToHistory(backupInfo)

        return backupInfo
    } catch (e) {
        console.error('Error saving auto backup:', e)
        return null
    }
}

/**
 * Recupera l'ultimo backup automatico
 */
export const getAutoBackup = () => {
    try {
        const backup = localStorage.getItem(AUTO_BACKUP_KEY)
        return backup ? JSON.parse(backup) : null
    } catch (e) {
        console.error('Error reading auto backup:', e)
        return null
    }
}

/**
 * Ripristina dall'ultimo backup automatico
 */
export const restoreFromAutoBackup = () => {
    const backup = getAutoBackup()
    if (!backup) {
        throw new Error('No auto backup found')
    }
    return restoreFromBackup(backup)
}

/**
 * Elimina un backup dalla cronologia
 */
export const deleteBackupFromHistory = (backupId) => {
    try {
        const history = getBackupHistory()
        const newHistory = history.filter(b => b.id !== backupId)
        localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(newHistory))
        return true
    } catch (e) {
        console.error('Error deleting backup:', e)
        return false
    }
}

/**
 * Calcola la dimensione stimata dei dati
 */
export const getDataSize = () => {
    const backupData = createBackupData()
    const jsonString = JSON.stringify(backupData)
    const bytes = new Blob([jsonString]).size

    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * Google Drive - Salva backup (apre popup per salvare)
 * Usa approccio semplice: genera file e apre Google Drive upload
 */
export const saveToGoogleDrive = () => {
    const backupData = createBackupData()
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const fileName = `fishfile-backup-${new Date().toISOString().split('T')[0]}.json`

    // Crea URL per il file
    const fileUrl = URL.createObjectURL(blob)

    // Scarica prima il file localmente
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Poi apri Google Drive per upload manuale
    setTimeout(() => {
        window.open('https://drive.google.com/drive/my-drive', '_blank')
        URL.revokeObjectURL(fileUrl)
    }, 500)

    const backupInfo = {
        id: generateBackupId(),
        date: new Date().toISOString(),
        type: 'google_drive',
        catture: backupData.data.catture?.length || 0,
        sessioni: backupData.data.sessioni_completate?.length || 0
    }
    saveBackupToHistory(backupInfo)

    return backupInfo
}

/**
 * Dropbox - Salva backup (apre popup per salvare)
 */
export const saveToDropbox = () => {
    const backupData = createBackupData()
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const fileName = `fishfile-backup-${new Date().toISOString().split('T')[0]}.json`

    // Crea URL per il file
    const fileUrl = URL.createObjectURL(blob)

    // Scarica prima il file localmente
    const a = document.createElement('a')
    a.href = fileUrl
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Poi apri Dropbox per upload manuale
    setTimeout(() => {
        window.open('https://www.dropbox.com/home', '_blank')
        URL.revokeObjectURL(fileUrl)
    }, 500)

    const backupInfo = {
        id: generateBackupId(),
        date: new Date().toISOString(),
        type: 'dropbox',
        catture: backupData.data.catture?.length || 0,
        sessioni: backupData.data.sessioni_completate?.length || 0
    }
    saveBackupToHistory(backupInfo)

    return backupInfo
}

export default {
    createBackupData,
    restoreFromBackup,
    exportBackupToFile,
    importBackupFromFile,
    saveAutoBackup,
    getAutoBackup,
    restoreFromAutoBackup,
    getBackupHistory,
    deleteBackupFromHistory,
    getDataSize,
    saveToGoogleDrive,
    saveToDropbox
}
