/**
 * Pianifica uscita - previsioni e meteo storico da Open-Meteo.
 * Modulo separato da weatherService.js (che resta invariato).
 *
 * - Previsioni: api.open-meteo.com/v1/forecast (anche date passate recenti)
 * - Storico: archive-api.open-meteo.com/v1/archive (dati con ~5 giorni di ritardo)
 * - Mare: marine-api.open-meteo.com/v1/marine
 */

import { faseLunare } from './spotAdvisor.js'

// Stessa mappatura dei codici WMO usata in weatherService.js
const weatherCodeToKey = (code) => {
    if (code === null || code === undefined) return null
    if (code <= 1) return 'clear'
    if (code === 2) return 'cloudy'
    if (code === 3) return 'overcast'
    if (code === 45 || code === 48) return 'fog'
    if (code >= 95) return 'storm'
    if (code >= 51) return 'rain'
    return 'cloudy'
}

const WEATHER_VARS = 'temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m,weather_code'
const MARINE_VARS = 'wave_height,sea_surface_temperature'
const GIORNI_RITARDO_ARCHIVIO = 6
const MAX_GIORNI_PER_RICHIESTA = 366

const oggiISO = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10)

const aggiungiGiorni = (data, n) => {
    const d = new Date(`${data}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + n)
    return d.toISOString().slice(0, 10)
}

const getJson = async (url) => {
    const res = await fetch(url, { headers: { Accept: 'application/json' } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
}

const scaricaOrario = async (base, vars, lat, lng, da, a, extra = {}) => {
    const params = new URLSearchParams({
        latitude: lat.toFixed(4),
        longitude: lng.toFixed(4),
        hourly: vars,
        timezone: 'Europe/Rome',
        start_date: da,
        end_date: a,
        ...extra
    })
    const json = await getJson(`${base}?${params}`)
    return json && json.hourly ? json.hourly : null
}

const media = (valori) => {
    const v = valori.filter(x => x !== null && x !== undefined && Number.isFinite(x))
    return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null
}

const mediaDirezioni = (gradi, pesi) => {
    let x = 0
    let y = 0
    let n = 0
    gradi.forEach((g, i) => {
        if (g === null || g === undefined) return
        const w = pesi && pesi[i] ? pesi[i] : 1
        x += Math.cos(g * Math.PI / 180) * w
        y += Math.sin(g * Math.PI / 180) * w
        n++
    })
    if (n === 0) return null
    return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}

const piuFrequente = (valori) => {
    const conteggi = {}
    let best = null
    for (const v of valori) {
        if (!v) continue
        conteggi[v] = (conteggi[v] || 0) + 1
        if (!best || conteggi[v] > conteggi[best]) best = v
    }
    return best
}

// Per ogni array `time` orario: data -> indice della mezzanotte
const indiceMezzanotti = new WeakMap()

const mezzanotti = (time) => {
    if (!indiceMezzanotti.has(time)) {
        const map = new Map()
        time.forEach((t, i) => { if (t.endsWith('T00:00')) map.set(t.slice(0, 10), i) })
        indiceMezzanotti.set(time, map)
    }
    return indiceMezzanotti.get(time)
}

/**
 * Indici delle ore di `time` che cadono nella fascia indicata. Le ore sono
 * contigue, quindi l'indice e' mezzanotte + ora (anche oltre le 24).
 */
const indiciFascia = (time, data, inizioMin, fineMin) => {
    const base = mezzanotti(time).get(data)
    if (base === undefined) return []
    const hInizio = Math.floor((inizioMin ?? 360) / 60)
    const hFine = fineMin !== null && fineMin !== undefined ? Math.ceil(fineMin / 60) : hInizio + 4
    const idx = []
    for (let h = hInizio; h < Math.max(hFine, hInizio + 1); h++) {
        if (base + h < time.length) idx.push(base + h)
    }
    return idx
}

/** Riduce i dati orari alla media della fascia indicata */
const aggregaFascia = (weather, marine, data, inizioMin, fineMin) => {
    const risultato = { tAria: null, tAcqua: null, pressione: null, ventoKn: null, ventoDir: null, condizioni: null, onde: null }
    if (weather && weather.time) {
        const idx = indiciFascia(weather.time, data, inizioMin, fineMin)
        const pick = (k) => idx.map(i => weather[k] ? weather[k][i] : null)
        const tAria = media(pick('temperature_2m'))
        const pressione = media(pick('surface_pressure'))
        const vento = media(pick('wind_speed_10m'))
        risultato.tAria = tAria === null ? null : Math.round(tAria)
        risultato.pressione = pressione === null ? null : Math.round(pressione)
        risultato.ventoKn = vento === null ? null : Math.round(vento)
        const dir = mediaDirezioni(pick('wind_direction_10m'), pick('wind_speed_10m'))
        risultato.ventoDir = dir === null ? null : Math.round(dir)
        risultato.condizioni = piuFrequente(pick('weather_code').map(weatherCodeToKey))
    }
    if (marine && marine.time) {
        const idx = indiciFascia(marine.time, data, inizioMin, fineMin)
        const onde = media(idx.map(i => marine.wave_height ? marine.wave_height[i] : null))
        const sst = media(idx.map(i => marine.sea_surface_temperature ? marine.sea_surface_temperature[i] : null))
        risultato.onde = onde === null ? null : Math.round(onde * 100)
        risultato.tAcqua = sst === null ? null : Math.round(sst)
    }
    return risultato
}

/**
 * Previsione per una data e fascia oraria.
 * @returns {Promise<{ meteo: Object, errori: string[] }>}
 */
export const scaricaPrevisione = async (lat, lng, data, inizioMin, fineMin, { mare = true } = {}) => {
    const errori = []
    const [weather, marine] = await Promise.all([
        scaricaOrario('https://api.open-meteo.com/v1/forecast', WEATHER_VARS, lat, lng, data, data, { wind_speed_unit: 'kn' })
            .catch(e => { errori.push(`meteo: ${e.message}`); return null }),
        mare
            ? scaricaOrario('https://marine-api.open-meteo.com/v1/marine', MARINE_VARS, lat, lng, data, data)
                .catch(e => { errori.push(`mare: ${e.message}`); return null })
            : Promise.resolve(null)
    ])
    const meteo = aggregaFascia(weather, marine, data, inizioMin, fineMin)
    meteo.luna = faseLunare(data)
    return { meteo, errori }
}

/** Divide un intervallo di date in blocchi accettati dalle API */
const blocchiDate = (da, a) => {
    const blocchi = []
    let inizio = da
    while (inizio <= a) {
        const fine = aggiungiGiorni(inizio, MAX_GIORNI_PER_RICHIESTA - 1)
        blocchi.push([inizio, fine < a ? fine : a])
        inizio = aggiungiGiorni(fine, 1)
    }
    return blocchi
}

const unisciOrari = (parti) => {
    const valide = parti.filter(Boolean)
    if (valide.length === 0) return null
    const out = {}
    for (const p of valide) {
        for (const [k, v] of Object.entries(p)) out[k] = (out[k] || []).concat(v)
    }
    return out
}

/**
 * Meteo storico per le uscite senza meteo salvato.
 * Raggruppa per spot e scarica un intervallo di date per richiesta.
 *
 * @param {Array} uscite - uscite di costruisciUscite con meteo === null
 * @param {Object} opzioni - { mareBySpot: { [spot]: boolean }, onProgress(fatti, totale) }
 * @returns {Promise<{ meteo: { [idUscita]: Object }, errori: string[] }>}
 */
export const scaricaStorico = async (uscite, { mareBySpot = {}, onProgress } = {}) => {
    const oggi = oggiISO()
    const limiteArchivio = aggiungiGiorni(oggi, -GIORNI_RITARDO_ARCHIVIO)
    const perSpot = new Map()
    for (const u of uscite) {
        if (u.lat === null || u.lng === null || u.data > oggi) continue
        if (!perSpot.has(u.spot)) perSpot.set(u.spot, [])
        perSpot.get(u.spot).push(u)
    }

    const meteo = {}
    const errori = []
    let fatti = 0
    const totale = perSpot.size
    for (const [spot, lista] of perSpot) {
        const lat = lista.reduce((s, u) => s + u.lat, 0) / lista.length
        const lng = lista.reduce((s, u) => s + u.lng, 0) / lista.length
        const date = lista.map(u => u.data).sort()
        const da = date[0]
        const a = date[date.length - 1]
        const mare = mareBySpot[spot] !== false

        const richieste = []
        // Storico consolidato per le date piu' vecchie, endpoint previsioni per le recenti
        if (da <= limiteArchivio) {
            const fineArchivio = a <= limiteArchivio ? a : limiteArchivio
            for (const [x, y] of blocchiDate(da, fineArchivio)) {
                richieste.push(scaricaOrario('https://archive-api.open-meteo.com/v1/archive', WEATHER_VARS, lat, lng, x, y, { wind_speed_unit: 'kn' }))
            }
        }
        if (a > limiteArchivio) {
            const inizioRecenti = da > limiteArchivio ? da : aggiungiGiorni(limiteArchivio, 1)
            richieste.push(scaricaOrario('https://api.open-meteo.com/v1/forecast', WEATHER_VARS, lat, lng, inizioRecenti, a, { wind_speed_unit: 'kn' }))
        }
        let weather = null
        try {
            weather = unisciOrari(await Promise.all(richieste))
        } catch (e) {
            errori.push(`${spot}: ${e.message}`)
        }
        let marine = null
        if (mare) {
            try {
                marine = unisciOrari(await Promise.all(
                    blocchiDate(da, a).map(([x, y]) => scaricaOrario('https://marine-api.open-meteo.com/v1/marine', MARINE_VARS, lat, lng, x, y))
                ))
            } catch {
                // Lo storico del mare non e' disponibile ovunque: si procede senza
            }
        }

        if (weather || marine) {
            for (const u of lista) {
                const m = aggregaFascia(weather, marine, u.data, u.inizioMin, u.fineMin)
                if (Object.values(m).some(v => v !== null)) {
                    meteo[u.id] = { ...m, maree: { alte: [], basse: [] } }
                }
            }
        }
        fatti++
        if (onProgress) onProgress(fatti, totale)
    }
    return { meteo, errori }
}

export const dataMassimaPrevisione = (giorni = 7) => aggiungiGiorni(oggiISO(), giorni)
export const dataOggi = oggiISO
