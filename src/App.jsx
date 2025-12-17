/**
 * Fish File - Diario di Pesca
 * Copyright © 2025 Giampietro Leonoro
 * Tutti i diritti riservati.
 */

import React, { useState, useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Components
import InputField from './components/InputField'
import SelectField from './components/SelectField'
import Section from './components/Section'
import { Fish, Cloud, Wrench, BarChart3, ChevronDown, ChevronUp, Trash2, Edit, Mic } from './components/Icons'

// Constants
const ITEMS_PER_PAGE = 10

const ventiRosaDeiVenti = [
    'N (Tramontana - 4°/1° Quadrante - 0°)',
    'NNE (Tramontana-Grecale - 1° Quadrante - 22,5°)',
    'NE (Grecale - 1° Quadrante - 45°)',
    'ENE (Grecale-Levante - 1° Quadrante - 67,5°)',
    'E (Levante - 1°/2° Quadrante - 90°)',
    'ESE (Levante-Scirocco - 2° Quadrante - 112,5°)',
    'SE (Scirocco - 2° Quadrante - 135°)',
    'SSE (Scirocco-Ostro - 2° Quadrante - 157,5°)',
    'S (Ostro - 2°/3° Quadrante - 180°)',
    'SSW (Ostro-Libeccio - 3° Quadrante - 202,5°)',
    'SW (Libeccio - 3° Quadrante - 225°)',
    'WSW (Libeccio-Ponente - 3° Quadrante - 247,5°)',
    'W (Ponente - 3°/4° Quadrante - 270°)',
    'WNW (Ponente-Maestrale - 4° Quadrante - 292,5°)',
    'NW (Maestrale - 4° Quadrante - 315°)',
    'NNW (Maestrale-Tramontana - 4° Quadrante - 337,5°)'
]

const fasiLunari = ['luna nuova', 'crescente', 'primo quarto', 'gibbosa crescente', 'piena', 'gibbosa calante', 'ultimo quarto', 'calante']
const condizioniMeteo = ['sereno', 'nuvoloso', 'coperto', 'pioggia', 'temporale', 'nebbia']

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
    const [mostraGestioneSessioni, setMostraGestioneSessioni] = useState(false)
    const [mostraCatture, setMostraCatture] = useState(false)
    const [mostraSessionePesca, setMostraSessionePesca] = useState(false)
    const [mostraFiltri, setMostraFiltri] = useState(false)
    const [mostraMappa, setMostraMappa] = useState(false)

    // State - Gestione sezioni collassabili
    const [mostraLocalita, setMostraLocalita] = useState(false)
    const [mostraSpecie, setMostraSpecie] = useState(false)
    const [mostraEsche, setMostraEsche] = useState(false)
    const [mostraCanne, setMostraCanne] = useState(false)
    const [mostraTravi, setMostraTravi] = useState(false)
    const [mostraAmi, setMostraAmi] = useState(false)
    const [mostraPiombi, setMostraPiombi] = useState(false)

    // State - Paginazione
    const [paginaCatture, setPaginaCatture] = useState(0)
    const [paginaSessioni, setPaginaSessioni] = useState(0)
    const [cattureEspanse, setCattureEspanse] = useState({})
    const [sessioniEspanse, setSessioniEspanse] = useState({})

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

    const [filtri, setFiltri] = useState({
        anno: 'tutti', mese: 'tutti', specie: 'tutte',
        direzioneVento: 'tutte', condizioni: 'tutte', localita: 'tutte',
        temperatura: 'tutte', pressione: 'tutte', vento: 'tutti', faseLunare: 'tutte'
    })

    // Refs
    const mapRef = useRef(null)

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
        const timer = setTimeout(() => setMostraSplash(false), 3000) // Ridotto a 3 secondi
        return () => clearTimeout(timer)
    }, [])

    // Effect - Reset pagine quando cambiano i filtri
    useEffect(() => {
        setPaginaCatture(0)
        setPaginaSessioni(0)
    }, [filtri])

    // Funzioni - Sessione
    const avviaSessione = () => {
        if (!datiSessione.localita || !datiSessione.latitudine || !datiSessione.longitudine) {
            alert('Compila tutti i campi!')
            return
        }

        const validazione = validaCoordinate(datiSessione.latitudine, datiSessione.longitudine)
        if (!validazione.valid) {
            alert(`⚠️ ATTENZIONE: ${validazione.error}\n\nVerifica le coordinate prima di continuare!`)
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
            alert('❌ Geolocalizzazione non supportata dal tuo browser!')
            return
        }
        alert('📍 Richiesta posizione GPS in corso...')
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setDatiSessione(p => ({
                    ...p,
                    latitudine: position.coords.latitude.toFixed(6),
                    longitudine: position.coords.longitude.toFixed(6)
                }))
                alert(`✅ Posizione GPS acquisita!\n\nPrecisione: ±${Math.round(position.coords.accuracy)}m`)
            },
            (error) => {
                let msg = '❌ Impossibile ottenere la posizione GPS!\n\n'
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
                setMessaggioErrore(`⚠️ Coordinate non valide: ${validazione.error}`)
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

        alert('✅ Cattura registrata con successo!')
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

    // Funzioni - Statistiche e filtri
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

    const getCattureFiltrate = () => catture.filter(c => {
        const [anno, mese] = c.data.split('-')
        return (filtri.anno === 'tutti' || anno === filtri.anno) &&
               (filtri.mese === 'tutti' || mese === filtri.mese) &&
               (filtri.specie === 'tutte' || c.specie === filtri.specie) &&
               (filtri.direzioneVento === 'tutte' || c.meteo?.direzioneVento === filtri.direzioneVento) &&
               (filtri.condizioni === 'tutte' || c.meteo?.condizioni === filtri.condizioni) &&
               (filtri.localita === 'tutte' || c.localita === filtri.localita) &&
               (filtri.faseLunare === 'tutte' || c.meteo?.faseLunare === filtri.faseLunare)
    })

    const getSessioniFiltrate = () => sessioniCompletate.filter(sessione => {
        const [anno, mese] = sessione.dataInizio.split('-')
        return (filtri.anno === 'tutti' || anno === filtri.anno) &&
               (filtri.mese === 'tutti' || mese === filtri.mese) &&
               (filtri.localita === 'tutte' || sessione.localita === filtri.localita)
    })

    const getAnniDisponibili = () => [...new Set(catture.map(c => c.data.split('-')[0]))].sort()

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

    // Funzioni - Paginazione
    const toggleCatturaEspansa = (id) => setCattureEspanse(prev => ({...prev, [id]: !prev[id]}))
    const toggleSessioneEspansa = (id) => setSessioniEspanse(prev => ({...prev, [id]: !prev[id]}))

    const getCatturePaginate = () => {
        const filtrate = getCattureFiltrate().reverse()
        return filtrate.slice(paginaCatture * ITEMS_PER_PAGE, (paginaCatture + 1) * ITEMS_PER_PAGE)
    }

    const getSessioniPaginate = () => {
        const filtrate = getSessioniFiltrate().reverse()
        return filtrate.slice(paginaSessioni * ITEMS_PER_PAGE, (paginaSessioni + 1) * ITEMS_PER_PAGE)
    }

    const totalePagineCatture = Math.max(1, Math.ceil(getCattureFiltrate().length / ITEMS_PER_PAGE))
    const totalePagineSessioni = Math.max(1, Math.ceil(getSessioniFiltrate().length / ITEMS_PER_PAGE))

    const stats = calcolaStatistiche()

    // Render component per gestione lista
    const ListaGestione = ({ titolo, emoji, items, nuovoValore, setNuovoValore, placeholder, onAggiungi, onModifica, onElimina, editando, setEditando, valoreEdit, setValoreEdit, mostra, setMostra }) => (
        <div className="bg-gray-800 rounded-lg border border-gray-700">
            <button onClick={() => setMostra(!mostra)} className="w-full flex items-center justify-between p-4 active:bg-gray-700">
                <h3 className="text-lg font-bold text-cyan-400">{emoji} {titolo}</h3>
                {mostra ? <ChevronUp className="text-cyan-400" width={20} height={20} /> : <ChevronDown className="text-cyan-400" width={20} height={20} />}
            </button>
            {mostra && (
                <div className="p-4 pt-0">
                    <div className="flex justify-between items-center mb-3">
                        <button onClick={onAggiungi} className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">+ aggiungi</button>
                    </div>
                    <input type="text" value={nuovoValore} onChange={(e) => setNuovoValore(e.target.value)} placeholder={placeholder}
                        className="w-full mb-3 bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-2 text-white" />
                    {items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center bg-gray-900 rounded px-3 py-2 mb-2">
                            {editando === item ? (
                                <input type="text" value={valoreEdit} onChange={(e) => setValoreEdit(e.target.value)}
                                    onBlur={() => onModifica(item, valoreEdit)}
                                    onKeyPress={(e) => { if (e.key === 'Enter') onModifica(item, valoreEdit) }}
                                    autoFocus className="flex-1 bg-gray-800 border border-cyan-500 rounded px-2 py-1 text-white mr-2" />
                            ) : (
                                <span className="text-gray-300 flex-1">{item}</span>
                            )}
                            <div className="flex gap-2">
                                <button onClick={() => { setEditando(item); setValoreEdit(item) }} className="text-blue-500 active:text-blue-400">
                                    <Edit width={16} height={16} />
                                </button>
                                <button onClick={() => onElimina(item)} className="text-red-500 active:text-red-400">
                                    <Trash2 width={16} height={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )

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
                    <div className="mb-6 bg-gray-900 border-2 border-cyan-600 rounded-xl">
                        <button onClick={() => setMostraSessionePesca(!mostraSessionePesca)} className="w-full flex items-center justify-between p-6 active:bg-gray-800">
                            <h2 className="text-2xl font-bold text-cyan-400">🎣 sessione di pesca</h2>
                            {mostraSessionePesca ? <ChevronUp className="text-cyan-400" width={24} height={24} /> : <ChevronDown className="text-cyan-400" width={24} height={24} />}
                        </button>
                        {mostraSessionePesca && (
                            <div className="p-6 pt-0">
                                {!sessioneAttiva ? (
                                    <div>
                                        <p className="text-yellow-400 text-sm mb-4 text-center">obbligatoria per registrare catture</p>

                                        {localitaMemorizzate.length > 0 && (
                                            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500 rounded-lg">
                                                <p className="text-blue-300 text-xs font-semibold mb-2">Località memorizzate ({localitaMemorizzate.length}):</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {localitaMemorizzate.map((loc, i) => (
                                                        <button key={i} onClick={() => setDatiSessione(p => ({...p, localita: loc}))}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm active:bg-blue-700">{loc}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <SelectField label="località" value={datiSessione.localita} onChange={(e) => setDatiSessione(p => ({...p, localita: e.target.value}))} options={localitaMemorizzate} placeholder="es: molo di ostia" />

                                        <div className="mb-4 p-4 bg-green-900/20 border-2 border-green-500 rounded-lg">
                                            <label className="block text-green-400 text-sm font-semibold mb-2">📍 Ottieni Posizione GPS</label>
                                            <p className="text-gray-400 text-xs mb-3">Premi il pulsante per acquisire automaticamente le coordinate</p>
                                            <button onClick={ottieniPosizioneGPS} className="w-full bg-green-600 text-white py-3 rounded-lg font-bold active:bg-green-700 flex items-center justify-center gap-2">
                                                <span style={{fontSize: '24px'}}>📡</span> Usa GPS Dispositivo
                                            </button>
                                        </div>

                                        <InputField label="latitudine" type="number" value={datiSessione.latitudine} onChange={(e) => setDatiSessione(p => ({...p, latitudine: e.target.value}))} placeholder="41.415611" step="0.000001" />
                                        <InputField label="longitudine" type="number" value={datiSessione.longitudine} onChange={(e) => setDatiSessione(p => ({...p, longitudine: e.target.value}))} placeholder="12.800750" step="0.000001" />
                                        <button onClick={avviaSessione} className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-xl">avvia sessione</button>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4 mb-4">
                                            <p className="text-green-400 font-bold text-center">sessione attiva</p>
                                            <p className="text-gray-300 text-sm text-center">{datiSessione.localita}</p>
                                            <p className="text-gray-400 text-xs text-center">{datiSessione.latitudine}, {datiSessione.longitudine}</p>
                                        </div>
                                        <button onClick={terminaSessione} className="w-full bg-red-600 text-white py-3 rounded-lg font-bold">termina sessione</button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sezione Aggiungi Cattura */}
                    <Section icon={Fish} title="aggiungi cattura" isActive={activeSection === 'cattura'} onToggle={() => setActiveSection(activeSection === 'cattura' ? null : 'cattura')}>
                        <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-3 mb-4">
                            <p className="text-yellow-400 text-sm font-semibold text-center">obbligatori: sessione + specie | resto opzionale</p>
                        </div>

                        <InputField label="data" type="date" value={nuovaCattura.data} onChange={(e) => setNuovaCattura(p => ({...p, data: e.target.value}))} />
                        <InputField label="ora" value={nuovaCattura.ora} onChange={(e) => setNuovaCattura(p => ({...p, ora: e.target.value}))} />
                        <SelectField label="specie (obbligatorio)" value={nuovaCattura.specie} onChange={(e) => setNuovaCattura(p => ({...p, specie: e.target.value}))} options={specieMemorizzate} placeholder="spigola, orata..." />
                        <InputField label="peso (g)" type="number" value={nuovaCattura.peso} onChange={(e) => setNuovaCattura(p => ({...p, peso: e.target.value}))} min="0" step="1" />
                        <InputField label="lunghezza (cm)" type="number" value={nuovaCattura.lunghezza} onChange={(e) => setNuovaCattura(p => ({...p, lunghezza: e.target.value}))} min="0" step="0.1" />
                        <SelectField label="località" value={nuovaCattura.localita} onChange={(e) => setNuovaCattura(p => ({...p, localita: e.target.value}))} options={localitaMemorizzate} placeholder="molo..." />
                        <SelectField label="esca" value={nuovaCattura.esca} onChange={(e) => setNuovaCattura(p => ({...p, esca: e.target.value}))} options={escheMemorizzate} placeholder="verme..." />

                        <div className="bg-gray-800 rounded-lg p-4 border-2 border-cyan-500 mb-4">
                            <h3 className="text-cyan-400 font-bold mb-3 text-center">attrezzatura utilizzata</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <SelectField label="canna" value={nuovaCattura.canna} onChange={(e) => setNuovaCattura(p => ({...p, canna: e.target.value}))} options={canneMemorizzate} placeholder="seleziona..." />
                                <SelectField label="trave" value={nuovaCattura.trave} onChange={(e) => setNuovaCattura(p => ({...p, trave: e.target.value}))} options={traviMemorizzate} placeholder="seleziona..." />
                                <SelectField label="amo" value={nuovaCattura.amo} onChange={(e) => setNuovaCattura(p => ({...p, amo: e.target.value}))} options={amiMemorizzati} placeholder="seleziona..." />
                                <SelectField label="piombo" value={nuovaCattura.piombo} onChange={(e) => setNuovaCattura(p => ({...p, piombo: e.target.value}))} options={piombiMemorizzati} placeholder="seleziona..." />
                            </div>
                        </div>

                        <SelectField label="note" value={nuovaCattura.note} onChange={(e) => setNuovaCattura(p => ({...p, note: e.target.value}))} options={noteMemorizzate} placeholder="note..." />

                        {messaggioErrore && <div className="mt-4 p-4 bg-red-900/30 border-2 border-red-600 rounded-lg"><p className="text-red-400 font-semibold text-center">{messaggioErrore}</p></div>}
                        <button onClick={aggiungiCattura} className="w-full mt-4 bg-cyan-600 text-white py-4 rounded-lg font-bold text-xl">registra cattura</button>
                    </Section>

                    {/* Sezione Meteo */}
                    <Section icon={Cloud} title="dati meteo" isActive={activeSection === 'meteo'} onToggle={() => setActiveSection(activeSection === 'meteo' ? null : 'meteo')}>
                        <p className="text-yellow-400 text-sm mb-4 text-center">dati opzionali ma utili per analisi</p>

                        <InputField label="temperatura (°C)" type="number" value={meteo.temperatura} onChange={(e) => setMeteo(p => ({...p, temperatura: e.target.value}))} step="0.1" />
                        <InputField label="temp. acqua (°C)" type="number" value={meteo.temperaturaAcqua} onChange={(e) => setMeteo(p => ({...p, temperaturaAcqua: e.target.value}))} step="0.1" />
                        <InputField label="pressione (hPa)" type="number" value={meteo.pressione} onChange={(e) => setMeteo(p => ({...p, pressione: e.target.value}))} min="0" step="1" />
                        <InputField label="vento (nodi)" type="number" value={meteo.vento} onChange={(e) => setMeteo(p => ({...p, vento: e.target.value}))} min="0" step="1" />

                        <div className="mb-4">
                            <label className="block text-cyan-400 text-sm font-semibold mb-2">direzione vento</label>
                            <select value={meteo.direzioneVento} onChange={(e) => setMeteo(p => ({...p, direzioneVento: e.target.value}))} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white">
                                <option value="">seleziona...</option>
                                {ventiRosaDeiVenti.map(v => <option key={v} value={v}>{v}</option>)}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-cyan-400 text-sm font-semibold mb-2">condizioni</label>
                            <select value={meteo.condizioni} onChange={(e) => setMeteo(p => ({...p, condizioni: e.target.value}))} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white">
                                <option value="">seleziona...</option>
                                {condizioniMeteo.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-cyan-400 text-sm font-semibold mb-2">fase lunare</label>
                            <select value={meteo.faseLunare} onChange={(e) => setMeteo(p => ({...p, faseLunare: e.target.value}))} className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white">
                                <option value="">seleziona...</option>
                                {fasiLunari.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                        </div>

                        <InputField label="alta marea" type="time" value={meteo.altaMareaOra} onChange={(e) => setMeteo(p => ({...p, altaMareaOra: e.target.value}))} />
                        <InputField label="bassa marea" type="time" value={meteo.bassaMareaOra} onChange={(e) => setMeteo(p => ({...p, bassaMareaOra: e.target.value}))} />
                    </Section>

                    {/* Sezione Gestione */}
                    <Section icon={Wrench} title="gestione" isActive={activeSection === 'attrezzature'} onToggle={() => setActiveSection(activeSection === 'attrezzature' ? null : 'attrezzature')}>
                        <div className="space-y-6">
                            <ListaGestione titolo="località" emoji="📍" items={localitaMemorizzate} nuovoValore={nuovaLocalita} setNuovoValore={setNuovaLocalita}
                                placeholder="es: molo di fiumicino..." onAggiungi={() => aggiungiVoce(nuovaLocalita, localitaMemorizzate, setLocalitaMemorizzate, setNuovaLocalita)}
                                onModifica={(v, n) => modificaVoce(v, n, localitaMemorizzate, setLocalitaMemorizzate, setEditandoLocalita)}
                                onElimina={(v) => setLocalitaMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoLocalita} setEditando={setEditandoLocalita} valoreEdit={valoreEditLocalita} setValoreEdit={setValoreEditLocalita}
                                mostra={mostraLocalita} setMostra={setMostraLocalita} />

                            <ListaGestione titolo="specie" emoji="🐟" items={specieMemorizzate} nuovoValore={nuovaSpecie} setNuovoValore={setNuovaSpecie}
                                placeholder="es: spigola, orata..." onAggiungi={() => aggiungiVoce(nuovaSpecie, specieMemorizzate, setSpecieMemorizzate, setNuovaSpecie)}
                                onModifica={(v, n) => modificaVoce(v, n, specieMemorizzate, setSpecieMemorizzate, setEditandoSpecie)}
                                onElimina={(v) => setSpecieMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoSpecie} setEditando={setEditandoSpecie} valoreEdit={valoreEditSpecie} setValoreEdit={setValoreEditSpecie}
                                mostra={mostraSpecie} setMostra={setMostraSpecie} />

                            <ListaGestione titolo="esche" emoji="🪱" items={escheMemorizzate} nuovoValore={nuovaEsca} setNuovoValore={setNuovaEsca}
                                placeholder="es: coreano, gambero..." onAggiungi={() => aggiungiVoce(nuovaEsca, escheMemorizzate, setEscheMemorizzate, setNuovaEsca)}
                                onModifica={(v, n) => modificaVoce(v, n, escheMemorizzate, setEscheMemorizzate, setEditandoEsca)}
                                onElimina={(v) => setEscheMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoEsca} setEditando={setEditandoEsca} valoreEdit={valoreEditEsca} setValoreEdit={setValoreEditEsca}
                                mostra={mostraEsche} setMostra={setMostraEsche} />

                            <ListaGestione titolo="canne" emoji="🎣" items={canneMemorizzate} nuovoValore={nuovaCanna} setNuovoValore={setNuovaCanna}
                                placeholder="es: bolognese 6m..." onAggiungi={() => aggiungiVoce(nuovaCanna, canneMemorizzate, setCanneMemorizzate, setNuovaCanna)}
                                onModifica={(v, n) => modificaVoce(v, n, canneMemorizzate, setCanneMemorizzate, setEditandoCanna)}
                                onElimina={(v) => setCanneMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoCanna} setEditando={setEditandoCanna} valoreEdit={valoreEditCanna} setValoreEdit={setValoreEditCanna}
                                mostra={mostraCanne} setMostra={setMostraCanne} />

                            <ListaGestione titolo="travi" emoji="🧵" items={traviMemorizzate} nuovoValore={nuovoTrave} setNuovoValore={setNuovoTrave}
                                placeholder="es: 0.20mm..." onAggiungi={() => aggiungiVoce(nuovoTrave, traviMemorizzate, setTraviMemorizzate, setNuovoTrave)}
                                onModifica={(v, n) => modificaVoce(v, n, traviMemorizzate, setTraviMemorizzate, setEditandoTrave)}
                                onElimina={(v) => setTraviMemorizzate(prev => prev.filter(x => x !== v))}
                                editando={editandoTrave} setEditando={setEditandoTrave} valoreEdit={valoreEditTrave} setValoreEdit={setValoreEditTrave}
                                mostra={mostraTravi} setMostra={setMostraTravi} />

                            <ListaGestione titolo="ami" emoji="🪝" items={amiMemorizzati} nuovoValore={nuovoAmo} setNuovoValore={setNuovoAmo}
                                placeholder="es: n.8..." onAggiungi={() => aggiungiVoce(nuovoAmo, amiMemorizzati, setAmiMemorizzati, setNuovoAmo)}
                                onModifica={(v, n) => modificaVoce(v, n, amiMemorizzati, setAmiMemorizzati, setEditandoAmo)}
                                onElimina={(v) => setAmiMemorizzati(prev => prev.filter(x => x !== v))}
                                editando={editandoAmo} setEditando={setEditandoAmo} valoreEdit={valoreEditAmo} setValoreEdit={setValoreEditAmo}
                                mostra={mostraAmi} setMostra={setMostraAmi} />

                            <ListaGestione titolo="piombi" emoji="⚓" items={piombiMemorizzati} nuovoValore={nuovoPiombo} setNuovoValore={setNuovoPiombo}
                                placeholder="es: 50g..." onAggiungi={() => aggiungiVoce(nuovoPiombo, piombiMemorizzati, setPiombiMemorizzati, setNuovoPiombo)}
                                onModifica={(v, n) => modificaVoce(v, n, piombiMemorizzati, setPiombiMemorizzati, setEditandoPiombo)}
                                onElimina={(v) => setPiombiMemorizzati(prev => prev.filter(x => x !== v))}
                                editando={editandoPiombo} setEditando={setEditandoPiombo} valoreEdit={valoreEditPiombo} setValoreEdit={setValoreEditPiombo}
                                mostra={mostraPiombi} setMostra={setMostraPiombi} />
                        </div>
                    </Section>

                    {/* Sezione Analisi */}
                    <Section icon={BarChart3} title="analizza dati" isActive={activeSection === 'analisi'} onToggle={() => setActiveSection(activeSection === 'analisi' ? null : 'analisi')}>
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

                                <button onClick={() => setMostraRegistro(!mostraRegistro)} className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold mb-4">
                                    {mostraRegistro ? 'nascondi registro' : 'mostra registro'}
                                </button>

                                <button onClick={esportaDati} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">
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
