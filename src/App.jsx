/**
 * Fish File - Diario di Pesca
 * Copyright © 2025 Giampietro Leonoro
 * Tutti i diritti riservati.
 */

import React, { useState, useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Components
import Section from './components/Section'
import SessionePesca from './components/SessionePesca'
import CatturaForm from './components/CatturaForm'
import MeteoForm from './components/MeteoForm'
import ListaGestione from './components/ListaGestione'
import { Wrench, BarChart3 } from './components/Icons'

// Constants
const ITEMS_PER_PAGE = 10

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
                return parsed.sort((a, b) => a.localeCompare ? a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' }) : 0)
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
    const [mostraRegistro, setMostraRegistro] = useState(false)
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

    // Effect - Splash screen
    useEffect(() => {
        const timer = setTimeout(() => setMostraSplash(false), 3000)
        return () => clearTimeout(timer)
    }, [])

    // Funzioni - Sessione
    const avviaSessione = () => {
        if (!datiSessione.localita || !datiSessione.latitudine || !datiSessione.longitudine) {
            alert('Compila tutti i campi!')
            return
        }

        const validazione = validaCoordinate(datiSessione.latitudine, datiSessione.longitudine)
        if (!validazione.valid) {
            alert(`ATTENZIONE: ${validazione.error}\n\nVerifica le coordinate prima di continuare!`)
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
    }

    const terminaSessione = () => {
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
    }

    const ottieniPosizioneGPS = () => {
        if (!navigator.geolocation) {
            alert('Geolocalizzazione non supportata dal tuo browser!')
            return
        }
        alert('Richiesta posizione GPS in corso...')
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setDatiSessione(p => ({
                    ...p,
                    latitudine: position.coords.latitude.toFixed(6),
                    longitudine: position.coords.longitude.toFixed(6)
                }))
                alert(`Posizione GPS acquisita!\n\nPrecisione: ±${Math.round(position.coords.accuracy)}m`)
            },
            (error) => {
                let msg = 'Impossibile ottenere la posizione GPS!\n\n'
                if (error.code === error.PERMISSION_DENIED) msg += 'Permesso negato.'
                else if (error.code === error.POSITION_UNAVAILABLE) msg += 'Posizione non disponibile.'
                else if (error.code === error.TIMEOUT) msg += 'Timeout.'
                else msg += 'Errore sconosciuto.'
                alert(msg)
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    // Funzioni - Catture
    const aggiungiCattura = () => {
        if (!sessioneAttiva) {
            setMessaggioErrore('Avvia prima una sessione di pesca')
            return
        }
        if (!nuovaCattura.specie) {
            setMessaggioErrore('Inserisci la specie della cattura')
            return
        }

        if (nuovaCattura.latitudine && nuovaCattura.longitudine) {
            const validazione = validaCoordinate(nuovaCattura.latitudine, nuovaCattura.longitudine)
            if (!validazione.valid) {
                setMessaggioErrore(`Coordinate non valide: ${validazione.error}`)
                return
            }
        }

        setMessaggioErrore('')

        // Auto-aggiungi a liste se non presenti
        if (nuovaCattura.specie && !specieMemorizzate.includes(nuovaCattura.specie)) {
            setSpecieMemorizzate(prev => [...prev, nuovaCattura.specie].sort((a, b) => a.localeCompare(b, 'it')))
        }
        if (nuovaCattura.esca && !escheMemorizzate.includes(nuovaCattura.esca)) {
            setEscheMemorizzate(prev => [...prev, nuovaCattura.esca].sort((a, b) => a.localeCompare(b, 'it')))
        }

        setCatture(prev => [...prev, {...nuovaCattura, meteo: {...meteo}, id: Date.now(), sessioneId: sessioneCorrente.id}])

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

        alert('Cattura registrata con successo!')
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
            alert('Il nome non può essere vuoto!')
            return
        }
        const nuovoNomeTrim = nuovoNome.trim()
        if (lista.includes(nuovoNomeTrim) && nuovoNomeTrim !== vecchioNome) {
            alert('Questa voce esiste già!')
            return
        }
        setLista(prev => prev.map(l => l === vecchioNome ? nuovoNomeTrim : l).sort((a, b) => a.localeCompare(b, 'it', { numeric: true, sensitivity: 'base' })))
        setEditando(null)
    }

    // Funzioni - Statistiche
    const calcolaStatistiche = () => {
        if (catture.length === 0) return null
        const specieCount = {}
        let pesoTotale = 0, numPesi = 0
        catture.forEach(c => {
            if (c.specie) specieCount[c.specie] = (specieCount[c.specie] || 0) + 1
            if (c.peso) {
                const pesoNum = parseFloat(c.peso)
                if (!isNaN(pesoNum) && pesoNum > 0) {
                    pesoTotale += pesoNum
                    numPesi++
                }
            }
        })
        const speciePiuCatturata = Object.entries(specieCount).length > 0 ? Object.entries(specieCount).sort((a,b) => b[1] - a[1])[0] : null
        const pesoMedio = numPesi > 0 ? ((pesoTotale / numPesi) / 1000).toFixed(2) : 0
        return { speciePiuCatturata, pesoMedio, totaleCatture: catture.length }
    }

    const esportaDati = () => {
        if (catture.length === 0) { alert('Nessuna cattura!'); return }
        const data = JSON.stringify({
            catture,
            sessioni: sessioniCompletate,
            attrezzature: { canne: canneMemorizzate, travi: traviMemorizzate, ami: amiMemorizzati, piombi: piombiMemorizzati },
            localita: localitaMemorizzate,
            specie: specieMemorizzate,
            esche: escheMemorizzate
        }, null, 2)
        const blob = new Blob([data], {type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `diario-pesca-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        alert('Esportato!')
    }

    const stats = calcolaStatistiche()

    return (
        <>
            {/* Splash Screen */}
            {mostraSplash && (
                <div className="fixed inset-0 bg-black flex items-center justify-center z-50 splash-animation">
                    <img src="/splash-screen.png" alt="Fish File" className="max-w-full max-h-full object-contain" />
                </div>
            )}

            {/* App Principale */}
            <div className="min-h-screen bg-black p-4">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <img src="/logoFishFile.png" alt="Fish File Logo" className="mx-auto mb-4" style={{maxWidth: '300px', width: '100%', height: 'auto'}} />
                        <p className="text-gray-400">registra le tue battute di pesca</p>
                        {catture.length > 0 && <p className="text-cyan-400 text-sm mt-2">{catture.length} catture salvate</p>}
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
                    />

                    {/* Sezione Gestione */}
                    <Section
                        icon={Wrench}
                        title="gestione"
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
                    <Section
                        icon={BarChart3}
                        title="analizza dati"
                        isActive={activeSection === 'analisi'}
                        onToggle={() => setActiveSection(activeSection === 'analisi' ? null : 'analisi')}
                    >
                        {catture.length === 0 ? (
                            <p className="text-gray-400 text-center py-8">nessuna cattura registrata</p>
                        ) : (
                            <>
                                {stats && (
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="bg-cyan-900 rounded-lg p-4 border border-cyan-600">
                                            <p className="text-cyan-300 text-xs font-semibold">totale</p>
                                            <p className="text-white text-2xl font-bold">{stats.totaleCatture}</p>
                                        </div>
                                        <div className="bg-blue-900 rounded-lg p-4 border border-blue-600">
                                            <p className="text-blue-300 text-xs font-semibold">più catturata</p>
                                            {stats.speciePiuCatturata && (
                                                <>
                                                    <p className="text-white text-lg font-bold">{stats.speciePiuCatturata[0]}</p>
                                                    <p className="text-blue-300 text-xs">({stats.speciePiuCatturata[1]})</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="bg-green-900 rounded-lg p-4 border border-green-600">
                                            <p className="text-green-300 text-xs font-semibold">peso medio</p>
                                            <p className="text-white text-2xl font-bold">{stats.pesoMedio} kg</p>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setMostraRegistro(!mostraRegistro)}
                                    className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold mb-4"
                                >
                                    {mostraRegistro ? 'nascondi registro' : 'mostra registro'}
                                </button>

                                <button
                                    onClick={esportaDati}
                                    className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold"
                                >
                                    esporta dati ({catture.length} catture)
                                </button>
                            </>
                        )}
                    </Section>

                    {/* Footer */}
                    <div className="text-center mt-8 pb-8">
                        <p className="text-gray-600 text-xs">Fish File v1.0 © 2025 Giampietro Leonoro</p>
                    </div>
                </div>
            </div>
        </>
    )
}

export default App
