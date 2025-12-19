import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp } from './Icons'

const MESI_ITALIANI = [
    'Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu',
    'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'
]

// Colori per le barre dei grafici
const COLORI_BARRE = [
    '#06b6d4', // cyan
    '#22c55e', // green
    '#f59e0b', // amber
    '#ec4899', // pink
    '#8b5cf6', // violet
    '#ef4444', // red
    '#3b82f6', // blue
    '#14b8a6', // teal
]

const GraficiStatistiche = ({ catture, filtri }) => {
    const [mostraGrafici, setMostraGrafici] = useState(false)
    const [graficoAttivo, setGraficoAttivo] = useState('mese') // 'mese', 'specie' o 'vento'

    // Filtra catture in base ai filtri attivi
    const cattureFiltrate = useMemo(() => {
        if (!catture || catture.length === 0) return []

        return catture.filter(c => {
            if (!c.data) return false
            const [anno, mese] = c.data.split('-')

            if (filtri.anno !== 'tutti' && anno !== filtri.anno) return false
            if (filtri.mese !== 'tutti' && mese !== filtri.mese) return false
            if (filtri.specie !== 'tutte' && c.specie !== filtri.specie) return false
            if (filtri.localita !== 'tutte' && c.localita !== filtri.localita) return false

            return true
        })
    }, [catture, filtri])

    // Calcola catture per mese
    const catturePerMese = useMemo(() => {
        const conteggio = {}

        cattureFiltrate.forEach(c => {
            if (!c.data) return
            const mese = parseInt(c.data.split('-')[1]) - 1 // 0-11
            conteggio[mese] = (conteggio[mese] || 0) + 1
        })

        // Crea array con tutti i mesi
        const risultato = MESI_ITALIANI.map((nome, idx) => ({
            mese: nome,
            indice: idx,
            catture: conteggio[idx] || 0
        }))

        return risultato
    }, [cattureFiltrate])

    // Calcola specie piu catturate (top 8)
    const speciePiuCatturate = useMemo(() => {
        const conteggio = {}

        cattureFiltrate.forEach(c => {
            if (!c.specie) return
            conteggio[c.specie] = (conteggio[c.specie] || 0) + 1
        })

        // Ordina per numero catture e prendi top 8
        const ordinato = Object.entries(conteggio)
            .map(([specie, numero]) => ({ specie, catture: numero }))
            .sort((a, b) => b.catture - a.catture)
            .slice(0, 8)

        return ordinato
    }, [cattureFiltrate])

    // Calcola catture per direzione vento
    const catturePerVento = useMemo(() => {
        const conteggio = {}

        cattureFiltrate.forEach(c => {
            if (!c.meteo?.direzioneVento) return
            // Estrai solo la sigla della direzione (es. "N", "NE", "S", etc.)
            const direzione = c.meteo.direzioneVento.split(' ')[0]
            conteggio[direzione] = (conteggio[direzione] || 0) + 1
        })

        // Ordina per numero catture
        const ordinato = Object.entries(conteggio)
            .map(([direzione, numero]) => ({ direzione, catture: numero }))
            .sort((a, b) => b.catture - a.catture)

        return ordinato
    }, [cattureFiltrate])

    // Calcola il valore massimo per la scala
    const maxCattureMese = Math.max(...catturePerMese.map(m => m.catture), 1)
    const maxCattureSpecie = speciePiuCatturate.length > 0
        ? Math.max(...speciePiuCatturate.map(s => s.catture), 1)
        : 1
    const maxCattureVento = catturePerVento.length > 0
        ? Math.max(...catturePerVento.map(v => v.catture), 1)
        : 1

    if (catture.length === 0) return null

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
            <button
                onClick={() => setMostraGrafici(!mostraGrafici)}
                className="w-full flex items-center justify-between min-h-[44px]"
            >
                <h4 className="text-cyan-400 font-bold text-sm sm:text-base">
                    grafici statistiche
                </h4>
                {mostraGrafici ? (
                    <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
            </button>

            {mostraGrafici && (
                <div className="mt-3 sm:mt-4">
                    {/* Tab selettore grafico */}
                    <div className="flex gap-2 mb-3 sm:mb-4">
                        <button
                            onClick={() => setGraficoAttivo('mese')}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                graficoAttivo === 'mese'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                            }`}
                        >
                            per mese
                        </button>
                        <button
                            onClick={() => setGraficoAttivo('specie')}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                graficoAttivo === 'specie'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                            }`}
                        >
                            per specie
                        </button>
                        <button
                            onClick={() => setGraficoAttivo('vento')}
                            className={`flex-1 py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                                graficoAttivo === 'vento'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-gray-700 text-gray-300 active:bg-gray-600'
                            }`}
                        >
                            per vento
                        </button>
                    </div>

                    {/* Grafico catture per mese */}
                    {graficoAttivo === 'mese' && (
                        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                            <h5 className="text-gray-300 text-xs sm:text-sm mb-3 text-center">
                                Catture per mese ({cattureFiltrate.length} totali)
                            </h5>

                            {/* Barre orizzontali per mobile, verticali per desktop */}
                            <div className="space-y-2 sm:hidden">
                                {catturePerMese.map((m, idx) => (
                                    <div key={m.mese} className="flex items-center gap-2">
                                        <span className="text-gray-400 text-xs w-8 flex-shrink-0">
                                            {m.mese}
                                        </span>
                                        <div className="flex-1 bg-gray-800 rounded h-5 overflow-hidden">
                                            <div
                                                className="h-full rounded transition-all duration-300"
                                                style={{
                                                    width: `${(m.catture / maxCattureMese) * 100}%`,
                                                    backgroundColor: COLORI_BARRE[idx % COLORI_BARRE.length],
                                                    minWidth: m.catture > 0 ? '8px' : '0'
                                                }}
                                            />
                                        </div>
                                        <span className="text-white text-xs w-6 text-right font-medium">
                                            {m.catture}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* Barre verticali per tablet/desktop */}
                            <div className="hidden sm:block">
                                <div className="flex items-end justify-between gap-1 h-40">
                                    {catturePerMese.map((m, idx) => (
                                        <div
                                            key={m.mese}
                                            className="flex-1 flex flex-col items-center"
                                        >
                                            <span className="text-white text-xs mb-1 font-medium">
                                                {m.catture > 0 ? m.catture : ''}
                                            </span>
                                            <div
                                                className="w-full rounded-t transition-all duration-300"
                                                style={{
                                                    height: `${(m.catture / maxCattureMese) * 100}%`,
                                                    backgroundColor: COLORI_BARRE[idx % COLORI_BARRE.length],
                                                    minHeight: m.catture > 0 ? '4px' : '0'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between gap-1 mt-2 border-t border-gray-700 pt-2">
                                    {catturePerMese.map(m => (
                                        <span
                                            key={m.mese}
                                            className="flex-1 text-center text-gray-400 text-xs"
                                        >
                                            {m.mese}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Grafico specie piu catturate */}
                    {graficoAttivo === 'specie' && (
                        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                            <h5 className="text-gray-300 text-xs sm:text-sm mb-3 text-center">
                                Specie piu catturate (top 8)
                            </h5>

                            {speciePiuCatturate.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">
                                    Nessuna cattura registrata
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {speciePiuCatturate.map((s, idx) => (
                                        <div key={s.specie} className="flex items-center gap-2">
                                            <span className="text-gray-300 text-xs sm:text-sm w-20 sm:w-24 truncate flex-shrink-0">
                                                {s.specie}
                                            </span>
                                            <div className="flex-1 bg-gray-800 rounded h-6 sm:h-7 overflow-hidden">
                                                <div
                                                    className="h-full rounded transition-all duration-300 flex items-center justify-end pr-2"
                                                    style={{
                                                        width: `${(s.catture / maxCattureSpecie) * 100}%`,
                                                        backgroundColor: COLORI_BARRE[idx % COLORI_BARRE.length],
                                                        minWidth: '24px'
                                                    }}
                                                >
                                                    <span className="text-white text-xs font-bold">
                                                        {s.catture}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Legenda percentuali */}
                            {speciePiuCatturate.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {speciePiuCatturate.slice(0, 4).map((s, idx) => {
                                            const percentuale = ((s.catture / cattureFiltrate.length) * 100).toFixed(0)
                                            return (
                                                <span
                                                    key={s.specie}
                                                    className="inline-flex items-center gap-1 text-xs text-gray-400"
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: COLORI_BARRE[idx] }}
                                                    />
                                                    {s.specie}: {percentuale}%
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Grafico catture per direzione vento */}
                    {graficoAttivo === 'vento' && (
                        <div className="bg-gray-900 rounded-lg p-3 sm:p-4">
                            <h5 className="text-gray-300 text-xs sm:text-sm mb-3 text-center">
                                Catture per direzione vento
                            </h5>

                            {catturePerVento.length === 0 ? (
                                <p className="text-gray-500 text-center py-4 text-sm">
                                    Nessun dato vento registrato
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {catturePerVento.map((v, idx) => (
                                        <div key={v.direzione} className="flex items-center gap-2">
                                            <span className="text-gray-300 text-xs sm:text-sm w-12 sm:w-16 flex-shrink-0 font-medium">
                                                {v.direzione}
                                            </span>
                                            <div className="flex-1 bg-gray-800 rounded h-6 sm:h-7 overflow-hidden">
                                                <div
                                                    className="h-full rounded transition-all duration-300 flex items-center justify-end pr-2"
                                                    style={{
                                                        width: `${(v.catture / maxCattureVento) * 100}%`,
                                                        backgroundColor: COLORI_BARRE[idx % COLORI_BARRE.length],
                                                        minWidth: '24px'
                                                    }}
                                                >
                                                    <span className="text-white text-xs font-bold">
                                                        {v.catture}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Legenda percentuali vento */}
                            {catturePerVento.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-700">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {catturePerVento.slice(0, 4).map((v, idx) => {
                                            const cattureTotaliConVento = catturePerVento.reduce((sum, x) => sum + x.catture, 0)
                                            const percentuale = ((v.catture / cattureTotaliConVento) * 100).toFixed(0)
                                            return (
                                                <span
                                                    key={v.direzione}
                                                    className="inline-flex items-center gap-1 text-xs text-gray-400"
                                                >
                                                    <span
                                                        className="w-2 h-2 rounded-full"
                                                        style={{ backgroundColor: COLORI_BARRE[idx] }}
                                                    />
                                                    {v.direzione}: {percentuale}%
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default GraficiStatistiche
