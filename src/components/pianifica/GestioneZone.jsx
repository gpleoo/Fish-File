import React, { useState } from 'react'
import { Plus, Trash2 } from '../Icons'
import { useTranslation } from '../../locales/LanguageContext'

const TIPI_SPOT = ['mare', 'lago', 'fiume']

const selectClass = 'bg-gray-900 border border-gray-600 rounded-lg px-2 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none'

/**
 * Creazione delle zone e assegnazione degli spot (ricavati dalle sessioni
 * registrate). Salva solo nella configurazione di Pianifica uscita.
 */
const GestioneZone = ({ config, onChange, spotDisponibili, zoneAuto = {}, spotSoloCondivisi = new Set(), onChiudi }) => {
    const { t } = useTranslation()
    const [nuovaZona, setNuovaZona] = useState('')

    const aggiungiZona = () => {
        const nome = nuovaZona.trim()
        if (!nome || config.zone.some(z => z.nome.toLowerCase() === nome.toLowerCase())) return
        onChange({ ...config, zone: [...config.zone, { id: `z${Date.now()}`, nome }] })
        setNuovaZona('')
    }

    const eliminaZona = (zona) => {
        if (!window.confirm(t('planner.zones.confirmDelete', { name: zona.nome }))) return
        const spot = Object.fromEntries(Object.entries(config.spot).map(([nome, s]) =>
            [nome, s.zonaId === zona.id ? { ...s, zonaId: null } : s]))
        onChange({ zone: config.zone.filter(z => z.id !== zona.id), spot })
    }

    const aggiornaSpot = (nome, campi) => {
        const attuale = config.spot[nome] || { zonaId: zoneAuto[nome] || null, tipo: 'mare' }
        onChange({ ...config, spot: { ...config.spot, [nome]: { ...attuale, ...campi } } })
    }

    return (
        <div className="space-y-4">
            <p className="text-gray-400 text-xs sm:text-sm">{t('planner.zones.help')}</p>

            <div className="bg-gray-800 rounded-lg p-3">
                <h3 className="text-cyan-400 font-semibold text-sm mb-2">{t('planner.zones.title')}</h3>
                <div className="flex gap-2 mb-3">
                    <input
                        value={nuovaZona}
                        onChange={(e) => setNuovaZona(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && aggiungiZona()}
                        placeholder={t('planner.zones.placeholder')}
                        className="flex-1 min-w-0 bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                    />
                    <button
                        onClick={aggiungiZona}
                        className="bg-cyan-600 text-white px-3 rounded-lg active:bg-cyan-700"
                        aria-label={t('planner.zones.add')}
                    >
                        <Plus width={20} height={20} />
                    </button>
                </div>
                {config.zone.length === 0 ? (
                    <p className="text-gray-500 text-sm">{t('planner.zones.empty')}</p>
                ) : (
                    <ul className="space-y-1">
                        {config.zone.map(z => (
                            <li key={z.id} className="flex items-center justify-between bg-gray-900 rounded-lg px-3 py-2">
                                <span className="text-white text-sm">
                                    {z.nome}
                                    <span className="text-gray-500 ml-2 text-xs">
                                        {t('planner.zones.spotCount', { count: Object.values(config.spot).filter(s => s.zonaId === z.id).length })}
                                    </span>
                                </span>
                                <button onClick={() => eliminaZona(z)} className="text-red-400 p-1" aria-label={t('common.delete')}>
                                    <Trash2 width={18} height={18} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="bg-gray-800 rounded-lg p-3">
                <h3 className="text-cyan-400 font-semibold text-sm mb-2">{t('planner.zones.spots')}</h3>
                {spotDisponibili.length === 0 ? (
                    <p className="text-gray-500 text-sm">{t('planner.zones.noSpots')}</p>
                ) : (
                    <ul className="space-y-2">
                        {spotDisponibili.map(sp => {
                            const conf = config.spot[sp.nome] || { zonaId: zoneAuto[sp.nome] || null, tipo: 'mare' }
                            return (
                                <li key={sp.nome} className="bg-gray-900 rounded-lg p-2">
                                    <div className="text-white text-sm mb-1.5">
                                        {sp.nome}
                                        <span className="text-gray-500 text-xs ml-2">{t('planner.zones.outings', { count: sp.uscite })}</span>
                                        {spotSoloCondivisi.has(sp.nome) && (
                                            <span className="text-amber-400 text-xs ml-2">{t('sharing.sharedSpot')}</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <select
                                            value={conf.zonaId || ''}
                                            onChange={(e) => aggiornaSpot(sp.nome, { zonaId: e.target.value || null })}
                                            className={`${selectClass} flex-1 min-w-0`}
                                            aria-label={t('planner.zones.zone')}
                                        >
                                            <option value="">{t('planner.zones.noZone')}</option>
                                            {config.zone.map(z => <option key={z.id} value={z.id}>{z.nome}</option>)}
                                        </select>
                                        <select
                                            value={conf.tipo || 'mare'}
                                            onChange={(e) => aggiornaSpot(sp.nome, { tipo: e.target.value })}
                                            className={selectClass}
                                            aria-label={t('planner.zones.type')}
                                        >
                                            {TIPI_SPOT.map(tipo => <option key={tipo} value={tipo}>{t(`planner.spotTypes.${tipo}`)}</option>)}
                                        </select>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </div>

            <button onClick={onChiudi} className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold active:bg-cyan-700">
                {t('planner.zones.done')}
            </button>
        </div>
    )
}

export default GestioneZone
