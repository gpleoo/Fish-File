import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Trash2 } from './Icons'
import { useTranslation } from '../locales/LanguageContext'

const ITEMS_PER_PAGE = 10

const RegistroCatture = ({ catture, setCatture, filtri }) => {
    const { t } = useTranslation()
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
        if (window.confirm(t('registry.deleteConfirm', { species: cattura.specie }))) {
            setCatture(prev => prev.filter(x => x.id !== cattura.id))
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg border-2 border-cyan-500 mb-4 sm:mb-6">
            <button
                onClick={() => setMostraCatture(!mostraCatture)}
                className="w-full flex items-center justify-between p-3 sm:p-4 active:bg-gray-700 transition-colors"
            >
                <h3 className="text-cyan-400 font-bold text-base sm:text-xl flex items-center gap-2">
                    {t('registry.title')} ({cattureFiltrate.length})
                </h3>
                {mostraCatture ? (
                    <ChevronUp className="text-cyan-400 flex-shrink-0" width={24} height={24} />
                ) : (
                    <ChevronDown className="text-cyan-400 flex-shrink-0" width={24} height={24} />
                )}
            </button>

            {mostraCatture && (
                <div className="p-3 sm:p-4 pt-0">
                    <div className="space-y-2 sm:space-y-3">
                        {getCatturePaginate().map(c => {
                            const isEspansa = cattureEspanse[c.id]
                            return (
                                <div key={c.id} className="bg-gray-900 rounded-lg border border-gray-700">
                                    <div
                                        onClick={() => toggleCatturaEspansa(c.id)}
                                        className="flex justify-between items-start p-3 sm:p-4 cursor-pointer active:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-white font-bold text-lg sm:text-xl truncate">{c.specie}</h4>
                                                {isEspansa ? (
                                                    <ChevronUp className="text-cyan-400 flex-shrink-0" width={18} height={18} />
                                                ) : (
                                                    <ChevronDown className="text-cyan-400 flex-shrink-0" width={18} height={18} />
                                                )}
                                            </div>
                                            <p className="text-gray-400 text-xs sm:text-sm">{c.data} - {c.ora}</p>
                                            {c.meteo?.direzioneVento && (
                                                <p className="text-cyan-300 text-xs sm:text-sm mt-1">
                                                    {c.meteo.direzioneVento.split(' ')[0]}
                                                </p>
                                            )}

                                            {/* Dettagli espansi */}
                                            {isEspansa && (
                                                <DettagliCattura cattura={c} t={t} />
                                            )}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                eliminaCattura(c)
                                            }}
                                            className="text-red-500 ml-2 sm:ml-3 p-1 min-h-[36px] min-w-[36px] flex items-center justify-center"
                                            aria-label={t('common.delete')}
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
                        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4">
                            <button
                                onClick={() => setPaginaCatture(Math.max(0, paginaCatture - 1))}
                                disabled={paginaCatture === 0}
                                className="pagination-btn bg-cyan-600 text-white rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed active:bg-cyan-700 transition-colors"
                            >
                                {t('common.prev')}
                            </button>
                            <span className="text-gray-300 text-xs sm:text-sm min-w-[80px] text-center">
                                {paginaCatture + 1} / {totalePagine}
                            </span>
                            <button
                                onClick={() => setPaginaCatture(Math.min(totalePagine - 1, paginaCatture + 1))}
                                disabled={paginaCatture >= totalePagine - 1}
                                className="pagination-btn bg-cyan-600 text-white rounded-lg font-bold disabled:opacity-30 disabled:cursor-not-allowed active:bg-cyan-700 transition-colors"
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

// Sub-component: Dettagli cattura espansa
const DettagliCattura = ({ cattura: c, t }) => (
    <>
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700">
            <h5 className="text-cyan-400 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">{t('registry.catchData')}</h5>
            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                {c.peso && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">{t('catch.weight')}:</span> {(parseFloat(c.peso) / 1000).toFixed(2)} kg
                    </p>
                )}
                {c.lunghezza && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">{t('catch.length')}:</span> {c.lunghezza} cm
                    </p>
                )}
                {c.localita && (
                    <p className="text-gray-300 truncate">
                        <span className="text-cyan-400">{t('session.location')}:</span> {c.localita}
                    </p>
                )}
                {c.esca && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">{t('catch.bait')}:</span> {c.esca}
                    </p>
                )}
                {c.canna && (
                    <p className="text-gray-300 truncate">
                        <span className="text-cyan-400">{t('catch.rod')}:</span> {c.canna}
                    </p>
                )}
                {c.trave && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">{t('catch.leader')}:</span> {c.trave}
                    </p>
                )}
                {c.amo && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">{t('catch.hook')}:</span> {c.amo}
                    </p>
                )}
                {c.piombo && (
                    <p className="text-gray-300">
                        <span className="text-cyan-400">{t('catch.sinker')}:</span> {c.piombo}
                    </p>
                )}
            </div>
            {c.note && (
                <p className="text-gray-400 text-xs sm:text-sm mt-2 italic">
                    <span className="text-cyan-400">{t('catch.notes')}:</span> {c.note}
                </p>
            )}
        </div>

        {/* Dati meteo */}
        {c.meteo && Object.values(c.meteo).some(Boolean) && (
            <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-700">
                <h5 className="text-cyan-400 font-semibold mb-1.5 sm:mb-2 text-xs sm:text-sm">{t('registry.weatherData')}</h5>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                    {c.meteo.temperatura && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">{t('weather.temperature')}:</span> {c.meteo.temperatura}C
                        </p>
                    )}
                    {c.meteo.temperaturaAcqua && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">{t('weather.waterTemp')}:</span> {c.meteo.temperaturaAcqua}C
                        </p>
                    )}
                    {c.meteo.pressione && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">{t('weather.pressure')}:</span> {c.meteo.pressione} hPa
                        </p>
                    )}
                    {c.meteo.vento && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">{t('weather.wind')}:</span> {c.meteo.vento} nodi
                        </p>
                    )}
                    {c.meteo.direzioneVento && (
                        <p className="text-gray-300 col-span-2 truncate">
                            <span className="text-cyan-400">{t('weather.windDirection')}:</span> {c.meteo.direzioneVento}
                        </p>
                    )}
                    {c.meteo.condizioni && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">{t('weather.conditions')}:</span> {c.meteo.condizioni}
                        </p>
                    )}
                    {c.meteo.faseLunare && (
                        <p className="text-gray-300">
                            <span className="text-cyan-400">{t('weather.moonPhase')}:</span> {c.meteo.faseLunare}
                        </p>
                    )}
                </div>
            </div>
        )}
    </>
)

export default RegistroCatture
