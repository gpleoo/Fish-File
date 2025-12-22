import React, { useState, useMemo, useRef } from 'react'
import { BarChart3 } from './Icons'
import Section from './Section'
import StatisticheBox from './StatisticheBox'
import GraficiStatistiche from './GraficiStatistiche'
import RegistroCatture from './RegistroCatture'
import MapCatture from './MapCatture'
import SessioniRegistrate from './SessioniRegistrate'
import { ventiRosaDeiVenti, fasiLunari, condizioniMeteo } from './MeteoForm'
import { useToast } from './Toast'
import { useTranslation } from '../locales/LanguageContext'

const AnalisiDati = ({
    activeSection,
    setActiveSection,
    catture,
    setCatture,
    sessioniCompletate,
    onDeleteSessione,
    canneMemorizzate,
    traviMemorizzate,
    amiMemorizzati,
    piombiMemorizzati,
    localitaMemorizzate,
    specieMemorizzate,
    escheMemorizzate,
    onImportaDati
}) => {
    const { t, language } = useTranslation()
    const toast = useToast()
    const fileInputRef = useRef(null)

    // Filtri
    const [filtri, setFiltri] = useState({
        anno: 'tutti',
        mese: 'tutti',
        specie: 'tutte',
        direzioneVento: 'tutte',
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

    // Esporta dati
    const esportaDati = () => {
        if (catture.length === 0) {
            toast.warning(t('analysis.noCatches'))
            return
        }
        const data = JSON.stringify({
            catture,
            sessioni: sessioniCompletate,
            attrezzature: {
                canne: canneMemorizzate,
                travi: traviMemorizzate,
                ami: amiMemorizzati,
                piombi: piombiMemorizzati
            },
            localita: localitaMemorizzate,
            specie: specieMemorizzate,
            esche: escheMemorizzate
        }, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `diario-pesca-${new Date().toISOString().split('T')[0]}.json`
        a.click()
        toast.success(t('analysis.exportSuccess'))
    }

    // Importa dati da file JSON
    const handleImportFile = (event) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result)

                // Valida struttura base
                if (!data.catture || !Array.isArray(data.catture)) {
                    toast.error(t('analysis.invalidFile'))
                    return
                }

                // Conferma import
                const conferma = window.confirm(
                    `${t('analysis.importConfirm', { count: data.catture.length })}`
                )

                if (conferma && onImportaDati) {
                    onImportaDati(data)
                    toast.success(t('analysis.importSuccess', { count: data.catture.length }))
                }
            } catch (err) {
                toast.error(t('analysis.importError'))
                console.error('Import error:', err)
            }
        }
        reader.readAsText(file)

        // Reset input per permettere reimport stesso file
        event.target.value = ''
    }

    // Reset filtri
    const resetFiltri = () => {
        setFiltri({
            anno: 'tutti',
            mese: 'tutti',
            specie: 'tutte',
            direzioneVento: 'tutte',
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
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm sm:col-span-2"
                            >
                                <option value="tutte">{t('analysis.allWindDirections')}</option>
                                {ventiRosaDeiVenti.map(v => (
                                    <option key={v} value={v}>{v.split(' ')[0]}</option>
                                ))}
                            </select>

                            {/* Condizioni */}
                            <select
                                value={filtri.condizioni}
                                onChange={(e) => setFiltri(p => ({ ...p, condizioni: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allConditions')}</option>
                                {condizioniMeteo.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>

                            {/* Fase lunare */}
                            <select
                                value={filtri.faseLunare}
                                onChange={(e) => setFiltri(p => ({ ...p, faseLunare: e.target.value }))}
                                className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 sm:py-2 text-white text-sm"
                            >
                                <option value="tutte">{t('analysis.allMoonPhases')}</option>
                                {fasiLunari.map(f => (
                                    <option key={f} value={f}>{f}</option>
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

                    {/* Esporta / Importa */}
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={esportaDati}
                            className="flex-1 bg-purple-600 text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base active:bg-purple-700 transition-colors"
                            aria-label={t('analysis.export')}
                        >
                            {t('analysis.export')}
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex-1 bg-green-600 text-white py-2.5 sm:py-3 rounded-lg font-bold text-sm sm:text-base active:bg-green-700 transition-colors"
                            aria-label={t('analysis.import')}
                        >
                            {t('analysis.import')}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleImportFile}
                            className="hidden"
                            aria-hidden="true"
                        />
                    </div>
                </>
            )}
        </Section>
    )
}

export default AnalisiDati
