import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from './Icons'

const ITEMS_PER_PAGE = 10

const RegistroCatture = ({ catture, setCatture, filtri }) => {
    const [paginaCatture, setPaginaCatture] = useState(0)
    const [cattureEspanse, setCattureEspanse] = useState({})
    const [mostraCatture, setMostraCatture] = useState(false)

    // Filtra catture
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

    const cattureFiltrate = getCattureFiltrate()
    const totalePagine = Math.max(1, Math.ceil(cattureFiltrate.length / ITEMS_PER_PAGE))

    const getCatturePaginate = () => {
        const filtrate = cattureFiltrate.slice().reverse()
        return filtrate.slice(paginaCatture * ITEMS_PER_PAGE, (paginaCatture + 1) * ITEMS_PER_PAGE)
    }

    const toggleCatturaEspansa = (id) => {
        setCattureEspanse(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const eliminaCattura = (cattura) => {
        if (window.confirm(`Cancellare la cattura di ${cattura.specie}?`)) {
            setCatture(prev => prev.filter(x => x.id !== cattura.id))
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg border-2 border-cyan-500 mb-6">
            <button
                onClick={() => setMostraCatture(!mostraCatture)}
                className="w-full flex items-center justify-between p-4 active:bg-gray-700"
            >
                <h3 className="text-cyan-400 font-bold text-xl flex items-center gap-2">
                    📊 registro catture ({cattureFiltrate.length})
                </h3>
                {mostraCatture ? (
                    <ChevronUp className="text-cyan-400" width={24} height={24} />
                ) : (
                    <ChevronDown className="text-cyan-400" width={24} height={24} />
                )}
            </button>

            {mostraCatture && (
                <div className="p-4 pt-0">
                    <div className="space-y-3">
                        {getCatturePaginate().map(c => {
                            const isEspansa = cattureEspanse[c.id]
                            return (
                                <div key={c.id} className="bg-gray-900 rounded-lg border border-gray-700">
                                    <div
                                        onClick={() => toggleCatturaEspansa(c.id)}
                                        className="flex justify-between items-start p-4 cursor-pointer active:bg-gray-800"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-white font-bold text-xl">{c.specie}</h4>
                                                {isEspansa ? (
                                                    <ChevronUp className="text-cyan-400" width={20} height={20} />
                                                ) : (
                                                    <ChevronDown className="text-cyan-400" width={20} height={20} />
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-sm">{c.data} - {c.ora}</p>
                                            {c.meteo?.direzioneVento && (
                                                <p className="text-cyan-300 text-sm mt-1">
                                                    🌬️ {c.meteo.direzioneVento.split(' ')[0]}
                                                </p>
                                            )}

                                            {/* Dettagli espansi */}
                                            {isEspansa && (
                                                <DettagliCattura cattura={c} />
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                eliminaCattura(c)
                                            }}
                                            className="text-red-500 ml-3"
                                        >
                                            <Trash2 width={20} height={20} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Paginazione */}
                    {totalePagine > 1 && (
                        <div className="flex items-center justify-center gap-3 mt-4">
                            <button
                                onClick={() => setPaginaCatture(Math.max(0, paginaCatture - 1))}
                                disabled={paginaCatture === 0}
                                className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed active:bg-cyan-700"
                            >
                                ← Precedente
                            </button>
                            <span className="text-gray-300 text-sm">
                                Pagina {paginaCatture + 1} di {totalePagine}
                            </span>
                            <button
                                onClick={() => setPaginaCatture(Math.min(totalePagine - 1, paginaCatture + 1))}
                                disabled={paginaCatture >= totalePagine - 1}
                                className="bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed active:bg-cyan-700"
                            >
                                Successiva →
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

// Sub-component: Dettagli cattura espansa
const DettagliCattura = ({ cattura: c }) => (
    <>
        <div className="mt-3 pt-3 border-t border-gray-700">
            <h5 className="text-cyan-400 font-semibold mb-2 text-sm">dati cattura</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
                {c.peso && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">peso:</span> {(parseFloat(c.peso) / 1000).toFixed(2)} kg
                    </p>
                )}
                {c.lunghezza && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">lunghezza:</span> {c.lunghezza} cm
                    </p>
                )}
                {c.localita && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">località:</span> {c.localita}
                    </p>
                )}
                {c.esca && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">esca:</span> {c.esca}
                    </p>
                )}
                {c.canna && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">canna:</span> {c.canna}
                    </p>
                )}
                {c.trave && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">trave:</span> {c.trave}
                    </p>
                )}
                {c.amo && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">amo:</span> {c.amo}
                    </p>
                )}
                {c.piombo && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">piombo:</span> {c.piombo}
                    </p>
                )}
            </div>
            {c.note && (
                <p className="text-gray-400 text-sm mt-2 italic">
                    <span className="text-cyan-400">note:</span> {c.note}
                </p>
            )}
        </div>

        {/* Dati meteo */}
        {c.meteo && Object.values(c.meteo).some(Boolean) && (
            <div className="mt-3 pt-3 border-t border-gray-700">
                <h5 className="text-cyan-400 font-semibold mb-2 text-sm">dati meteo</h5>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {c.meteo.temperatura && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">temp aria:</span> {c.meteo.temperatura}°C
                        </p>
                    )}
                    {c.meteo.temperaturaAcqua && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">temp acqua:</span> {c.meteo.temperaturaAcqua}°C
                        </p>
                    )}
                    {c.meteo.pressione && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">pressione:</span> {c.meteo.pressione} hPa
                        </p>
                    )}
                    {c.meteo.vento && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">vento:</span> {c.meteo.vento} nodi
                        </p>
                    )}
                    {c.meteo.direzioneVento && (
                        <p className="text-gray-300 col-span-2">
                            <span className="text-cyan-400">direzione:</span> {c.meteo.direzioneVento}
                        </p>
                    )}
                    {c.meteo.condizioni && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">condizioni:</span> {c.meteo.condizioni}
                        </p>
                    )}
                    {c.meteo.faseLunare && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">luna:</span> {c.meteo.faseLunare}
                        </p>
                    )}
                </div>
            </div>
        )}
    </>
)

export default RegistroCatture
