import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../locales/LanguageContext'
import { MOON_PHASES, WEATHER_KEYS, WIND_DIRECTIONS, parseNum } from '../../utils/pianifica/spotAdvisor'

export const CAMPI_METEO = ['tAria', 'tAcqua', 'pressione', 'ventoKn', 'ventoDir', 'condizioni', 'onde', 'luna']
export const CAMPI_CORREGGIBILI_SPOT = ['pressione', 'ventoKn', 'ventoDir', 'onde', 'tAcqua']

const UNITA = { tAria: '°C', tAcqua: '°C', pressione: 'hPa', ventoKn: 'kn', onde: 'cm' }

const STILE_ORIGINE = {
    prev: 'bg-cyan-900 text-cyan-300',
    mod: 'bg-amber-900 text-amber-300',
    calc: 'bg-gray-700 text-gray-300'
}

const inputClass = 'bg-gray-900 border border-gray-600 rounded-lg px-2 py-1.5 text-white text-sm focus:border-cyan-500 focus:outline-none'

const formatta = (v) => (v === null || v === undefined ? '' : String(v))

/** Campo numerico con bozza locale, per non interrompere la digitazione */
const InputNumerico = ({ valore, onChange, label }) => {
    const [bozza, setBozza] = useState(formatta(valore))
    const inModifica = useRef(false)
    useEffect(() => {
        if (!inModifica.current) setBozza(formatta(valore))
    }, [valore])
    return (
        <input
            type="text"
            inputMode="decimal"
            value={bozza}
            aria-label={label}
            onFocus={() => { inModifica.current = true }}
            onBlur={() => { inModifica.current = false; setBozza(formatta(valore)) }}
            onChange={(e) => {
                setBozza(e.target.value)
                onChange(parseNum(e.target.value))
            }}
            className={`${inputClass} w-20 text-right`}
        />
    )
}

/**
 * Una riga del meteo: etichetta, valore modificabile e origine del dato
 * (PREV = previsione, MOD = corretto a mano, CALC = calcolato).
 */
export const CampoMeteo = ({ campo, valore, origine, onChange }) => {
    const { t } = useTranslation()
    const label = t(`planner.factors.${campo}`)

    let controllo
    if (campo === 'ventoDir') {
        const selezionato = valore === null || valore === undefined
            ? ''
            : String(WIND_DIRECTIONS[Math.round((((valore % 360) + 360) % 360) / 22.5) % 16].deg)
        controllo = (
            <select value={selezionato} aria-label={label} className={`${inputClass} max-w-[11rem]`}
                onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
                <option value="">-</option>
                {WIND_DIRECTIONS.map(d => <option key={d.deg} value={d.deg}>{d.label}</option>)}
            </select>
        )
    } else if (campo === 'condizioni' || campo === 'luna') {
        const chiavi = campo === 'condizioni' ? WEATHER_KEYS : MOON_PHASES
        const prefisso = campo === 'condizioni' ? 'weatherConditions' : 'moonPhases'
        controllo = (
            <select value={valore || ''} aria-label={label} className={inputClass}
                onChange={(e) => onChange(e.target.value || null)}>
                <option value="">-</option>
                {chiavi.map(k => <option key={k} value={k}>{t(`${prefisso}.${k}`)}</option>)}
            </select>
        )
    } else {
        controllo = (
            <>
                <InputNumerico valore={valore} onChange={onChange} label={label} />
                <span className="text-gray-400 text-xs w-7">{UNITA[campo]}</span>
            </>
        )
    }

    return (
        <div className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-700 last:border-b-0">
            <span className="text-gray-300 text-sm">{label}</span>
            <div className="flex items-center gap-1.5">
                {controllo}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-11 text-center ${origine ? STILE_ORIGINE[origine] : 'invisible'}`}>
                    {origine ? t(`planner.origin.${origine}`) : '-'}
                </span>
            </div>
        </div>
    )
}
