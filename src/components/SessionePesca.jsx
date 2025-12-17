import React from 'react'
import { ChevronDown, ChevronUp } from './Icons'
import InputField from './InputField'
import SelectField from './SelectField'

const SessionePesca = ({
    mostraSessionePesca,
    setMostraSessionePesca,
    sessioneAttiva,
    datiSessione,
    setDatiSessione,
    localitaMemorizzate,
    avviaSessione,
    terminaSessione,
    ottieniPosizioneGPS
}) => {
    return (
        <div className="mb-6 bg-gray-900 border-2 border-cyan-600 rounded-xl">
            <button
                onClick={() => setMostraSessionePesca(!mostraSessionePesca)}
                className="w-full flex items-center justify-between p-6 active:bg-gray-800"
            >
                <h2 className="text-2xl font-bold text-cyan-400">🎣 sessione di pesca</h2>
                {mostraSessionePesca ? (
                    <ChevronUp className="text-cyan-400" width={24} height={24} />
                ) : (
                    <ChevronDown className="text-cyan-400" width={24} height={24} />
                )}
            </button>

            {mostraSessionePesca && (
                <div className="p-6 pt-0">
                    {!sessioneAttiva ? (
                        <SessioneInattiva
                            datiSessione={datiSessione}
                            setDatiSessione={setDatiSessione}
                            localitaMemorizzate={localitaMemorizzate}
                            avviaSessione={avviaSessione}
                            ottieniPosizioneGPS={ottieniPosizioneGPS}
                        />
                    ) : (
                        <SessioneAttiva
                            datiSessione={datiSessione}
                            terminaSessione={terminaSessione}
                        />
                    )}
                </div>
            )}
        </div>
    )
}

// Sub-component: Sessione non attiva
const SessioneInattiva = ({
    datiSessione,
    setDatiSessione,
    localitaMemorizzate,
    avviaSessione,
    ottieniPosizioneGPS
}) => (
    <div>
        <p className="text-yellow-400 text-sm mb-4 text-center">
            obbligatoria per registrare catture
        </p>

        {/* Località memorizzate */}
        {localitaMemorizzate.length > 0 && (
            <div className="mb-4 p-3 bg-blue-900/30 border border-blue-500 rounded-lg">
                <p className="text-blue-300 text-xs font-semibold mb-2">
                    Località memorizzate ({localitaMemorizzate.length}):
                </p>
                <div className="flex flex-wrap gap-2">
                    {localitaMemorizzate.map((loc, i) => (
                        <button
                            key={i}
                            onClick={() => setDatiSessione(p => ({ ...p, localita: loc }))}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm active:bg-blue-700"
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <SelectField
            label="località"
            value={datiSessione.localita}
            onChange={(e) => setDatiSessione(p => ({ ...p, localita: e.target.value }))}
            options={localitaMemorizzate}
            placeholder="es: molo di ostia"
        />

        {/* GPS Box */}
        <div className="mb-4 p-4 bg-green-900/20 border-2 border-green-500 rounded-lg">
            <label className="block text-green-400 text-sm font-semibold mb-2">
                📍 Ottieni Posizione GPS
            </label>
            <p className="text-gray-400 text-xs mb-3">
                Premi il pulsante per acquisire automaticamente le coordinate
            </p>
            <button
                onClick={ottieniPosizioneGPS}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold active:bg-green-700 flex items-center justify-center gap-2"
            >
                <span style={{ fontSize: '24px' }}>📡</span> Usa GPS Dispositivo
            </button>
        </div>

        <InputField
            label="latitudine"
            type="number"
            value={datiSessione.latitudine}
            onChange={(e) => setDatiSessione(p => ({ ...p, latitudine: e.target.value }))}
            placeholder="41.415611"
            step="0.000001"
        />
        <InputField
            label="longitudine"
            type="number"
            value={datiSessione.longitudine}
            onChange={(e) => setDatiSessione(p => ({ ...p, longitudine: e.target.value }))}
            placeholder="12.800750"
            step="0.000001"
        />

        <button
            onClick={avviaSessione}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-bold text-xl"
        >
            avvia sessione
        </button>
    </div>
)

// Sub-component: Sessione attiva
const SessioneAttiva = ({ datiSessione, terminaSessione }) => (
    <div>
        <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4 mb-4">
            <p className="text-green-400 font-bold text-center">sessione attiva</p>
            <p className="text-gray-300 text-sm text-center">{datiSessione.localita}</p>
            <p className="text-gray-400 text-xs text-center">
                {datiSessione.latitudine}, {datiSessione.longitudine}
            </p>
        </div>
        <button
            onClick={terminaSessione}
            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold"
        >
            termina sessione
        </button>
    </div>
)

export default SessionePesca
