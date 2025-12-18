import React, { useCallback } from 'react'
import { Fish } from './Icons'
import Section from './Section'
import InputField from './InputField'
import SelectField from './SelectField'
import VoiceInput from './VoiceInput'

const CatturaForm = ({
    activeSection,
    setActiveSection,
    nuovaCattura,
    setNuovaCattura,
    specieMemorizzate,
    localitaMemorizzate,
    escheMemorizzate,
    canneMemorizzate,
    traviMemorizzate,
    amiMemorizzati,
    piombiMemorizzati,
    noteMemorizzate,
    messaggioErrore,
    aggiungiCattura
}) => {
    // Handler per risultato input vocale
    const handleVoiceResult = useCallback((parsedData, rawText) => {
        setNuovaCattura(prev => ({
            ...prev,
            ...parsedData
        }))
    }, [setNuovaCattura])

    return (
        <Section
            icon={Fish}
            title="aggiungi cattura"
            isActive={activeSection === 'cattura'}
            onToggle={() => setActiveSection(activeSection === 'cattura' ? null : 'cattura')}
        >
            {/* Avviso campi obbligatori */}
            <div className="bg-yellow-900/30 border-2 border-yellow-500 rounded-lg p-3 mb-4">
                <p className="text-yellow-400 text-sm font-semibold text-center">
                    obbligatori: sessione + specie | resto opzionale
                </p>
            </div>

            {/* Input vocale */}
            <VoiceInput
                onResult={handleVoiceResult}
                specieDisponibili={specieMemorizzate}
                escheDisponibili={escheMemorizzate}
            />

            {/* Campi data e ora */}
            <InputField
                label="data"
                type="date"
                value={nuovaCattura.data}
                onChange={(e) => setNuovaCattura(p => ({ ...p, data: e.target.value }))}
            />
            <InputField
                label="ora"
                value={nuovaCattura.ora}
                onChange={(e) => setNuovaCattura(p => ({ ...p, ora: e.target.value }))}
            />

            {/* Specie - obbligatorio */}
            <SelectField
                label="specie (obbligatorio)"
                value={nuovaCattura.specie}
                onChange={(e) => setNuovaCattura(p => ({ ...p, specie: e.target.value }))}
                options={specieMemorizzate}
                placeholder="spigola, orata..."
            />

            {/* Peso e lunghezza */}
            <InputField
                label="peso (g)"
                type="number"
                value={nuovaCattura.peso}
                onChange={(e) => setNuovaCattura(p => ({ ...p, peso: e.target.value }))}
                min="0"
                step="1"
            />
            <InputField
                label="lunghezza (cm)"
                type="number"
                value={nuovaCattura.lunghezza}
                onChange={(e) => setNuovaCattura(p => ({ ...p, lunghezza: e.target.value }))}
                min="0"
                step="0.1"
            />

            {/* Località */}
            <SelectField
                label="località"
                value={nuovaCattura.localita}
                onChange={(e) => setNuovaCattura(p => ({ ...p, localita: e.target.value }))}
                options={localitaMemorizzate}
                placeholder="molo..."
            />

            {/* Esca */}
            <SelectField
                label="esca"
                value={nuovaCattura.esca}
                onChange={(e) => setNuovaCattura(p => ({ ...p, esca: e.target.value }))}
                options={escheMemorizzate}
                placeholder="verme..."
            />

            {/* Box Attrezzatura */}
            <div className="bg-gray-800 rounded-lg p-4 border-2 border-cyan-500 mb-4">
                <h3 className="text-cyan-400 font-bold mb-3 text-center">
                    attrezzatura utilizzata
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <SelectField
                        label="canna"
                        value={nuovaCattura.canna}
                        onChange={(e) => setNuovaCattura(p => ({ ...p, canna: e.target.value }))}
                        options={canneMemorizzate}
                        placeholder="seleziona..."
                    />
                    <SelectField
                        label="trave"
                        value={nuovaCattura.trave}
                        onChange={(e) => setNuovaCattura(p => ({ ...p, trave: e.target.value }))}
                        options={traviMemorizzate}
                        placeholder="seleziona..."
                    />
                    <SelectField
                        label="amo"
                        value={nuovaCattura.amo}
                        onChange={(e) => setNuovaCattura(p => ({ ...p, amo: e.target.value }))}
                        options={amiMemorizzati}
                        placeholder="seleziona..."
                    />
                    <SelectField
                        label="piombo"
                        value={nuovaCattura.piombo}
                        onChange={(e) => setNuovaCattura(p => ({ ...p, piombo: e.target.value }))}
                        options={piombiMemorizzati}
                        placeholder="seleziona..."
                    />
                </div>
            </div>

            {/* Note */}
            <SelectField
                label="note"
                value={nuovaCattura.note}
                onChange={(e) => setNuovaCattura(p => ({ ...p, note: e.target.value }))}
                options={noteMemorizzate}
                placeholder="note..."
            />

            {/* Messaggio errore */}
            {messaggioErrore && (
                <div className="mt-4 p-4 bg-red-900/30 border-2 border-red-600 rounded-lg">
                    <p className="text-red-400 font-semibold text-center">{messaggioErrore}</p>
                </div>
            )}

            {/* Pulsante registra */}
            <button
                onClick={aggiungiCattura}
                className="w-full mt-4 bg-cyan-600 text-white py-4 rounded-lg font-bold text-xl"
            >
                registra cattura
            </button>
        </Section>
    )
}

export default CatturaForm
