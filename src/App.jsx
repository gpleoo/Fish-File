/**
 * Fish File - Diario di Pesca
 * Copyright © 2025 Giampietro Leonoro
 * Tutti i diritti riservati.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

// Components
import Section from './components/Section'
import SessionePesca from './components/SessionePesca'
import CatturaForm from './components/CatturaForm'
import MeteoForm from './components/MeteoForm'
import ListaGestione from './components/ListaGestione'
import AnalisiDati from './components/AnalisiDati'
import SponsorSection from './components/SponsorSection'
import SettingsPanel from './components/SettingsPanel'
import { useToast } from './components/Toast'
import { Wrench } from './components/Icons'
import { useTranslation } from './locales/LanguageContext'

// Native utilities (Capacitor)
import { initNativeFeatures, isNative } from './utils/native'

// Weather service
import { fetchWeatherData } from './utils/weatherService'

// Ads
import { useAds } from './contexts/AdContext'
import BannerAdPlaceholder from './components/BannerAdPlaceholder'

// Default data
const specieDefault = ['Cefalo', 'Gronco', 'Leccia stella', 'Marmora', 'Occhiata', 'Ombrina', 'Opa', 'Orata', 'Pesce serra', 'Sarago', 'Spigola', 'Sughero']
const escheDefault = ['Americano', 'Arenicola', 'Bibi', 'Canolicchio', 'Cefalo', 'Coreano', 'Gambero', 'Granchio', 'Muriddu', 'Seppia']
const amiDefault = ['1/0', '2/0', '2', '4', '6', '8', '10']
const piombiDefault = ['Idropiramide 100', 'Idropiramide 125', 'Idropiramide 150', 'Idropiramide 175', 'Ogiva 50', 'Ogiva 75', 'Ogiva 100', 'Ogiva 125', 'Ogiva 150', 'Ogiva 175', 'Palla 100', 'Palla 125', 'Palla 150', 'Palla 175', 'Sporten 100', 'Sporten 125', 'Sporten 150', 'Sporten 175']

// Helper functions
const getOraItalianaAttuale = () => {
    try {
        return new Date().toLocaleTimeString('it-IT', { timeZone: 'Europe/Rome', hour: '2-digit', minute: '2-digit', hour12: false })
    } catch (e) {
        return new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
}

const getDataItalianaAttuale = () => {
    return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().split('T')[0]
}

const validaCoordinate = (lat, lng) => {
    const latNum = parseFloat(lat)
    const lngNum = parseFloat(lng)
    if (isNaN(latNum) || isNaN(lngNum)) {
        return { valid: false, error: 'Coordinate non numeriche' }
    }
    if (latNum < 35 || latNum > 47) {
        return { valid: false, error: `Latitudine ${latNum} fuori range Italia (35-47)` }
    }
    if (lngNum < 6 || lngNum > 19) {
        return { valid: false, error: `Longitudine ${lngNum} fuori range Italia (6-19)` }
    }
    return { valid: true }
}

const loadFromStorage = (key, defaultValue) => {
    try {
        const saved = localStorage.getItem(key)
        if (saved) {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed)) {
                return parsed.sort((a, b) => {
                    // Only sort if both items are strings
                    if (typeof a === 'string' && typeof b === 'string') {
                        return a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' })
                    }
                    return 0
                })
            }
            return parsed
        }
        return defaultValue
    } catch (e) {
        console.error(`Errore caricamento ${key}:`, e)
        return defaultValue
    }
}

// Main App Component
function App() {
    // Toast notifications
    const toast = useToast()

    // Translations
    const { t } = useTranslation()

    // Ads
    const { showBanner, trackCatch, showSessionEndAd } = useAds()

    // State - Sezioni attive
    const [activeSection, setActiveSection] = useState(null)
    const [mostraSplash, setMostraSplash] = useState(true)

    // State - Dati principali
    const [catture, setCatture] = useState(() => loadFromStorage('diarioPesca_catture', []))
    const [specieMemorizzate, setSpecieMemorizzate] = useState(() => loadFromStorage('diarioPesca_specie', specieDefault))
    const [escheMemorizzate, setEscheMemorizzate] = useState(() => loadFromStorage('diarioPesca_esche', escheDefault))
    const [localitaMemorizzate, setLocalitaMemorizzate] = useState(() => loadFromStorage('diarioPesca_localita', []))
    const [noteMemorizzate, setNoteMemorizzate] = useState(() => loadFromStorage('diarioPesca_note', []))
    const [canneMemorizzate, setCanneMemorizzate] = useState(() => loadFromStorage('diarioPesca_canne', []))
    const [traviMemorizzate, setTraviMemorizzate] = useState(() => loadFromStorage('diarioPesca_travi', []))
    const [amiMemorizzati, setAmiMemorizzati] = useState(() => loadFromStorage('diarioPesca_ami', amiDefault))
    const [piombiMemorizzati, setPiombiMemorizzati] = useState(() => loadFromStorage('diarioPesca_piombi', piombiDefault))

    // State - Sessione
    const [sessioneAttiva, setSessioneAttiva] = useState(() => loadFromStorage('diarioPesca_sessioneAttiva', false))
    const [datiSessione, setDatiSessione] = useState(() => loadFromStorage('diarioPesca_datiSessione', { localita: '', latitudine: '', longitudine: '' }))
    const [sessioneCorrente, setSessioneCorrente] = useState(() => loadFromStorage('diarioPesca_sessioneCorrente', null))
    const [sessioniCompletate, setSessioniCompletate] = useState(() => loadFromStorage('diarioPesca_sessioniCompletate', []))

    // State - UI
    const [mostraSessionePesca, setMostraSessionePesca] = useState(false)

    // State - Gestione sezioni collassabili
    const [mostraLocalita, setMostraLocalita] = useState(false)
    const [mostraSpecie, setMostraSpecie] = useState(false)
    const [mostraEsche, setMostraEsche] = useState(false)
    const [mostraCanne, setMostraCanne] = useState(false)
    const [mostraTravi, setMostraTravi] = useState(false)
    const [mostraAmi, setMostraAmi] = useState(false)
    const [mostraPiombi, setMostraPiombi] = useState(false)

    // State - Form
    const [messaggioErrore, setMessaggioErrore] = useState('')
    const [nuovaSpecie, setNuovaSpecie] = useState('')
    const [nuovaEsca, setNuovaEsca] = useState('')
    const [nuovaCanna, setNuovaCanna] = useState('')
    const [nuovoTrave, setNuovoTrave] = useState('')
    const [nuovoAmo, setNuovoAmo] = useState('')
    const [nuovoPiombo, setNuovoPiombo] = useState('')
    const [nuovaLocalita, setNuovaLocalita] = useState('')

    // State - Editing
    const [editandoLocalita, setEditandoLocalita] = useState(null)
    const [valoreEditLocalita, setValoreEditLocalita] = useState('')
    const [editandoSpecie, setEditandoSpecie] = useState(null)
    const [valoreEditSpecie, setValoreEditSpecie] = useState('')
    const [editandoEsca, setEditandoEsca] = useState(null)
    const [valoreEditEsca, setValoreEditEsca] = useState('')
    const [editandoCanna, setEditandoCanna] = useState(null)
    const [valoreEditCanna, setValoreEditCanna] = useState('')
    const [editandoTrave, setEditandoTrave] = useState(null)
    const [valoreEditTrave, setValoreEditTrave] = useState('')
    const [editandoAmo, setEditandoAmo] = useState(null)
    const [valoreEditAmo, setValoreEditAmo] = useState('')
    const [editandoPiombo, setEditandoPiombo] = useState(null)
    const [valoreEditPiombo, setValoreEditPiombo] = useState('')

    // State - Cattura e Meteo
    const [nuovaCattura, setNuovaCattura] = useState({
        data: getDataItalianaAttuale(),
        ora: getOraItalianaAttuale(),
        specie: '', peso: '', lunghezza: '',
        localita: '', latitudine: '', longitudine: '',
        esca: '', canna: '', trave: '', amo: '', piombo: '', note: ''
    })

    const [meteo, setMeteo] = useState({
        data: getDataItalianaAttuale(),
        localita: '', temperatura: '', temperaturaAcqua: '', pressione: '',
        vento: '', direzioneVento: '', condizioni: '', faseLunare: '',
        altaMareaOra: '', bassaMareaOra: '', altezzaOnde: '', frequenzaOnde: ''
    })

    // Ref to track if component is mounted (for async operations)
    const isMountedRef = useRef(true)
    useEffect(() => {
        isMountedRef.current = true
        return () => { isMountedRef.current = false }
    }, [])

    // Effects - Salvataggio localStorage
    useEffect(() => { localStorage.setItem('diarioPesca_catture', JSON.stringify(catture)) }, [catture])
    useEffect(() => { localStorage.setItem('diarioPesca_specie', JSON.stringify(specieMemorizzate)) }, [specieMemorizzate])
    useEffect(() => { localStorage.setItem('diarioPesca_esche', JSON.stringify(escheMemorizzate)) }, [escheMemorizzate])
    useEffect(() => { localStorage.setItem('diarioPesca_localita', JSON.stringify(localitaMemorizzate)) }, [localitaMemorizzate])
    useEffect(() => { localStorage.setItem('diarioPesca_note', JSON.stringify(noteMemorizzate)) }, [noteMemorizzate])
    useEffect(() => { localStorage.setItem('diarioPesca_canne', JSON.stringify(canneMemorizzate)) }, [canneMemorizzate])
    useEffect(() => { localStorage.setItem('diarioPesca_travi', JSON.stringify(traviMemorizzate)) }, [traviMemorizzate])
    useEffect(() => { localStorage.setItem('diarioPesca_ami', JSON.stringify(amiMemorizzati)) }, [amiMemorizzati])
    useEffect(() => { localStorage.setItem('diarioPesca_piombi', JSON.stringify(piombiMemorizzati)) }, [piombiMemorizzati])
    useEffect(() => { localStorage.setItem('diarioPesca_sessioneAttiva', JSON.stringify(sessioneAttiva)) }, [sessioneAttiva])
    useEffect(() => { localStorage.setItem('diarioPesca_datiSessione', JSON.stringify(datiSessione)) }, [datiSessione])
    useEffect(() => { localStorage.setItem('diarioPesca_sessioneCorrente', JSON.stringify(sessioneCorrente)) }, [sessioneCorrente])
    useEffect(() => { localStorage.setItem('diarioPesca_sessioniCompletate', JSON.stringify(sessioniCompletate)) }, [sessioniCompletate])

    // Effect - Splash screen (2s duration)
    useEffect(() => {
        const timer = setTimeout(() => setMostraSplash(false), 2000)
        return () => clearTimeout(timer)
    }, [])

    // Effect - Initialize native features (Capacitor)
    useEffect(() => {
        initNativeFeatures()
    }, [])

    // Effect - Show banner ad after splash
    useEffect(() => {
        if (!mostraSplash) {
            // Mostra banner dopo che lo splash è finito
            showBanner()
        }
    }, [mostraSplash, showBanner])

    // Funzioni - Sessione
    const avviaSessione = async () => {
        if (!datiSessione.localita || !datiSessione.latitudine || !datiSessione.longitudine) {
            toast.warning('Compila tutti i campi!')
            return
        }

        const validazione = validaCoordinate(datiSessione.latitudine, datiSessione.longitudine)
        if (!validazione.valid) {
            toast.error(`${validazione.error}. Verifica le coordinate prima di continuare!`, 'Coordinate non valide')
            return
        }

        if (datiSessione.localita.trim() && !localitaMemorizzate.includes(datiSessione.localita.trim())) {
            setLocalitaMemorizzate(prev => [...prev, datiSessione.localita.trim()].sort((a, b) => a.localeCompare(b, 'it')))
        }

        const nuovaSessione = {
            id: Date.now(),
            localita: datiSessione.localita,
            latitudine: parseFloat(datiSessione.latitudine),
            longitudine: parseFloat(datiSessione.longitudine),
            dataInizio: getDataItalianaAttuale(),
            oraInizio: getOraItalianaAttuale(),
            dataFine: null,
            oraFine: null,
            numeroCatture: 0
        }

        setSessioneCorrente(nuovaSessione)
        setSessioneAttiva(true)
        setNuovaCattura(p => ({...p, localita: datiSessione.localita, latitudine: datiSessione.latitudine, longitudine: datiSessione.longitudine}))
        setMeteo(p => ({...p, localita: datiSessione.localita}))

        // Aggiorna automaticamente i dati meteo all'avvio sessione
        toast.info('Recupero dati meteo...')
        const result = await fetchWeatherData(
            parseFloat(datiSessione.latitudine),
            parseFloat(datiSessione.longitudine)
        )

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return

        if (result.success && result.data) {
            setMeteo(prev => ({
                ...prev,
                ...result.data,
                data: getDataItalianaAttuale(),
                localita: datiSessione.localita
            }))
            toast.success('Sessione avviata con dati meteo!')
        } else {
            toast.warning('Sessione avviata. Dati meteo non disponibili, compilali manualmente nella sezione meteo.')
        }
    }

    const terminaSessione = async () => {
        if (sessioneCorrente) {
            const cattureQuesta = catture.filter(c => c.sessioneId === sessioneCorrente.id).length
            const sessioneCompletata = {
                ...sessioneCorrente,
                dataFine: getDataItalianaAttuale(),
                oraFine: getOraItalianaAttuale(),
                numeroCatture: cattureQuesta
            }
            setSessioniCompletate(prev => [...prev, sessioneCompletata])
        }
        setSessioneAttiva(false)
        setSessioneCorrente(null)
        setDatiSessione({ localita: '', latitudine: '', longitudine: '' })

        // Show interstitial ad at session end
        await showSessionEndAd()
    }

    const ottieniPosizioneGPS = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocalizzazione non supportata dal tuo browser!')
            return
        }
        toast.info('Richiesta posizione GPS in corso...')
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude.toFixed(6)
                const lng = position.coords.longitude.toFixed(6)

                setDatiSessione(p => ({
                    ...p,
                    latitudine: lat,
                    longitudine: lng
                }))
                toast.success(`Precisione: ±${Math.round(position.coords.accuracy)}m`, 'Posizione GPS acquisita!')

                // Ottieni dati meteo automaticamente
                await aggiornaMeteo(parseFloat(lat), parseFloat(lng))
            },
            (error) => {
                let msg = ''
                if (error.code === error.PERMISSION_DENIED) msg = 'Permesso negato.'
                else if (error.code === error.POSITION_UNAVAILABLE) msg = 'Posizione non disponibile.'
                else if (error.code === error.TIMEOUT) msg = 'Timeout scaduto.'
                else msg = 'Errore sconosciuto.'
                toast.error(msg, 'Errore GPS')
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    // Funzione per aggiornare meteo
    const aggiornaMeteo = async (lat, lng) => {
        if (!lat || !lng) {
            // Usa coordinate dalla sessione se non passate
            lat = parseFloat(datiSessione.latitudine)
            lng = parseFloat(datiSessione.longitudine)
        }

        if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
            toast.warning('Inserisci prima le coordinate GPS')
            return
        }

        toast.info('Recupero dati meteo...')

        const result = await fetchWeatherData(lat, lng)

        // Check if component is still mounted before updating state
        if (!isMountedRef.current) return

        if (result.success && result.data) {
            setMeteo(prev => ({
                ...prev,
                ...result.data,
                data: getDataItalianaAttuale(),
                localita: datiSessione.localita || prev.localita
            }))
            toast.success('Dati meteo aggiornati!')
        } else {
            toast.warning('Dati meteo non disponibili. Inseriscili manualmente.')
        }
    }

    // Funzioni - Catture
    // voiceCatchData è opzionale - usato dall'assistente vocale per passare i dati direttamente
    const aggiungiCattura = (voiceCatchData = null) => {
        // Verifica se voiceCatchData è effettivamente dati vocali (non un evento click)
        const isVoiceData = voiceCatchData && typeof voiceCatchData === 'object' && 'specie' in voiceCatchData
        const actualVoiceData = isVoiceData ? voiceCatchData : null

        if (!sessioneAttiva) {
            setMessaggioErrore('Avvia prima una sessione di pesca')
            return false
        }

        // Se viene passato actualVoiceData, usalo; altrimenti usa nuovaCattura
        const catchData = actualVoiceData ? {
            ...nuovaCattura,
            specie: actualVoiceData.specie,
            lunghezza: actualVoiceData.lunghezza || '',
            esca: actualVoiceData.esca || '',
            data: getDataItalianaAttuale(),
            ora: getOraItalianaAttuale()
        } : nuovaCattura

        if (!catchData.specie) {
            setMessaggioErrore('Inserisci la specie della cattura')
            return false
        }

        if (catchData.latitudine && catchData.longitudine) {
            const validazione = validaCoordinate(catchData.latitudine, catchData.longitudine)
            if (!validazione.valid) {
                setMessaggioErrore(`Coordinate non valide: ${validazione.error}`)
                return false
            }
        }

        setMessaggioErrore('')

        // Auto-aggiungi a liste se non presenti
        if (catchData.specie && !specieMemorizzate.includes(catchData.specie)) {
            setSpecieMemorizzate(prev => [...prev, catchData.specie].sort((a, b) => a.localeCompare(b, 'it')))
        }
        if (catchData.esca && !escheMemorizzate.includes(catchData.esca)) {
            setEscheMemorizzate(prev => [...prev, catchData.esca].sort((a, b) => a.localeCompare(b, 'it')))
        }

        const newCatch = {...catchData, meteo: {...meteo}, id: Date.now(), sessioneId: sessioneCorrente.id}
        setCatture(prev => [...prev, newCatch])

        setNuovaCattura({
            data: getDataItalianaAttuale(),
            ora: getOraItalianaAttuale(),
            specie: '', peso: '', lunghezza: '',
            localita: sessioneAttiva ? datiSessione.localita : '',
            latitudine: sessioneAttiva ? datiSessione.latitudine : '',
            longitudine: sessioneAttiva ? datiSessione.longitudine : '',
            esca: '',
            canna: nuovaCattura.canna,
            trave: nuovaCattura.trave,
            amo: nuovaCattura.amo,
            piombo: nuovaCattura.piombo,
            note: nuovaCattura.note
        })

        toast.success('Cattura registrata con successo!')

        // Track catch for ad display (every 3 catches)
        trackCatch()

        return true
    }

    // Funzioni - Gestione liste (generiche)
    const aggiungiVoce = (valore, lista, setLista, setNuovoValore) => {
        if (valore.trim() && !lista.includes(valore.trim())) {
            setLista(prev => [...prev, valore.trim()].sort((a, b) => a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' })))
            setNuovoValore('')
        }
    }

    const modificaVoce = (vecchioNome, nuovoNome, lista, setLista, setEditando) => {
        if (!nuovoNome || !nuovoNome.trim()) {
            toast.warning('Il nome non può essere vuoto!')
            return
        }
        const nuovoNomeTrim = nuovoNome.trim()
        if (lista.includes(nuovoNomeTrim) && nuovoNomeTrim !== vecchioNome) {
            toast.warning('Questa voce esiste già!')
            return
        }
        setLista(prev => prev.map(l => l === vecchioNome ? nuovoNomeTrim : l).sort((a, b) => a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' })))
        setEditando(null)
    }

    // Funzione - Import dati
    const importaDati = (data) => {
        if (data.catture) setCatture(data.catture)
        if (data.sessioni) setSessioniCompletate(data.sessioni)
        if (data.specie) setSpecieMemorizzate(data.specie)
        if (data.esche) setEscheMemorizzate(data.esche)
        if (data.localita) setLocalitaMemorizzate(data.localita)
        if (data.attrezzature) {
            if (data.attrezzature.canne) setCanneMemorizzate(data.attrezzature.canne)
            if (data.attrezzature.travi) setTraviMemorizzate(data.attrezzature.travi)
            if (data.attrezzature.ami) setAmiMemorizzati(data.attrezzature.ami)
            if (data.attrezzature.piombi) setPiombiMemorizzati(data.attrezzature.piombi)
        }
    }

    // Funzione - Ricarica dati dopo ripristino backup
    const ricaricaDatiDaStorage = useCallback(() => {
        setCatture(loadFromStorage('diarioPesca_catture', []))
        setSessioniCompletate(loadFromStorage('diarioPesca_sessioniCompletate', []))
        setSpecieMemorizzate(loadFromStorage('diarioPesca_specie', specieDefault))
        setEscheMemorizzate(loadFromStorage('diarioPesca_esche', escheDefault))
        setLocalitaMemorizzate(loadFromStorage('diarioPesca_localita', []))
        setCanneMemorizzate(loadFromStorage('diarioPesca_canne', []))
        setTraviMemorizzate(loadFromStorage('diarioPesca_travi', []))
        setAmiMemorizzati(loadFromStorage('diarioPesca_ami', amiDefault))
        setPiombiMemorizzati(loadFromStorage('diarioPesca_piombi', piombiDefault))
        setNoteMemorizzate(loadFromStorage('diarioPesca_note', []))
    }, [])

    // Funzione - Elimina sessione
    const eliminaSessione = (sessioneId) => {
        setSessioniCompletate(prev => prev.filter(s => s.id !== sessioneId))
        toast.success('Sessione eliminata')
    }

    return (
        <>
            {/* Splash Screen */}
            {mostraSplash && (
                <div className="fixed inset-0 bg-black flex items-center justify-center z-50 splash-animation">
                    <img src={`${import.meta.env.BASE_URL}splash-screen.png`} alt="Fish File" className="max-w-full max-h-full object-contain" />
                </div>
            )}

            {/* App Principale */}
            <div className="min-h-screen bg-black p-3 sm:p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-5 sm:mb-8">
                        <img src={`${import.meta.env.BASE_URL}logoFishFile.png`} alt="Fish File Logo" className="mx-auto mb-3 sm:mb-4 header-logo" />
                        <p className="text-gray-400 text-sm sm:text-base">{t('app.subtitle')}</p>
                        {catture.length > 0 && <p className="text-cyan-400 text-xs sm:text-sm mt-1.5 sm:mt-2">{t('app.catchesSaved', { count: catture.length })}</p>}
                    </div>

                    {/* Sessione di Pesca */}
                    <SessionePesca
                        mostraSessionePesca={mostraSessionePesca}
                        setMostraSessionePesca={setMostraSessionePesca}
                        sessioneAttiva={sessioneAttiva}
                        datiSessione={datiSessione}
                        setDatiSessione={setDatiSessione}
                        localitaMemorizzate={localitaMemorizzate}
                        avviaSessione={avviaSessione}
                        terminaSessione={terminaSessione}
                        ottieniPosizioneGPS={ottieniPosizioneGPS}
                    />

                    {/* Form Cattura */}
                    <CatturaForm
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        nuovaCattura={nuovaCattura}
                        setNuovaCattura={setNuovaCattura}
                        specieMemorizzate={specieMemorizzate}
                        localitaMemorizzate={localitaMemorizzate}
                        escheMemorizzate={escheMemorizzate}
                        canneMemorizzate={canneMemorizzate}
                        traviMemorizzate={traviMemorizzate}
                        amiMemorizzati={amiMemorizzati}
                        piombiMemorizzati={piombiMemorizzati}
                        noteMemorizzate={noteMemorizzate}
                        messaggioErrore={messaggioErrore}
                        aggiungiCattura={aggiungiCattura}
                    />

                    {/* Form Meteo */}
                    <MeteoForm
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        meteo={meteo}
                        setMeteo={setMeteo}
                        onRefreshMeteo={aggiornaMeteo}
                    />

                    {/* Sezione Gestione */}
                    <Section
                        icon={Wrench}
                        title={t('management.title')}
                        isActive={activeSection === 'attrezzature'}
                        onToggle={() => setActiveSection(activeSection === 'attrezzature' ? null : 'attrezzature')}
                    >
                        <div className="space-y-6">
                            <ListaGestione
                                titolo="località" emoji="📍" items={localitaMemorizzate}
                                nuovoValore={nuovaLocalita} setNuovoValore={setNuovaLocalita}
                                placeholder="es: molo di fiumicino..."
                                onAggiungi={() => aggiungiVoce(nuovaLocalita, localitaMemorizzate, setLocalitaMemorizzate, setNuovaLocalita)}
                                onModifica={(v, n) => modificaVoce(v, n, localitaMemorizzate, setLocalitaMemorizzate, setEditandoLocalita)}
                                onElimina={(v) => setLocalitaMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoLocalita} setEditando={setEditandoLocalita}
                                valoreEdit={valoreEditLocalita} setValoreEdit={setValoreEditLocalita}
                                mostra={mostraLocalita} setMostra={setMostraLocalita}
                            />

                            <ListaGestione
                                titolo="specie" emoji="🐟" items={specieMemorizzate}
                                nuovoValore={nuovaSpecie} setNuovoValore={setNuovaSpecie}
                                placeholder="es: spigola, orata..."
                                onAggiungi={() => aggiungiVoce(nuovaSpecie, specieMemorizzate, setSpecieMemorizzate, setNuovaSpecie)}
                                onModifica={(v, n) => modificaVoce(v, n, specieMemorizzate, setSpecieMemorizzate, setEditandoSpecie)}
                                onElimina={(v) => setSpecieMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoSpecie} setEditando={setEditandoSpecie}
                                valoreEdit={valoreEditSpecie} setValoreEdit={setValoreEditSpecie}
                                mostra={mostraSpecie} setMostra={setMostraSpecie}
                            />

                            <ListaGestione
                                titolo="esche" emoji="🪱" items={escheMemorizzate}
                                nuovoValore={nuovaEsca} setNuovoValore={setNuovaEsca}
                                placeholder="es: coreano, gambero..."
                                onAggiungi={() => aggiungiVoce(nuovaEsca, escheMemorizzate, setEscheMemorizzate, setNuovaEsca)}
                                onModifica={(v, n) => modificaVoce(v, n, escheMemorizzate, setEscheMemorizzate, setEditandoEsca)}
                                onElimina={(v) => setEscheMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoEsca} setEditando={setEditandoEsca}
                                valoreEdit={valoreEditEsca} setValoreEdit={setValoreEditEsca}
                                mostra={mostraEsche} setMostra={setMostraEsche}
                            />

                            <ListaGestione
                                titolo="canne" emoji="🎣" items={canneMemorizzate}
                                nuovoValore={nuovaCanna} setNuovoValore={setNuovaCanna}
                                placeholder="es: bolognese 6m..."
                                onAggiungi={() => aggiungiVoce(nuovaCanna, canneMemorizzate, setCanneMemorizzate, setNuovaCanna)}
                                onModifica={(v, n) => modificaVoce(v, n, canneMemorizzate, setCanneMemorizzate, setEditandoCanna)}
                                onElimina={(v) => setCanneMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoCanna} setEditando={setEditandoCanna}
                                valoreEdit={valoreEditCanna} setValoreEdit={setValoreEditCanna}
                                mostra={mostraCanne} setMostra={setMostraCanne}
                            />

                            <ListaGestione
                                titolo="travi" emoji="🧵" items={traviMemorizzate}
                                nuovoValore={nuovoTrave} setNuovoValore={setNuovoTrave}
                                placeholder="es: 0.20mm..."
                                onAggiungi={() => aggiungiVoce(nuovoTrave, traviMemorizzate, setTraviMemorizzate, setNuovoTrave)}
                                onModifica={(v, n) => modificaVoce(v, n, traviMemorizzate, setTraviMemorizzate, setEditandoTrave)}
                                onElimina={(v) => setTraviMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoTrave} setEditando={setEditandoTrave}
                                valoreEdit={valoreEditTrave} setValoreEdit={setValoreEditTrave}
                                mostra={mostraTravi} setMostra={setMostraTravi}
                            />

                            <ListaGestione
                                titolo="ami" emoji="🪝" items={amiMemorizzati}
                                nuovoValore={nuovoAmo} setNuovoValore={setNuovoAmo}
                                placeholder="es: n.8..."
                                onAggiungi={() => aggiungiVoce(nuovoAmo, amiMemorizzati, setAmiMemorizzati, setNuovoAmo)}
                                onModifica={(v, n) => modificaVoce(v, n, amiMemorizzati, setAmiMemorizzati, setEditandoAmo)}
                                onElimina={(v) => setAmiMemorizzati(prev => prev.filter(x => x !== v))}
                                editando={editandoAmo} setEditando={setEditandoAmo}
                                valoreEdit={valoreEditAmo} setValoreEdit={setValoreEditAmo}
                                mostra={mostraAmi} setMostra={setMostraAmi}
                            />

                            <ListaGestione
                                titolo="piombi" emoji="⚓" items={piombiMemorizzati}
                                nuovoValore={nuovoPiombo} setNuovoValore={setNuovoPiombo}
                                placeholder="es: 50g..."
                                onAggiungi={() => aggiungiVoce(nuovoPiombo, piombiMemorizzati, setPiombiMemorizzati, setNuovoPiombo)}
                                onModifica={(v, n) => modificaVoce(v, n, piombiMemorizzati, setPiombiMemorizzati, setEditandoPiombo)}
                                onElimina={(v) => setPiombiMemorizzati(prev => prev.filter(x => x !== v))}
                                editando={editandoPiombo} setEditando={setEditandoPiombo}
                                valoreEdit={valoreEditPiombo} setValoreEdit={setValoreEditPiombo}
                                mostra={mostraPiombi} setMostra={setMostraPiombi}
                            />
                        </div>
                    </Section>

                    {/* Sezione Analisi */}
                    <AnalisiDati
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                        catture={catture}
                        setCatture={setCatture}
                        sessioniCompletate={sessioniCompletate}
                        onDeleteSessione={eliminaSessione}
                        localitaMemorizzate={localitaMemorizzate}
                        specieMemorizzate={specieMemorizzate}
                    />

                    {/* Sezione Sponsor */}
                    <SponsorSection
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    />

                    {/* Footer - con spazio extra per il banner pubblicitario */}
                    <div className="text-center mt-6 sm:mt-8 pb-20 sm:pb-24 bottom-safe">
                        <p className="text-gray-600 text-xs">Fish File v1.0 - 2025 Giampietro Leonoro</p>
                    </div>
                </div>
            </div>

            {/* Banner Ad */}
            <BannerAdPlaceholder />

            {/* Settings Panel */}
            <SettingsPanel onDataRestored={ricaricaDatiDaStorage} />
        </>
    )
}

export default App
