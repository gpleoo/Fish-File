import React from 'react'
import { Cloud } from './Icons'
import Section from './Section'
import InputField from './InputField'

// Costanti meteo
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

const fasiLunari = [
    'luna nuova',
    'crescente',
    'primo quarto',
    'gibbosa crescente',
    'piena',
    'gibbosa calante',
    'ultimo quarto',
    'calante'
]

const condizioniMeteo = [
    'sereno',
    'nuvoloso',
    'coperto',
    'pioggia',
    'temporale',
    'nebbia'
]

const MeteoForm = ({
    activeSection,
    setActiveSection,
    meteo,
    setMeteo
}) => {
    return (
        <Section
            icon={Cloud}
            title="dati meteo"
            isActive={activeSection === 'meteo'}
            onToggle={() => setActiveSection(activeSection === 'meteo' ? null : 'meteo')}
        >
            <p className="text-yellow-400 text-sm mb-4 text-center">
                dati opzionali ma utili per analisi
            </p>

            {/* Temperatura aria */}
            <InputField
                label="temperatura (°C)"
                type="number"
                value={meteo.temperatura}
                onChange={(e) => setMeteo(p => ({ ...p, temperatura: e.target.value }))}
                step="0.1"
            />

            {/* Temperatura acqua */}
            <InputField
                label="temp. acqua (°C)"
                type="number"
                value={meteo.temperaturaAcqua}
                onChange={(e) => setMeteo(p => ({ ...p, temperaturaAcqua: e.target.value }))}
                step="0.1"
            />

            {/* Pressione */}
            <InputField
                label="pressione (hPa)"
                type="number"
                value={meteo.pressione}
                onChange={(e) => setMeteo(p => ({ ...p, pressione: e.target.value }))}
                min="0"
                step="1"
            />

            {/* Vento intensità */}
            <InputField
                label="vento (nodi)"
                type="number"
                value={meteo.vento}
                onChange={(e) => setMeteo(p => ({ ...p, vento: e.target.value }))}
                min="0"
                step="1"
            />

            {/* Direzione vento */}
            <div className="mb-4">
                <label className="block text-cyan-400 text-sm font-semibold mb-2">
                    direzione vento
                </label>
                <select
                    value={meteo.direzioneVento}
                    onChange={(e) => setMeteo(p => ({ ...p, direzioneVento: e.target.value }))}
                    className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                    <option value="">seleziona...</option>
                    {ventiRosaDeiVenti.map(v => (
                        <option key={v} value={v}>{v}</option>
                    ))}
                </select>
            </div>

            {/* Condizioni meteo */}
            <div className="mb-4">
                <label className="block text-cyan-400 text-sm font-semibold mb-2">
                    condizioni
                </label>
                <select
                    value={meteo.condizioni}
                    onChange={(e) => setMeteo(p => ({ ...p, condizioni: e.target.value }))}
                    className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                    <option value="">seleziona...</option>
                    {condizioniMeteo.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>

            {/* Fase lunare */}
            <div className="mb-4">
                <label className="block text-cyan-400 text-sm font-semibold mb-2">
                    fase lunare
                </label>
                <select
                    value={meteo.faseLunare}
                    onChange={(e) => setMeteo(p => ({ ...p, faseLunare: e.target.value }))}
                    className="w-full bg-gray-900 border-2 border-gray-700 rounded-lg px-4 py-3 text-white"
                >
                    <option value="">seleziona...</option>
                    {fasiLunari.map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </select>
            </div>

            {/* Maree */}
            <InputField
                label="alta marea"
                type="time"
                value={meteo.altaMareaOra}
                onChange={(e) => setMeteo(p => ({ ...p, altaMareaOra: e.target.value }))}
            />
            <InputField
                label="bassa marea"
                type="time"
                value={meteo.bassaMareaOra}
                onChange={(e) => setMeteo(p => ({ ...p, bassaMareaOra: e.target.value }))}
            />

            {/* Onde */}
            <InputField
                label="altezza onde (cm)"
                type="number"
                value={meteo.altezzaOnde}
                onChange={(e) => setMeteo(p => ({ ...p, altezzaOnde: e.target.value }))}
                min="0"
                step="1"
            />
            <InputField
                label="frequenza onde (sec)"
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
export { ventiRosaDeiVenti, fasiLunari, condizioniMeteo }
export default MeteoForm
