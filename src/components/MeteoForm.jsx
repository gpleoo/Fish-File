import React, { useState } from 'react'
import { Cloud, RefreshCw } from './Icons'
import Section from './Section'
import InputField from './InputField'
import { useTranslation } from '../locales/LanguageContext'
import { useUnits } from '../locales/UnitsContext'

// Costanti meteo - chiavi per le traduzioni
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

// Chiavi per le traduzioni delle fasi lunari
const moonPhaseKeys = [
    'newMoon',
    'waxingCrescent',
    'firstQuarter',
    'waxingGibbous',
    'fullMoon',
    'waningGibbous',
    'lastQuarter',
    'waningCrescent'
]

// Chiavi per le traduzioni delle condizioni meteo
const weatherConditionKeys = [
    'clear',
    'cloudy',
    'overcast',
    'rain',
    'storm',
    'fog'
]

const MeteoForm = ({
    activeSection,
    setActiveSection,
    meteo,
    setMeteo,
    onRefreshMeteo
}) => {
    const { t } = useTranslation()
    const { units, getTemperatureSymbol } = useUnits()
    const [isLoading, setIsLoading] = useState(false)

    // Genera le opzioni tradotte
    const fasiLunari = moonPhaseKeys.map(key => ({
        key,
        label: t(`moonPhases.${key}`)
    }))

    const condizioniMeteo = weatherConditionKeys.map(key => ({
        key,
        label: t(`weatherConditions.${key}`)
    }))

    const handleRefresh = async () => {
        if (onRefreshMeteo) {
            setIsLoading(true)
            await onRefreshMeteo()
            setIsLoading(false)
        }
    }

    // Label dinamiche con unità corrette
    const tempSymbol = getTemperatureSymbol()

    return (
        <Section
            icon={Cloud}
            title={t('weather.title')}
            isActive={activeSection === 'meteo'}
            onToggle={() => setActiveSection(activeSection === 'meteo' ? null : 'meteo')}
        >
            <p className="text-yellow-400 text-xs sm:text-sm mb-3 sm:mb-4 text-center">
                {t('weather.optional')}
            </p>

            {/* Pulsante Aggiorna Meteo */}
            {onRefreshMeteo && (
                <button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="w-full mb-4 bg-blue-600 text-white py-2.5 sm:py-3 rounded-lg font-bold flex items-center justify-center gap-2 active:bg-blue-700 disabled:opacity-50 transition-colors text-sm sm:text-base"
                >
                    <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isLoading ? 'animate-spin' : ''}`} />
                    {isLoading ? t('common.loading') : t('weather.refreshFromGPS')}
                </button>
            )}

            {/* Temperatura aria */}
            <InputField
                label={`${t('weather.temperature').replace('(°C)', '')}(${tempSymbol})`}
                type="number"
                value={meteo.temperatura}
                onChange={(e) => setMeteo(p => ({ ...p, temperatura: e.target.value }))}
                step="0.1"
            />

            {/* Temperatura acqua */}
            <InputField
                label={`${t('weather.waterTemp').replace('(°C)', '')}(${tempSymbol})`}
                type="number"
                value={meteo.temperaturaAcqua}
                onChange={(e) => setMeteo(p => ({ ...p, temperaturaAcqua: e.target.value }))}
                step="0.1"
            />

            {/* Pressione */}
            <InputField
                label={t('weather.pressure')}
                type="number"
                value={meteo.pressione}
                onChange={(e) => setMeteo(p => ({ ...p, pressione: e.target.value }))}
                min="0"
                step="1"
            />

            {/* Vento intensità */}
            <InputField
                label={t('weather.wind')}
                type="number"
                value={meteo.vento}
                onChange={(e) => setMeteo(p => ({ ...p, vento: e.target.value }))}
                min="0"
                step="1"
            />

            {/* Direzione vento */}
            <div className="mb-4">
                <label className="block text-cyan-400 text-sm font-semibold mb-2">
                    {t('weather.windDirection')}
                </label>
                <select
                    value={meteo.direzioneVento}
                    onChange={(e) => setMeteo(p => ({ ...p, direzioneVento: e.target.value }))}
                    className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                    <option value="">{t('weather.select')}</option>
                    {ventiRosaDeiVenti.map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
            </div>

            {/* Condizioni meteo */}
            <div className="mb-4">
                <label className="block text-cyan-400 text-sm font-semibold mb-2">
                    {t('weather.conditions')}
                </label>
                <select
                    value={meteo.condizioni}
                    onChange={(e) => setMeteo(p => ({ ...p, condizioni: e.target.value }))}
                    className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                    <option value="">{t('weather.select')}</option>
                    {condizioniMeteo.map(c => (
                        <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                </select>
            </div>

            {/* Fase lunare */}
            <div className="mb-4">
                <label className="block text-cyan-400 text-sm font-semibold mb-2">
                    {t('weather.moonPhase')}
                </label>
                <select
                    value={meteo.faseLunare}
                    onChange={(e) => setMeteo(p => ({ ...p, faseLunare: e.target.value }))}
                    className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                    <option value="">{t('weather.select')}</option>
                    {fasiLunari.map(f => (
                        <option key={f.key} value={f.key}>{f.label}</option>
                    ))}
                </select>
            </div>

            {/* Maree */}
            <InputField
                label={t('weather.highTide')}
                type="time"
                value={meteo.altaMareaOra}
                onChange={(e) => setMeteo(p => ({ ...p, altaMareaOra: e.target.value }))}
            />
            <InputField
                label={t('weather.lowTide')}
                type="time"
                value={meteo.bassaMareaOra}
                onChange={(e) => setMeteo(p => ({ ...p, bassaMareaOra: e.target.value }))}
            />

            {/* Onde */}
            <InputField
                label={t('weather.waveHeight')}
                type="number"
                value={meteo.altezzaOnde}
                onChange={(e) => setMeteo(p => ({ ...p, altezzaOnde: e.target.value }))}
                min="0"
                step="1"
            />
            <InputField
                label={t('weather.waveFrequency')}
                type="number"
                value={meteo.frequenzaOnde}
                onChange={(e) => setMeteo(p => ({ ...p, frequenzaOnde: e.target.value }))}
                min="0"
                step="0.1"
            />
        </Section>
    )
}

// Esporta anche le costanti per uso in altri componenti
export { ventiRosaDeiVenti, moonPhaseKeys, weatherConditionKeys }
export default MeteoForm
