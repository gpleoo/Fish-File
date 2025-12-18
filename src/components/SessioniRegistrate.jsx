import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from './Icons'

const SessioniRegistrate = ({ sessioni, catture, onDeleteSessione }) => {
    const [espansa, setEspansa] = useState(false)
    const [sessioneEspansa, setSessioneEspansa] = useState(null)

    if (!sessioni || sessioni.length === 0) {
        return (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
                <h4 className="text-cyan-400 font-bold mb-2">sessioni registrate</h4>
                <p className="text-gray-500 text-center py-4">Nessuna sessione completata</p>
            </div>
        )
    }

    // Calcola catture per ogni sessione
    const getCattureSessione = (sessioneId) => {
        return catture.filter(c => c.sessioneId === sessioneId)
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
    const sessioniOrdinate = [...sessioni].sort((a, b) => {
        const dataA = new Date(`${a.dataInizio}T${a.oraInizio || '00:00'}`)
        const dataB = new Date(`${b.dataInizio}T${b.oraInizio || '00:00'}`)
        return dataB - dataA
    })

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
            <button
                onClick={() => setEspansa(!espansa)}
                className="w-full flex items-center justify-between"
            >
                <h4 className="text-cyan-400 font-bold">sessioni registrate ({sessioni.length})</h4>
                {espansa ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>

            {espansa && (
                <div className="mt-4 space-y-3">
                    {sessioniOrdinate.map((sessione) => {
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
                                    className="w-full p-3 flex items-center justify-between hover:bg-gray-800 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={`w-3 h-3 rounded-full ${
                                                numCatture === 0 ? 'bg-red-500' :
                                                numCatture <= 4 ? 'bg-pink-500' :
                                                numCatture <= 8 ? 'bg-green-500' :
                                                'bg-blue-500'
                                            }`}
                                        />
                                        <div className="text-left">
                                            <p className="text-white font-medium">
                                                {sessione.localita || 'Località sconosciuta'}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                {sessione.dataInizio} • {numCatture} catture • {calcolaDurata(sessione)}
                                            </p>
                                        </div>
                                    </div>
                                    {isEspansa ? (
                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                    )}
                                </button>

                                {/* Dettagli sessione espansa */}
                                {isEspansa && (
                                    <div className="p-3 border-t border-gray-700 bg-gray-950">
                                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                            <div>
                                                <span className="text-gray-500">Inizio:</span>
                                                <span className="text-white ml-2">{sessione.oraInizio || 'N/D'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Fine:</span>
                                                <span className="text-white ml-2">{sessione.oraFine || 'N/D'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Lat:</span>
                                                <span className="text-white ml-2">{sessione.latitudine?.toFixed(4) || 'N/D'}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500">Lng:</span>
                                                <span className="text-white ml-2">{sessione.longitudine?.toFixed(4) || 'N/D'}</span>
                                            </div>
                                        </div>

                                        {/* Lista catture della sessione */}
                                        {numCatture > 0 && (
                                            <div className="mt-2">
                                                <p className="text-gray-400 text-xs mb-2">Catture:</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {cattureSessione.map((c, idx) => (
                                                        <span
                                                            key={idx}
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
                                                    if (window.confirm(`Eliminare la sessione a ${sessione.localita}? Le catture associate NON verranno eliminate.`)) {
                                                        onDeleteSessione(sessione.id)
                                                    }
                                                }}
                                                className="mt-3 flex items-center gap-2 text-red-400 text-sm hover:text-red-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Elimina sessione
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SessioniRegistrate
