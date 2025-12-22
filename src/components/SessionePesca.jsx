import React from 'react'
import { ChevronDown, ChevronUp } from './Icons'
import InputField from './InputField'
import SelectField from './SelectField'
import { useTranslation } from '../locales/LanguageContext'

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
    const { t } = useTranslation()

    return (
        <div className="mb-4 sm:mb-6 bg-gray-900 border-2 border-cyan-600 rounded-xl">
            <button
                onClick={() => setMostraSessionePesca(!mostraSessionePesca)}
                className="w-full flex items-center justify-between p-4 sm:p-6 active:bg-gray-800 transition-colors"
            >
                <h2 className="text-lg sm:text-2xl font-bold text-cyan-400">{t('session.title')}</h2>
                {mostraSessionePesca ? (
                    <ChevronUp className="text-cyan-400 flex-shrink-0" width={24} height={24} />
                ) : (
                    <ChevronDown className="text-cyan-400 flex-shrink-0" width={24} height={24} />
                )}
            </button>

            {mostraSessionePesca && (
                <div className="p-4 sm:p-6 pt-0">
                    {!sessioneAttiva ? (
                        <SessioneInattiva
                            datiSessione={datiSessione}
                            setDatiSessione={setDatiSessione}
                            localitaMemorizzate={localitaMemorizzate}
                            avviaSessione={avviaSessione}
                            ottieniPosizioneGPS={ottieniPosizioneGPS}
                            t={t}
                        />
                    ) : (
                        <SessioneAttiva
                            datiSessione={datiSessione}
                            terminaSessione={terminaSessione}
                            t={t}
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
    ottieniPosizioneGPS,
    t
}) => (
    <div>
        <p className="text-yellow-400 text-xs sm:text-sm mb-3 sm:mb-4 text-center">
            {t('catch.startSessionFirst')}
        </p>

        {/* Località memorizzate */}
        {localitaMemorizzate.length > 0 && (
            <div className="mb-3 sm:mb-4 p-2.5 sm:p-3 bg-blue-900/30 border border-blue-500 rounded-lg">
                <p className="text-blue-300 text-xs font-semibold mb-2">
                    {t('management.locations')} ({localitaMemorizzate.length}):
                </p>
                <div className="scroll-x-container sm:flex sm:flex-wrap">
                    {localitaMemorizzate.map((loc, i) => (
                        <button
                            key={i}
                            onClick={() => setDatiSessione(p => ({ ...p, localita: loc }))}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm active:bg-blue-700 whitespace-nowrap flex-shrink-0"
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>
        )}

        <SelectField
            label={t('session.location')}
            value={datiSessione.localita}
            onChange={(e) => setDatiSessione(p => ({ ...p, localita: e.target.value }))}
            options={localitaMemorizzate}
            placeholder={t('session.locationPlaceholder')}
        />

        {/* GPS Box */}
        <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-green-900/20 border-2 border-green-500 rounded-lg">
            <label className="block text-green-400 text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2">
                {t('session.getGPS')}
            </label>
            <p className="text-gray-400 text-xs mb-2 sm:mb-3">
                {t('session.getGPS')}
            </p>
            <button
                onClick={ottieniPosizioneGPS}
                className="w-full bg-green-600 text-white py-2.5 sm:py-3 rounded-lg font-bold active:bg-green-700 flex items-center justify-center gap-2 text-sm sm:text-base transition-colors"
            >
                {t('session.getGPS')}
            </button>
        </div>

        {/* Coordinate in grid su schermi più grandi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
            <InputField
                label={t('session.latitude')}
                type="number"
                value={datiSessione.latitudine}
                onChange={(e) => setDatiSessione(p => ({ ...p, latitudine: e.target.value }))}
                placeholder="41.415611"
                step="0.000001"
            />
            <InputField
                label={t('session.longitude')}
                type="number"
                value={datiSessione.longitudine}
                onChange={(e) => setDatiSessione(p => ({ ...p, longitudine: e.target.value }))}
                placeholder="12.800750"
                step="0.000001"
            />
        </div>

        <button
            onClick={avviaSessione}
            className="w-full bg-green-600 text-white py-3.5 sm:py-4 rounded-lg font-bold text-lg sm:text-xl active:bg-green-700 transition-colors"
        >
            {t('session.start')}
        </button>
    </div>
)

// Sub-component: Sessione attiva
const SessioneAttiva = ({ datiSessione, terminaSessione, t }) => (
    <div>
        <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-3 sm:p-4 mb-3 sm:mb-4">
            <p className="text-green-400 font-bold text-center text-sm sm:text-base">{t('session.active')}</p>
            <p className="text-gray-300 text-sm text-center">{datiSessione.localita}</p>
            <p className="text-gray-400 text-xs text-center">
                {datiSessione.latitudine}, {datiSessione.longitudine}
            </p>
        </div>
        <button
            onClick={terminaSessione}
            className="w-full bg-red-600 text-white py-2.5 sm:py-3 rounded-lg font-bold text-base sm:text-lg active:bg-red-700 transition-colors"
        >
            {t('session.end')}
        </button>
    </div>
)

export default SessionePesca
