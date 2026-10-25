/**
 * Pianifica uscita: suggerisce lo spot migliore di una zona confrontando il
 * meteo del giorno scelto (previsto e correggibile a mano) con lo storico.
 *
 * Legge catture e sessioni in sola lettura: non modifica mai i dati dell'app.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Section from '../Section'
import { RefreshCw } from '../Icons'
import { useTranslation } from '../../locales/LanguageContext'
import {
    costruisciUscite, elencoSpot, centroZona, valutaSpot, parseOra, faseLunare, distribuzioneMarea, TIDE_PHASES
} from '../../utils/pianifica/spotAdvisor'
import { scaricaPrevisione, scaricaStorico, dataOggi, dataMassimaPrevisione } from '../../utils/pianifica/meteoPianifica'
import { caricaConfig, salvaConfig, caricaArchivio, salvaArchivio } from '../../utils/pianifica/storage'
import { CampoMeteo, CAMPI_METEO } from './CampiMeteo'
import { ClassificaSpot, DettaglioSpot } from './RisultatiSpot'
import GestioneZone from './GestioneZone'

const GIORNI_PREVISIONE = 7
const GIORNI_PREVISIONE_AFFIDABILE = 3

const PlannerIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
)

const campiVuoti = () => Object.fromEntries(CAMPI_METEO.map(c => [c, { valore: null, origine: null }]))

const inputClass = 'w-full bg-gray-900 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none'

const PianificaUscita = ({ catture, sessioniCompletate, activeSection, setActiveSection }) => {
    const { t } = useTranslation()
    const aperta = activeSection === 'pianifica'

    const [config, setConfig] = useState(caricaConfig)
    const [archivio, setArchivio] = useState(caricaArchivio)
    const [vista, setVista] = useState('form')
    const [zonaId, setZonaId] = useState('')
    const [data, setData] = useState(dataOggi)
    const [oraInizio, setOraInizio] = useState('06:00')
    const [oraFine, setOraFine] = useState('10:00')
    const [campi, setCampi] = useState(campiVuoti)
    const [maree, setMaree] = useState({ alta1: '', alta2: '', bassa1: '', bassa2: '' })
    const [caricamento, setCaricamento] = useState(false)
    const [erroriPrevisione, setErroriPrevisione] = useState([])
    const [ricarica, setRicarica] = useState(0)
    const [calcolo, setCalcolo] = useState(null)
    const [correzioniSpot, setCorrezioniSpot] = useState({})
    const [spotAperto, setSpotAperto] = useState(null)
    const richiestaRef = useRef(0)

    // Rilegge zone e archivio quando la sezione si apre o i dati cambiano
    // (es. ripristino di un backup), per non lavorare su una copia superata
    useEffect(() => {
        if (!aperta) return
        setConfig(caricaConfig())
        setArchivio(caricaArchivio())
    }, [aperta, sessioniCompletate, catture])

    const aggiornaConfig = useCallback((nuova) => {
        setConfig(nuova)
        salvaConfig(nuova)
    }, [])

    // --- Dati derivati (sola lettura dei dati dell'app) ---
    const uscite = useMemo(
        () => (aperta ? costruisciUscite(sessioniCompletate, catture, archivio) : []),
        [aperta, sessioniCompletate, catture, archivio]
    )
    const spotDisponibili = useMemo(() => elencoSpot(uscite), [uscite])

    const spotDellaZona = useCallback((id) => spotDisponibili
        .filter(s => config.spot[s.nome]?.zonaId === id)
        .map(s => ({ ...s, tipo: config.spot[s.nome]?.tipo || 'mare' })), [spotDisponibili, config])

    const zoneUtilizzabili = useMemo(
        () => config.zone.filter(z => spotDellaZona(z.id).length > 0),
        [config.zone, spotDellaZona]
    )

    // Zona selezionata di default: la prima utilizzabile
    useEffect(() => {
        if (!zoneUtilizzabili.some(z => z.id === zonaId)) setZonaId(zoneUtilizzabili[0]?.id || '')
    }, [zoneUtilizzabili, zonaId])

    const spotZona = useMemo(() => spotDellaZona(zonaId), [spotDellaZona, zonaId])
    const centro = useMemo(() => centroZona(spotZona), [spotZona])
    const zonaMare = spotZona.some(s => s.tipo === 'mare')

    const finestra = useMemo(() => {
        const inizioMin = parseOra(oraInizio)
        let fineMin = parseOra(oraFine)
        if (inizioMin !== null && fineMin !== null && fineMin <= inizioMin) fineMin += 1440
        return { inizioMin, fineMin }
    }, [oraInizio, oraFine])

    const mareeMinuti = useMemo(() => ({
        alte: [parseOra(maree.alta1), parseOra(maree.alta2)].filter(m => m !== null),
        basse: [parseOra(maree.bassa1), parseOra(maree.bassa2)].filter(m => m !== null)
    }), [maree])

    const distribuzionePrevista = useMemo(
        () => (zonaMare ? distribuzioneMarea(mareeMinuti, finestra.inizioMin, finestra.fineMin) : null),
        [zonaMare, mareeMinuti, finestra]
    )

    // --- Previsioni: precompila i campi non modificati a mano ---
    const lat = centro?.lat
    const lng = centro?.lng
    useEffect(() => {
        if (!aperta || vista !== 'form' || lat === undefined || !data || finestra.inizioMin === null) return
        const richiesta = ++richiestaRef.current
        setCaricamento(true)
        scaricaPrevisione(lat, lng, data, finestra.inizioMin, finestra.fineMin, { mare: zonaMare })
            .then(({ meteo, errori }) => {
                if (richiesta !== richiestaRef.current) return
                setErroriPrevisione(errori)
                setCampi(prev => Object.fromEntries(CAMPI_METEO.map(c => {
                    if (prev[c]?.origine === 'mod') return [c, prev[c]]
                    const valore = meteo[c] ?? null
                    return [c, { valore, origine: valore === null ? null : c === 'luna' ? 'calc' : 'prev' }]
                })))
            })
            .catch(() => {
                if (richiesta === richiestaRef.current) setErroriPrevisione(['rete'])
            })
            .finally(() => {
                if (richiesta === richiestaRef.current) setCaricamento(false)
            })
    }, [aperta, vista, lat, lng, data, finestra, zonaMare, ricarica])

    // Le correzioni per spot valgono solo per la zona in cui sono state fatte
    useEffect(() => { setCorrezioniSpot({}) }, [zonaId])

    const modificaCampo = (campo, valore) => {
        setCampi(prev => ({ ...prev, [campo]: { valore, origine: 'mod' } }))
    }

    const ripristinaPrevisione = () => {
        setCampi(prev => Object.fromEntries(CAMPI_METEO.map(c => [c, prev[c].origine === 'mod' ? { valore: null, origine: null } : prev[c]])))
        setRicarica(r => r + 1)
    }

    const previsto = useMemo(() => {
        const p = Object.fromEntries(CAMPI_METEO.map(c => [c, campi[c].valore]))
        if (!p.luna) p.luna = faseLunare(data)
        return { ...p, maree: mareeMinuti }
    }, [campi, data, mareeMinuti])

    // --- Calcolo classifica ---
    const trovaSpot = async () => {
        const nomi = new Set(spotZona.map(s => s.nome))
        const mancanti = uscite.filter(u => nomi.has(u.spot) && !u.meteo)
        if (mancanti.length > 0) {
            setCalcolo({ fatti: 0, totale: 1 })
            try {
                const mareBySpot = Object.fromEntries(spotZona.map(s => [s.nome, s.tipo === 'mare']))
                const { meteo } = await scaricaStorico(mancanti, {
                    mareBySpot,
                    onProgress: (fatti, totale) => setCalcolo({ fatti, totale })
                })
                if (Object.keys(meteo).length > 0) {
                    const nuovo = { ...archivio, ...meteo }
                    setArchivio(nuovo)
                    salvaArchivio(nuovo)
                }
            } catch (e) {
                console.warn('Pianifica uscita: meteo storico non disponibile', e)
            } finally {
                setCalcolo(null)
            }
        }
        setVista('risultati')
    }

    const classifica = useMemo(() => {
        if (vista !== 'risultati' && vista !== 'dettaglio') return []
        return valutaSpot({ uscite, spot: spotZona, previsto, correzioniSpot, finestra })
    }, [vista, uscite, spotZona, previsto, correzioniSpot, finestra])

    const nSessioniZona = useMemo(() => {
        const nomi = new Set(spotZona.map(s => s.nome))
        return uscite.filter(u => nomi.has(u.spot)).length
    }, [uscite, spotZona])

    const giorniAvanti = Math.round((Date.parse(data) - Date.parse(dataOggi())) / 86400000)

    // --- Render ---
    const contenuto = () => {
        if (vista === 'zone') {
            return (
                <GestioneZone
                    config={config}
                    onChange={aggiornaConfig}
                    spotDisponibili={spotDisponibili}
                    onChiudi={() => setVista('form')}
                />
            )
        }

        if (spotDisponibili.length === 0) {
            return <p className="text-gray-400 text-sm text-center">{t('planner.noSessions')}</p>
        }

        if (zoneUtilizzabili.length === 0) {
            return (
                <div className="text-center">
                    <p className="text-gray-300 text-sm mb-3">{t('planner.setupZones')}</p>
                    <button onClick={() => setVista('zone')} className="bg-cyan-600 text-white px-4 py-2.5 rounded-lg font-bold active:bg-cyan-700">
                        {t('planner.manageZones')}
                    </button>
                </div>
            )
        }

        if (vista === 'dettaglio') {
            const r = classifica.find(x => x.spot === spotAperto)
            if (r) {
                return (
                    <DettaglioSpot
                        risultato={r}
                        correzioni={correzioniSpot[r.spot]}
                        onCorreggi={(campo, valore) => setCorrezioniSpot(prev => ({ ...prev, [r.spot]: { ...(prev[r.spot] || {}), [campo]: valore } }))}
                        onRipristina={() => setCorrezioniSpot(prev => {
                            const { [r.spot]: _, ...resto } = prev
                            return resto
                        })}
                        onIndietro={() => setVista('risultati')}
                    />
                )
            }
        }

        if (vista === 'risultati' || vista === 'dettaglio') {
            return (
                <ClassificaSpot
                    classifica={classifica}
                    nSessioni={nSessioniZona}
                    modificati={CAMPI_METEO.filter(c => campi[c].origine === 'mod').map(c => t(`planner.factors.${c}`))}
                    avvisoLontano={giorniAvanti > GIORNI_PREVISIONE_AFFIDABILE}
                    onApri={(nome) => { setSpotAperto(nome); setVista('dettaglio') }}
                    onIndietro={() => setVista('form')}
                />
            )
        }

        return (
            <div>
                <p className="text-gray-400 text-xs sm:text-sm mb-3">{t('planner.subtitle')}</p>

                <div className="bg-gray-800 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-cyan-400 font-semibold text-sm">{t('planner.whenWhere')}</h3>
                        <button onClick={() => setVista('zone')} className="text-cyan-400 text-xs underline">{t('planner.manageZones')}</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <label className="col-span-2 text-gray-400 text-xs">
                            {t('planner.zone')}
                            <select value={zonaId} onChange={(e) => setZonaId(e.target.value)} className={inputClass}>
                                {zoneUtilizzabili.map(z => <option key={z.id} value={z.id}>{z.nome}</option>)}
                            </select>
                        </label>
                        <label className="col-span-2 text-gray-400 text-xs">
                            {t('planner.date')}
                            <input type="date" value={data} min={dataOggi()} max={dataMassimaPrevisione(GIORNI_PREVISIONE)}
                                onChange={(e) => e.target.value && setData(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }} />
                        </label>
                        <label className="text-gray-400 text-xs">
                            {t('planner.from')}
                            <input type="time" value={oraInizio} onChange={(e) => e.target.value && setOraInizio(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }} />
                        </label>
                        <label className="text-gray-400 text-xs">
                            {t('planner.to')}
                            <input type="time" value={oraFine} onChange={(e) => e.target.value && setOraFine(e.target.value)} className={inputClass} style={{ colorScheme: 'dark' }} />
                        </label>
                    </div>
                    <p className="text-gray-500 text-xs mt-2">{t('planner.spotsInZone', { count: spotZona.length })}</p>
                </div>

                <div className="bg-gray-800 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="text-cyan-400 font-semibold text-sm">{t('planner.forecastTitle')}</h3>
                        <button onClick={ripristinaPrevisione} disabled={caricamento} className="text-gray-400 text-xs flex items-center gap-1 disabled:opacity-50">
                            <RefreshCw width={14} height={14} className={caricamento ? 'animate-spin' : ''} />
                            {t('planner.resetForecast')}
                        </button>
                    </div>
                    <p className="text-gray-500 text-xs mb-1">{t('planner.forecastHelp')}</p>
                    {erroriPrevisione.length > 0 && !caricamento && (
                        <p className="text-yellow-400 text-xs mb-1">{t('planner.forecastError')}</p>
                    )}
                    {CAMPI_METEO.filter(c => zonaMare || c !== 'onde').map(c => (
                        <CampoMeteo key={c} campo={c} valore={campi[c].valore} origine={campi[c].origine} onChange={(v) => modificaCampo(c, v)} />
                    ))}
                </div>

                {zonaMare && (
                    <div className="bg-gray-800 rounded-lg p-3 mb-3">
                        <h3 className="text-cyan-400 font-semibold text-sm mb-1">{t('planner.tidesTitle')}</h3>
                        <p className="text-gray-500 text-xs mb-2">{t('planner.tidesHelp')}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {['alta1', 'alta2', 'bassa1', 'bassa2'].map(k => (
                                <label key={k} className="text-gray-400 text-xs">
                                    {t(`planner.tide.${k}`)}
                                    <input type="time" value={maree[k]} onChange={(e) => setMaree(m => ({ ...m, [k]: e.target.value }))} className={inputClass} style={{ colorScheme: 'dark' }} />
                                </label>
                            ))}
                        </div>
                        {distribuzionePrevista && (
                            <div className="flex gap-1 mt-2">
                                {TIDE_PHASES.map(f => (
                                    <div key={f} className={`flex-1 text-center text-xs rounded py-1 ${distribuzionePrevista[f] > 0 ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                        {t(`planner.tide.${f}`)} {Math.round(distribuzionePrevista[f] * 100)}%
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <button
                    onClick={trovaSpot}
                    disabled={!!calcolo}
                    className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold active:bg-cyan-700 disabled:opacity-60"
                >
                    {calcolo ? t('planner.loadingHistory', { done: calcolo.fatti, total: calcolo.totale }) : t('planner.find')}
                </button>
            </div>
        )
    }

    return (
        <Section
            icon={PlannerIcon}
            title={t('planner.title')}
            isActive={aperta}
            onToggle={() => setActiveSection(aperta ? null : 'pianifica')}
        >
            {contenuto()}
        </Section>
    )
}

export default PianificaUscita
