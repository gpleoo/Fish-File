import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from './Icons'
import { useTranslation } from '../locales/LanguageContext'

const ITEMS_PER_PAGE = 10

const SessioniRegistrate = ({ sessioni, catture, onDeleteSessione, filtri }) => {
    const { t } = useTranslation()
    const [espansa, setEspansa] = useState(false)
    const [sessioneEspansa, setSessioneEspansa] = useState(null)
    const [pagina, setPagina] = useState(0)

    // Funzione per filtrare catture
    const filtraCatture = (cattureSessione) => {
        if (!filtri) return cattureSessione

        return cattureSessione.filter(c => {
            // Filtro anno
            if (filtri.anno !== 'tutti' && c.data && !c.data.startsWith(filtri.anno)) return false

            // Filtro mese
            if (filtri.mese !== 'tutti' && c.data) {
                const mese = c.data.split('-')[1]
                if (mese !== filtri.mese) return false
            }

            // Filtro specie
            if (filtri.specie !== 'tutte' && c.specie !== filtri.specie) return false

            // Filtro località
            if (filtri.localita !== 'tutte' && c.localita !== filtri.localita) return false

            // Filtro direzione vento
            if (filtri.direzioneVento !== 'tutte' && c.meteo?.direzioneVento !== filtri.direzioneVento) return false

            // Filtro condizioni meteo
            if (filtri.condizioni !== 'tutte' && c.meteo?.condizioni !== filtri.condizioni) return false

            // Filtro fase lunare
            if (filtri.faseLunare !== 'tutte' && c.meteo?.faseLunare !== filtri.faseLunare) return false

            return true
        })
    }

    // Controlla se ci sono filtri attivi
    const hasFiltriAttivi = filtri && Object.entries(filtri).some(([key, val]) =>
        val !== 'tutti' && val !== 'tutte'
    )

    // Filtra sessioni che hanno catture matchanti
    const sessioniFiltrate = (!sessioni || sessioni.length === 0) ? [] : sessioni.filter(sessione => {
        if (!hasFiltriAttivi) return true // Mostra tutte se non ci sono filtri

        const cattureSessione = catture.filter(c => c.sessioneId === sessione.id)
        const cattureFiltrate = filtraCatture(cattureSessione)
        return cattureFiltrate.length > 0
    })

    if (sessioniFiltrate.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
                <h4 className="text-cyan-400 font-bold mb-2 text-sm sm:text-base">{t('sessions.title')}</h4>
                <p className="text-gray-500 text-center py-3 sm:py-4 text-sm">
                    {hasFiltriAttivi ? t('sessions.noMatchingFilters') : t('sessions.noSessions')}
                </p>
            </div>
        )
    }

    // Calcola catture filtrate per ogni sessione
    const getCattureSessione = (sessioneId) => {
        const cattureSessione = catture.filter(c => c.sessioneId === sessioneId)
        return hasFiltriAttivi ? filtraCatture(cattureSessione) : cattureSessione
    }

    // Formatta durata
    const calcolaDurata = (sessione) => {
        if (!sessione.dataInizio || !sessione.oraInizio || !sessione.dataFine || !sessione.oraFine) {
            return 'N/D'
        }
        try {
            const inizio = new Date(`${sessione.dataInizio}T${sessione.oraInizio}`)
            const fine = new Date(`${sessione.dataFine}T${sessione.oraFine}`)
            const diffMs = fine - inizio
            const ore = Math.floor(diffMs / (1000 * 60 * 60))
            const minuti = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
            return `${ore}h ${minuti}m`
        } catch {
            return 'N/D'
        }
    }

    // Ordina sessioni per data (più recenti prima)
    const sessioniOrdinate = [...sessioniFiltrate].sort((a, b) => {
        const dataA = new Date(`${a.dataInizio}T${a.oraInizio || '00:00'}`)
        const dataB = new Date(`${b.dataInizio}T${b.oraInizio || '00:00'}`)
        return dataB - dataA
    })

    // Paginazione
    const totalePagine = Math.max(1, Math.ceil(sessioniOrdinate.length / ITEMS_PER_PAGE))
    const sessioniPaginate = sessioniOrdinate.slice(
        pagina * ITEMS_PER_PAGE,
        (pagina + 1) * ITEMS_PER_PAGE
    )

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
            <button
                onClick={() => setEspansa(!espansa)}
                className="w-full flex items-center justify-between min-h-[44px]"
            >
                <h4 className="text-cyan-400 font-bold text-sm sm:text-base">
                    {t('sessions.title')} ({sessioniFiltrate.length}{hasFiltriAttivi ? ` ${t('common.of')} ${sessioni.length}` : ''})
                </h4>
                {espansa ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
            </button>

            {espansa && (
                <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                    {sessioniPaginate.map((sessione) => {
                        const cattureSessione = getCattureSessione(sessione.id)
                        const numCatture = cattureSessione.length
                        const isEspansa = sessioneEspansa === sessione.id

                        return (
                            <div
                                key={sessione.id}
                                className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden"
                            >
                                {/* Header sessione */}
                                <button
                                    onClick={() => setSessioneEspansa(isEspansa ? null : sessione.id)}
                                    className="w-full p-2.5 sm:p-3 flex items-center justify-between active:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                                        <span
                                            className={`w-3 h-3 rounded-full flex-shrink-0 ${
                                                numCatture === 0 ? 'bg-red-500' :
                                                numCatture <= 4 ? 'bg-pink-500' :
                                                numCatture <= 8 ? 'bg-green-500' :
                                                'bg-blue-500'
                                            }`}
                                        />
                                        <div className="text-left min-w-0 flex-1">
                                            <p className="text-white font-medium text-sm sm:text-base truncate">
                                                {sessione.localita || t('map.unknownLocation')}
                                            </p>
                                            <p className="text-gray-400 text-xs truncate">
                                                {sessione.dataInizio} - {numCatture} {t('map.catches')} - {calcolaDurata(sessione)}
                                            </p>
                                        </div>
                                    </div>
                                    {isEspansa ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                                    )}
                                </button>

                                {/* Dettagli sessione espansa */}
                                {isEspansa && (
                                    <div className="p-2.5 sm:p-3 border-t border-gray-700 bg-gray-950">
                                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm mb-2 sm:mb-3">
                                            <div>
                                                <span className="text-gray-500">{t('sessions.start')}:</span>
                                                <span className="text-white ml-1 sm:ml-2">{sessione.oraInizio || 'N/D'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">{t('sessions.end')}:</span>
                                                <span className="text-white ml-1 sm:ml-2">{sessione.oraFine || 'N/D'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Lat:</span>
                                                <span className="text-white ml-1 sm:ml-2">{sessione.latitudine?.toFixed(4) || 'N/D'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Lng:</span>
                                                <span className="text-white ml-1 sm:ml-2">{sessione.longitudine?.toFixed(4) || 'N/D'}</span>
                                            </div>
                                        </div>

                                        {/* Lista catture della sessione */}
                                        {numCatture > 0 && (
                                            <div className="mt-2">
                                                <p className="text-gray-400 text-xs mb-1.5 sm:mb-2">{t('map.catches')}:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {cattureSessione.map((c) => (
                                                        <span
                                                            key={c.id || `${c.specie}-${c.data}-${c.ora}`}
                                                            className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs"
                                                        >
                                                            {c.specie} {c.peso ? `(${c.peso}g)` : ''}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pulsante elimina */}
                                        {onDeleteSessione && (
                                            <button
                                                onClick={() => {
                                                    if (window.confirm(t('sessions.deleteConfirm', { location: sessione.localita }))) {
                                                        onDeleteSessione(sessione.id)
                                                    }
                                                }}
                                                className="mt-2 sm:mt-3 flex items-center gap-2 text-red-400 text-xs sm:text-sm active:text-red-300 min-h-[36px]"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                {t('sessions.delete')}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    {/* Paginazione */}
                    {totalePagine > 1 && (
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-gray-700">
                            <button
                                onClick={() => setPagina(Math.max(0, pagina - 1))}
                                disabled={pagina === 0}
                                className="pagination-btn bg-cyan-600 text-white rounded font-bold disabled:opacity-30 disabled:cursor-not-allowed active:bg-cyan-700 transition-colors"
                            >
                                {t('common.prev')}
                            </button>
                            <span className="text-gray-400 text-xs sm:text-sm min-w-[60px] text-center">
                                {pagina + 1} / {totalePagine}
                            </span>
                            <button
                                onClick={() => setPagina(Math.min(totalePagine - 1, pagina + 1))}
                                disabled={pagina >= totalePagine - 1}
                                className="pagination-btn bg-cyan-600 text-white rounded font-bold disabled:opacity-30 disabled:cursor-not-allowed active:bg-cyan-700 transition-colors"
                            >
                                {t('common.next')}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default SessioniRegistrate
