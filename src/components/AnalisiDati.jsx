import React, { useState, useMemo } from 'react'
import { BarChart3 } from './Icons'
import Section from './Section'
import StatisticheBox from './StatisticheBox'
import GraficiStatistiche from './GraficiStatistiche'
import RegistroCatture from './RegistroCatture'
import MapCatture from './MapCatture'
import SessioniRegistrate from './SessioniRegistrate'
import { ventiRosaDeiVenti, moonPhaseKeys, weatherConditionKeys } from './MeteoForm'
import { useTranslation } from '../locales/LanguageContext'

const AnalisiDati = ({
    activeSection,
    setActiveSection,
    catture,
    setCatture,
    sessioniCompletate,
    onDeleteSessione,
    localitaMemorizzate,
    specieMemorizzate
}) => {
    const { t, language } = useTranslation()

    // Filtri
    const [filtri, setFiltri] = useState({
        anno: 'tutti',
        mese: 'tutti',
        specie: 'tutte',
        direzioneVento: 'tutte',
        velocitaVento: 'tutte',
        pressione: 'tutte',
        condizioni: 'tutte',
        localita: 'tutte',
        faseLunare: 'tutte'
    })

    // Calcola anni e mesi disponibili
    const anniDisponibili = useMemo(() => {
        const anni = new Set(catture.map(c => c.data?.split('-')[0]).filter(Boolean))
        return Array.from(anni).sort().reverse()
    }, [catture])

    const mesiDisponibili = useMemo(() => {
        return ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    }, [])

    // Calcola statistiche
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
        const speciePiuCatturata = Object.entries(specieCount).length > 0
            ? Object.entries(specieCount).sort((a, b) => b[1] - a[1])[0]
            : null
        const pesoMedio = numPesi > 0 ? ((pesoTotale / numPesi) / 1000).toFixed(2) : 0
        return { speciePiuCatturata, pesoMedio, totaleCatture: catture.length }
    }

    const stats = calcolaStatistiche()

    // Reset filtri
    const resetFiltri = () => {
        setFiltri({
            anno: 'tutti',
            mese: 'tutti',
            specie: 'tutte',
            direzioneVento: 'tutte',
            velocitaVento: 'tutte',
            pressione: 'tutte',
            condizioni: 'tutte',
            localita: 'tutte',
            faseLunare: 'tutte'
        })
    }

    // Controlla se ci sono filtri attivi
    const hasFiltriAttivi = Object.values(filtri).some(v => v !== 'tutti' && v !== 'tutte')

    return (
        <Section
            icon={BarChart3}
            title={t('analysis.title')}
            isActive={activeSection === 'analisi'}
            onToggle={() => setActiveSection(activeSection === 'analisi' ? null : 'analisi')}
        >
            {catture.length === 0 ? (
                <p className="text-gray-400 text-center py-8">{t('analysis.noCatches')}</p>
            ) : (
                <>
                    {/* Statistiche */}
                    <StatisticheBox stats={stats} />

                    {/* Grafici */}
                    <GraficiStatistiche catture={catture} filtri={filtri} />

                    {/* Filtri */}
                    <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                            <h4 className="text-cyan-400 font-bold text-sm sm:text-base">{t('analysis.filters')}</h4>
                            {hasFiltriAttivi && (
                                <button
                                    onClick={resetFiltri}
                                    className="text-red-400 text-xs sm:text-sm underline min-h-[36px] flex items-center"
                                >
                                    {t('analysis.resetFilters')}
                                </button>
                            )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                            {/* Anno */}
                            <select
                                value={filtri.anno}
                                onChange={(e) => setFiltri(p => ({ ...p, anno: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutti">{t('analysis.allYears')}</option>
                                {anniDisponibili.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>

                            {/* Mese */}
                            <select
                                value={filtri.mese}
                                onChange={(e) => setFiltri(p => ({ ...p, mese: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutti">{t('analysis.allMonths')}</option>
                                {mesiDisponibili.map(m => (
                                    <option key={m} value={m}>
                                        {new Date(2000, parseInt(m) - 1).toLocaleString(language === 'it' ? 'it-IT' : 'en-US', { month: 'long' })}
                                    </option>
                                ))}
                            </select>

                            {/* Specie */}
                            <select
                                value={filtri.specie}
                                onChange={(e) => setFiltri(p => ({ ...p, specie: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allSpecies')}</option>
                                {specieMemorizzate.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>

                            {/* Località */}
                            <select
                                value={filtri.localita}
                                onChange={(e) => setFiltri(p => ({ ...p, localita: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allLocations')}</option>
                                {localitaMemorizzate.map(l => (
                                    <option key={l} value={l}>{l}</option>
                                ))}
                            </select>

                            {/* Direzione vento */}
                            <select
                                value={filtri.direzioneVento}
                                onChange={(e) => setFiltri(p => ({ ...p, direzioneVento: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allWindDirections')}</option>
                                {ventiRosaDeiVenti.map(v => (
                                    <option key={v} value={v}>{v.split(' ')[0]}</option>
                                ))}
                            </select>

                            {/* Velocità vento */}
                            <select
                                value={filtri.velocitaVento}
                                onChange={(e) => setFiltri(p => ({ ...p, velocitaVento: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allWindSpeeds')}</option>
                                <option value="calmo">{t('analysis.windCalm')}</option>
                                <option value="leggero">{t('analysis.windLight')}</option>
                                <option value="moderato">{t('analysis.windModerate')}</option>
                                <option value="forte">{t('analysis.windStrong')}</option>
                            </select>

                            {/* Pressione atmosferica */}
                            <select
                                value={filtri.pressione}
                                onChange={(e) => setFiltri(p => ({ ...p, pressione: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allPressures')}</option>
                                <option value="bassa">{t('analysis.pressureLow')}</option>
                                <option value="normale">{t('analysis.pressureNormal')}</option>
                                <option value="alta">{t('analysis.pressureHigh')}</option>
                            </select>

                            {/* Condizioni */}
                            <select
                                value={filtri.condizioni}
                                onChange={(e) => setFiltri(p => ({ ...p, condizioni: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allConditions')}</option>
                                {weatherConditionKeys.map(key => (
                                    <option key={key} value={key}>{t(`weatherConditions.${key}`)}</option>
                                ))}
                            </select>

                            {/* Fase lunare */}
                            <select
                                value={filtri.faseLunare}
                                onChange={(e) => setFiltri(p => ({ ...p, faseLunare: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allMoonPhases')}</option>
                                {moonPhaseKeys.map(key => (
                                    <option key={key} value={key}>{t(`moonPhases.${key}`)}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Mappa Sessioni */}
                    <MapCatture
                        sessioni={sessioniCompletate}
                        catture={catture}
                        filtri={filtri}
                    />

                    {/* Sessioni Registrate */}
                    <SessioniRegistrate
                        sessioni={sessioniCompletate}
                        catture={catture}
                        onDeleteSessione={onDeleteSessione}
                        filtri={filtri}
                    />

                    {/* Registro Catture */}
                    <RegistroCatture
                        catture={catture}
                        setCatture={setCatture}
                        filtri={filtri}
                    />
                </>
            )}
        </Section>
    )
}

export default AnalisiDati
