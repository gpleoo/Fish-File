import React from 'react'
import { useTranslation } from '../../locales/LanguageContext'
import { direzioneToLabel } from '../../utils/pianifica/spotAdvisor'
import { CampoMeteo, CAMPI_CORREGGIBILI_SPOT } from './CampiMeteo'

const COLORI_AFFIDABILITA = { alta: 'text-green-400', media: 'text-yellow-400', bassa: 'text-red-400' }

/** Valore di un fattore in forma leggibile */
export const useFormattaFattore = () => {
    const { t } = useTranslation()
    return (fattore, v) => {
        if (v === null || v === undefined || v === '') return '-'
        switch (fattore) {
            case 'pressione': return `${v} hPa`
            case 'ventoKn': return `${v} kn`
            case 'ventoDir': return direzioneToLabel(v).split(' ')[0]
            case 'onde': return `${v} cm`
            case 'tAcqua':
            case 'tAria': return `${v} °C`
            case 'condizioni': return t(`weatherConditions.${v}`)
            case 'luna': return t(`moonPhases.${v}`)
            case 'marea': return t(`planner.tide.${v}`)
            default: return String(v)
        }
    }
}

const Card = ({ children, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-gray-800 rounded-lg p-3 mb-2 ${onClick ? 'cursor-pointer active:bg-gray-700' : ''}`}
    >
        {children}
    </div>
)

const Motivazione = ({ r }) => {
    const { t } = useTranslation()
    if (r.nSimili === 0) {
        return <p className="text-gray-400 text-xs">{t('planner.results.noSimilar', { count: r.nUscite })}</p>
    }
    return (
        <p className="text-gray-300 text-xs">
            {t('planner.results.similarSummary', {
                count: r.nSimili,
                avg: r.mediaCatture.toFixed(1),
                empty: Math.round(r.percVuote * 100)
            })}
        </p>
    )
}

export const ClassificaSpot = ({ classifica, onApri, onIndietro, nSessioni, modificati, avvisoLontano }) => {
    const { t } = useTranslation()
    return (
        <div>
            <button onClick={onIndietro} className="text-cyan-400 text-sm mb-3">&lt; {t('planner.results.back')}</button>
            <p className="text-gray-400 text-xs mb-3">
                {t('planner.results.basedOn', { count: nSessioni })}
                {modificati.length > 0 && ` ${t('planner.results.modified', { fields: modificati.join(', ') })}`}
            </p>
            {classifica.map((r, i) => {
                const insufficiente = r.affidabilita === 'bassa'
                return (
                    <Card key={r.spot} onClick={() => onApri(r.spot)}>
                        <div className="flex items-start gap-3">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${insufficiente ? 'bg-gray-600' : 'bg-cyan-600'}`}>
                                {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-white font-semibold text-sm">{r.spot}</div>
                                <div className="h-1.5 bg-gray-700 rounded my-1.5">
                                    <div className={`h-full rounded ${insufficiente ? 'bg-gray-500' : 'bg-cyan-500'}`} style={{ width: `${r.punteggio}%` }} />
                                </div>
                                <Motivazione r={r} />
                                <p className={`text-xs mt-1 ${COLORI_AFFIDABILITA[r.affidabilita]}`}>
                                    {t(`planner.reliability.${r.affidabilita}`)}
                                </p>
                            </div>
                            <div className="text-right flex-shrink-0">
                                <div className={`text-2xl font-bold ${insufficiente ? 'text-gray-500' : 'text-cyan-400'}`}>{r.punteggio}</div>
                                <div className="text-gray-500 text-xs">/100</div>
                            </div>
                        </div>
                    </Card>
                )
            })}
            {avvisoLontano && (
                <div className="bg-yellow-900/30 border border-yellow-700 text-yellow-300 text-xs rounded-lg p-2 mt-2">
                    {t('planner.results.farForecast')}
                </div>
            )}
            <p className="text-gray-500 text-xs mt-3">{t('planner.results.disclaimer')}</p>
        </div>
    )
}

export const DettaglioSpot = ({ risultato: r, correzioni, onCorreggi, onRipristina, onIndietro }) => {
    const { t } = useTranslation()
    const formatta = useFormattaFattore()
    const campi = CAMPI_CORREGGIBILI_SPOT.filter(c => r.tipo === 'mare' || c !== 'onde')

    const intervallo = (riga) => riga.valori
        ? riga.valori.map(v => formatta(riga.fattore, v)).join(', ')
        : riga.min === riga.max ? formatta(riga.fattore, riga.min) : `${formatta(riga.fattore, riga.min)} - ${formatta(riga.fattore, riga.max)}`

    return (
        <div>
            <button onClick={onIndietro} className="text-cyan-400 text-sm mb-3">&lt; {t('planner.detail.back')}</button>
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-bold text-lg">{r.spot}</h3>
                <span className="text-cyan-400 font-bold text-xl">{r.punteggio}/100</span>
            </div>

            <Card>
                <h4 className="text-cyan-400 font-semibold text-sm mb-2">
                    {t('planner.detail.comparison', { count: r.confronto.nMigliori })}
                </h4>
                {r.confronto.righe.length === 0 ? (
                    <p className="text-gray-400 text-xs">{t('planner.detail.noBest')}</p>
                ) : (
                    <table className="w-full text-xs">
                        <thead>
                            <tr className="text-gray-400 text-left">
                                <th className="py-1 font-normal">{t('planner.detail.factor')}</th>
                                <th className="py-1 font-normal">{t('planner.detail.forecast')}</th>
                                <th className="py-1 font-normal">{t('planner.detail.best')}</th>
                                <th />
                            </tr>
                        </thead>
                        <tbody>
                            {r.confronto.righe.map(riga => (
                                <tr key={riga.fattore} className="border-t border-gray-700 text-gray-200">
                                    <td className="py-1">{t(`planner.factors.${riga.fattore}`)}</td>
                                    <td className="py-1">{formatta(riga.fattore, riga.previsto)}</td>
                                    <td className="py-1">{intervallo(riga)}</td>
                                    <td className={`py-1 text-right font-bold ${riga.ok ? 'text-green-400' : 'text-red-400'}`}>
                                        {riga.ok ? 'OK' : 'NO'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>

            <Card>
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-cyan-400 font-semibold text-sm">{t('planner.detail.spotWeather')}</h4>
                    {correzioni && Object.keys(correzioni).length > 0 && (
                        <button onClick={onRipristina} className="text-gray-400 text-xs underline">{t('planner.detail.resetSpot')}</button>
                    )}
                </div>
                <p className="text-gray-500 text-xs mb-2">{t('planner.detail.spotWeatherHelp')}</p>
                {campi.map(campo => (
                    <CampoMeteo
                        key={campo}
                        campo={campo}
                        valore={correzioni && campo in correzioni ? correzioni[campo] : r.previsto[campo]}
                        origine={correzioni && campo in correzioni ? 'mod' : null}
                        onChange={(v) => onCorreggi(campo, v)}
                    />
                ))}
            </Card>

            {r.nSimili > 0 && (
                <Card>
                    <h4 className="text-cyan-400 font-semibold text-sm mb-2">{t('planner.detail.whatWorked')}</h4>
                    {r.specie.length > 0 && (
                        <p className="text-gray-200 text-xs mb-1">
                            <span className="text-gray-400">{t('planner.detail.species')}: </span>
                            {r.specie.map(s => `${s.nome} (${s.numero})`).join(', ')}
                        </p>
                    )}
                    {r.esche.length > 0 && (
                        <p className="text-gray-200 text-xs mb-1">
                            <span className="text-gray-400">{t('planner.detail.baits')}: </span>
                            {r.esche.map(s => `${s.nome} (${s.numero})`).join(', ')}
                        </p>
                    )}
                    {r.fasciaMigliore && (
                        <p className="text-gray-200 text-xs">
                            <span className="text-gray-400">{t('planner.detail.bestHours')}: </span>
                            {r.fasciaMigliore.da} - {r.fasciaMigliore.a}
                        </p>
                    )}
                </Card>
            )}

            <Card>
                <h4 className="text-cyan-400 font-semibold text-sm mb-2">{t('planner.detail.sessionsUsed')}</h4>
                {r.sessioniSimili.length === 0 ? (
                    <p className="text-gray-400 text-xs">{t('planner.detail.noSessions')}</p>
                ) : (
                    <ul className="text-xs text-gray-200 space-y-0.5">
                        {r.sessioniSimili.map(s => (
                            <li key={s.id} className="flex justify-between">
                                <span>{s.data}</span>
                                <span>{t('planner.detail.catches', { count: s.catture })}</span>
                                <span className="text-gray-400">{Math.round(s.somiglianza * 100)}%</span>
                            </li>
                        ))}
                    </ul>
                )}
                {r.nSenzaMeteo > 0 && (
                    <p className="text-gray-500 text-xs mt-2">{t('planner.detail.withoutWeather', { count: r.nSenzaMeteo })}</p>
                )}
            </Card>
        </div>
    )
}
