/**
 * Pianifica uscita - logica di confronto meteo/storico.
 *
 * Modulo puro (nessun accesso a localStorage, rete o React): legge i dati
 * esistenti dell'app SENZA modificarli e produce la classifica degli spot.
 * Supporta sia il formato dati salvato dall'app sia quello di demo-backup.json.
 */

export const MOON_PHASES = [
    'newMoon', 'waxingCrescent', 'firstQuarter', 'waxingGibbous',
    'fullMoon', 'waningGibbous', 'lastQuarter', 'waningCrescent'
]

export const WEATHER_KEYS = ['clear', 'cloudy', 'overcast', 'fog', 'rain', 'storm']

export const TIDE_PHASES = ['montante', 'stanca', 'calante']

// Le 16 direzioni della rosa dei venti, nello stesso formato usato da MeteoForm
export const WIND_DIRECTIONS = [
    { deg: 0, label: 'N (Tramontana - 4°/1° Quadrante - 0°)' },
    { deg: 22.5, label: 'NNE (Tramontana-Grecale - 1° Quadrante - 22,5°)' },
    { deg: 45, label: 'NE (Grecale - 1° Quadrante - 45°)' },
    { deg: 67.5, label: 'ENE (Grecale-Levante - 1° Quadrante - 67,5°)' },
    { deg: 90, label: 'E (Levante - 1°/2° Quadrante - 90°)' },
    { deg: 112.5, label: 'ESE (Levante-Scirocco - 2° Quadrante - 112,5°)' },
    { deg: 135, label: 'SE (Scirocco - 2° Quadrante - 135°)' },
    { deg: 157.5, label: 'SSE (Scirocco-Ostro - 2° Quadrante - 157,5°)' },
    { deg: 180, label: 'S (Ostro - 2°/3° Quadrante - 180°)' },
    { deg: 202.5, label: 'SSW (Ostro-Libeccio - 3° Quadrante - 202,5°)' },
    { deg: 225, label: 'SW (Libeccio - 3° Quadrante - 225°)' },
    { deg: 247.5, label: 'WSW (Libeccio-Ponente - 3° Quadrante - 247,5°)' },
    { deg: 270, label: 'W (Ponente - 3°/4° Quadrante - 270°)' },
    { deg: 292.5, label: 'WNW (Ponente-Maestrale - 4° Quadrante - 292,5°)' },
    { deg: 315, label: 'NW (Maestrale - 4° Quadrante - 315°)' },
    { deg: 337.5, label: 'NNW (Maestrale-Tramontana - 4° Quadrante - 337,5°)' }
]

const DIRECTION_TOKENS = {
    N: 0, NNE: 22.5, NE: 45, ENE: 67.5, E: 90, ESE: 112.5, SE: 135, SSE: 157.5,
    S: 180, SSW: 202.5, SW: 225, WSW: 247.5, W: 270, WNW: 292.5, NW: 315, NNW: 337.5,
    // Varianti italiane (O = Ovest)
    SSO: 202.5, SO: 225, OSO: 247.5, O: 270, ONO: 292.5, NO: 315, NNO: 337.5,
    TRAMONTANA: 0, GRECALE: 45, LEVANTE: 90, SCIROCCO: 135,
    OSTRO: 180, MEZZOGIORNO: 180, LIBECCIO: 225, PONENTE: 270, MAESTRALE: 315
}

// Scala ordinale delle condizioni: valori vicini = condizioni simili
const WEATHER_ORDER = { clear: 0, cloudy: 1, overcast: 2, fog: 2, rain: 3, storm: 4 }

// Fattori di confronto: peso e scarto oltre il quale la somiglianza vale 0
export const FACTORS = {
    pressione: { weight: 2, scale: 12 },
    ventoKn: { weight: 2, scale: 12 },
    ventoDir: { weight: 1.5, scale: 90 },
    onde: { weight: 1.5, scale: 80, soloMare: true },
    tAcqua: { weight: 1, scale: 5 },
    tAria: { weight: 0.5, scale: 10 },
    condizioni: { weight: 1 },
    luna: { weight: 0.75 },
    marea: { weight: 1, soloMare: true }
}

const MIN_PESO_FATTORI = 3      // sotto questa somma di pesi la sessione non e' confrontabile
const SIM_MIN = 0.4             // sotto questa somiglianza la sessione non conta
const SIM_SIMILE = 0.65         // soglia per considerare una sessione "simile"
const SIMILI_AFFIDABILITA_ALTA = 5
const SIMILI_AFFIDABILITA_MEDIA = 2
const SHRINK_K = 3              // prudenza verso la media quando i dati sono pochi
const VENTO_CALMO = 4           // nodi: sotto questa soglia la direzione non conta
const STANCA_MINUTI = 30        // +/- minuti attorno ad alta/bassa considerati stanca
const SEMI_PERIODO_MAREA = 372  // minuti tra alta e bassa (circa 6h12m)
const DURATA_DEFAULT_ORE = 4

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

export const parseNum = (v) => {
    if (v === null || v === undefined || v === '') return null
    const n = typeof v === 'number' ? v : Number(String(v).replace(',', '.').trim())
    return Number.isFinite(n) ? n : null
}

export const parseDirezione = (v) => {
    if (v === null || v === undefined || v === '') return null
    if (typeof v === 'number') return Number.isFinite(v) ? ((v % 360) + 360) % 360 : null
    const s = String(v).trim()
    const gradi = s.match(/(\d+(?:[.,]\d+)?)\s*°\s*\)?\s*$/)
    if (gradi) return parseNum(gradi[1])
    const token = s.split(/[\s(]/)[0].toUpperCase()
    return token in DIRECTION_TOKENS ? DIRECTION_TOKENS[token] : null
}

export const direzioneToLabel = (deg) => {
    if (deg === null || deg === undefined) return ''
    const idx = Math.round((((deg % 360) + 360) % 360) / 22.5) % 16
    return WIND_DIRECTIONS[idx].label
}

/** "HH:MM" -> minuti dalla mezzanotte */
export const parseOra = (v) => {
    if (!v || typeof v !== 'string') return null
    const m = v.trim().match(/^(\d{1,2})[:.](\d{2})/)
    if (!m) return null
    const h = Number(m[1])
    const min = Number(m[2])
    if (h > 23 || min > 59) return null
    return h * 60 + min
}

const romeFormatter = (() => {
    try {
        return new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Rome', year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
        })
    } catch {
        return null
    }
})()

/** Data ISO completa (es. 2026-01-15T09:25:00Z) -> { data: 'YYYY-MM-DD', minuti } ora italiana */
const isoToRome = (iso) => {
    const d = new Date(iso)
    if (isNaN(d.getTime())) return null
    if (!romeFormatter) {
        return { data: d.toISOString().slice(0, 10), minuti: d.getUTCHours() * 60 + d.getUTCMinutes() }
    }
    const p = Object.fromEntries(romeFormatter.formatToParts(d).map(x => [x.type, x.value]))
    return { data: `${p.year}-${p.month}-${p.day}`, minuti: Number(p.hour) * 60 + Number(p.minute) }
}

/** Legge data e ora di inizio o fine sessione in entrambi i formati supportati */
const leggiMomento = (data, ora) => {
    if (!data || typeof data !== 'string') return null
    if (data.includes('T')) return isoToRome(data)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) return null
    return { data, minuti: parseOra(ora) }
}

const giorniTra = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 86400000)

// ---------------------------------------------------------------------------
// Luna e maree
// ---------------------------------------------------------------------------

/**
 * Fase lunare per una data 'YYYY-MM-DD'. Stesse chiavi di weatherService, ma
 * con le fasi principali centrate sull'istante reale (ciclo medio: l'errore
 * puo' arrivare a circa un giorno vicino al cambio di fase).
 */
export const faseLunare = (data) => {
    const t = Date.parse(`${data}T12:00:00Z`)
    if (isNaN(t)) return null
    const riferimento = Date.UTC(2000, 0, 6, 18, 14) // luna nuova di riferimento
    const sinodico = 29.530588853
    const giorni = (t - riferimento) / 86400000
    const ciclo = ((giorni % sinodico) + sinodico) % sinodico
    if (ciclo < 0.92 || ciclo >= 28.61) return 'newMoon'
    if (ciclo < 6.46) return 'waxingCrescent'
    if (ciclo < 8.30) return 'firstQuarter'
    if (ciclo < 13.85) return 'waxingGibbous'
    if (ciclo < 15.69) return 'fullMoon'
    if (ciclo < 21.23) return 'waningGibbous'
    if (ciclo < 23.07) return 'lastQuarter'
    return 'waningCrescent'
}

/**
 * Elenco ordinato di alte e basse (in minuti), esteso prima e dopo con il
 * semiperiodo tipico per coprire finestre che superano gli orari inseriti.
 */
const estremiMarea = ({ alte = [], basse = [] }) => {
    const estremi = [
        ...alte.filter(m => m !== null).map(min => ({ min, tipo: 'alta' })),
        ...basse.filter(m => m !== null).map(min => ({ min, tipo: 'bassa' }))
    ].sort((a, b) => a.min - b.min)
    if (estremi.length === 0) return []
    const opposto = (tipo) => tipo === 'alta' ? 'bassa' : 'alta'
    for (let i = 0; i < 4; i++) {
        const primo = estremi[0]
        estremi.unshift({ min: primo.min - SEMI_PERIODO_MAREA, tipo: opposto(primo.tipo) })
        const ultimo = estremi[estremi.length - 1]
        estremi.push({ min: ultimo.min + SEMI_PERIODO_MAREA, tipo: opposto(ultimo.tipo) })
    }
    return estremi
}

/** Fase di marea in un istante (minuti), o null se mancano gli orari */
export const faseMareaAt = (maree, minuto) => {
    const estremi = estremiMarea(maree || {})
    if (estremi.length === 0) return null
    if (estremi.some(e => Math.abs(e.min - minuto) <= STANCA_MINUTI)) return 'stanca'
    let precedente = null
    for (const e of estremi) {
        if (e.min <= minuto) precedente = e
        else break
    }
    if (!precedente) return null
    return precedente.tipo === 'bassa' ? 'montante' : 'calante'
}

/** Quota di tempo della finestra [inizio, fine] trascorsa in ogni fase di marea */
export const distribuzioneMarea = (maree, inizio, fine) => {
    if (inizio === null || inizio === undefined) return null
    const end = fine !== null && fine !== undefined && fine > inizio ? fine : inizio + 60
    const conteggi = { montante: 0, stanca: 0, calante: 0 }
    let totale = 0
    for (let t = inizio; t < end; t += 5) {
        const fase = faseMareaAt(maree, t)
        if (!fase) return null
        conteggi[fase]++
        totale++
    }
    if (totale === 0) return null
    return Object.fromEntries(TIDE_PHASES.map(f => [f, conteggi[f] / totale]))
}

export const faseDominante = (distribuzione) => {
    if (!distribuzione) return null
    return TIDE_PHASES.reduce((best, f) => distribuzione[f] > distribuzione[best] ? f : best, TIDE_PHASES[0])
}

// ---------------------------------------------------------------------------
// Normalizzazione dei dati esistenti (sola lettura)
// ---------------------------------------------------------------------------

/** Meteo salvato (formato app o demo) -> valori numerici confrontabili */
export const normalizzaMeteo = (raw) => {
    if (!raw || typeof raw !== 'object') return null
    const formatoDemo = 'temperaturaAria' in raw || 'forzaVento' in raw || 'mareaAlta1' in raw
    const ondeRaw = parseNum(raw.altezzaOnde)
    const meteo = {
        tAria: parseNum(formatoDemo ? raw.temperaturaAria : raw.temperatura),
        tAcqua: parseNum(raw.temperaturaAcqua),
        pressione: parseNum(raw.pressione),
        ventoKn: parseNum(formatoDemo ? raw.forzaVento : raw.vento),
        ventoDir: parseDirezione(raw.direzioneVento),
        condizioni: WEATHER_KEYS.includes(raw.condizioni) ? raw.condizioni : null,
        // L'app salva le onde in cm, il formato demo in metri
        onde: ondeRaw === null ? null : (formatoDemo ? Math.round(ondeRaw * 100) : ondeRaw),
        maree: formatoDemo
            ? { alte: [parseOra(raw.mareaAlta1), parseOra(raw.mareaAlta2)], basse: [parseOra(raw.mareaBassa1), parseOra(raw.mareaBassa2)] }
            : { alte: [parseOra(raw.altaMareaOra)], basse: [parseOra(raw.bassaMareaOra)] }
    }
    const haDati = ['tAria', 'tAcqua', 'pressione', 'ventoKn', 'ventoDir', 'condizioni', 'onde']
        .some(k => meteo[k] !== null)
    return haDati ? meteo : null
}

/**
 * Sessioni completate + catture -> elenco di "uscite" normalizzate.
 * Il meteo viene preso dalla sessione, altrimenti dalla prima cattura che lo
 * contiene, altrimenti dall'archivio passato (meteoArchivio[id]).
 */
export const costruisciUscite = (sessioni = [], catture = [], meteoArchivio = {}) => {
    const cattureBySessione = new Map()
    for (const c of catture || []) {
        if (!c || c.sessioneId === undefined || c.sessioneId === null) continue
        const key = String(c.sessioneId)
        if (!cattureBySessione.has(key)) cattureBySessione.set(key, [])
        cattureBySessione.get(key).push(c)
    }

    const uscite = []
    for (const s of sessioni || []) {
        if (!s || !s.localita) continue
        const inizio = leggiMomento(s.dataInizio, s.oraInizio)
        if (!inizio) continue
        const fine = leggiMomento(s.dataFine, s.oraFine)

        let inizioMin = inizio.minuti
        let fineMin = fine && fine.minuti !== null ? fine.minuti + giorniTra(inizio.data, fine.data) * 1440 : null
        if (inizioMin !== null && (fineMin === null || fineMin <= inizioMin)) fineMin = null
        const durataOre = inizioMin !== null && fineMin !== null
            ? Math.max(1, (fineMin - inizioMin) / 60)
            : DURATA_DEFAULT_ORE

        const catt = cattureBySessione.get(String(s.id)) || []
        let meteo = normalizzaMeteo(s.meteo)
        let fonteMeteo = meteo ? 'sessione' : null
        if (!meteo) {
            for (const c of catt) {
                meteo = normalizzaMeteo(c.meteo)
                if (meteo) { fonteMeteo = 'cattura'; break }
            }
        }
        if (!meteo && meteoArchivio[String(s.id)]) {
            meteo = meteoArchivio[String(s.id)]
            fonteMeteo = 'archivio'
        }

        uscite.push({
            id: String(s.id),
            spot: String(s.localita).trim(),
            lat: parseNum(s.latitudine),
            lng: parseNum(s.longitudine),
            data: inizio.data,
            inizioMin,
            fineMin,
            durataOre,
            catture: catt,
            numeroCatture: catt.length,
            pesoTotale: catt.reduce((sum, c) => sum + (parseNum(c.peso) || 0), 0),
            meteo,
            fonteMeteo,
            luna: faseLunare(inizio.data),
            condivisa: !!s.condivisa
        })
    }
    return uscite
}

/** Elenco degli spot (per nome) con coordinate medie e numero di uscite */
export const elencoSpot = (uscite) => {
    const map = new Map()
    for (const u of uscite) {
        if (!map.has(u.spot)) map.set(u.spot, { nome: u.spot, latSum: 0, lngSum: 0, nCoord: 0, uscite: 0 })
        const s = map.get(u.spot)
        s.uscite++
        if (u.lat !== null && u.lng !== null) {
            s.latSum += u.lat
            s.lngSum += u.lng
            s.nCoord++
        }
    }
    return [...map.values()]
        .map(s => ({
            nome: s.nome,
            lat: s.nCoord ? s.latSum / s.nCoord : null,
            lng: s.nCoord ? s.lngSum / s.nCoord : null,
            uscite: s.uscite
        }))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
}

/** Centro di una zona = media delle coordinate dei suoi spot */
export const centroZona = (spotDellaZona) => {
    const conCoord = spotDellaZona.filter(s => s.lat !== null && s.lng !== null)
    if (conCoord.length === 0) return null
    return {
        lat: conCoord.reduce((sum, s) => sum + s.lat, 0) / conCoord.length,
        lng: conCoord.reduce((sum, s) => sum + s.lng, 0) / conCoord.length
    }
}

// ---------------------------------------------------------------------------
// Confronto e punteggio
// ---------------------------------------------------------------------------

const lineare = (a, b, scale) => Math.max(0, 1 - Math.abs(a - b) / scale)

const differenzaAngolo = (a, b) => {
    const d = Math.abs(a - b) % 360
    return d > 180 ? 360 - d : d
}

/** Somiglianza (0-1) per ogni fattore disponibile in entrambi */
export const somiglianzaFattori = (previsto, storico, { mare = true } = {}) => {
    const r = {}
    const p = previsto
    const s = storico
    if (p.pressione !== null && s.pressione !== null) r.pressione = lineare(p.pressione, s.pressione, FACTORS.pressione.scale)
    if (p.ventoKn !== null && s.ventoKn !== null) r.ventoKn = lineare(p.ventoKn, s.ventoKn, FACTORS.ventoKn.scale)
    if (p.ventoDir !== null && s.ventoDir !== null && p.ventoKn !== null && s.ventoKn !== null) {
        const calmoP = p.ventoKn < VENTO_CALMO
        const calmoS = s.ventoKn < VENTO_CALMO
        if (calmoP && calmoS) r.ventoDir = 1
        else if (!calmoP && !calmoS) r.ventoDir = Math.max(0, 1 - differenzaAngolo(p.ventoDir, s.ventoDir) / FACTORS.ventoDir.scale)
    }
    if (mare && p.onde !== null && s.onde !== null) r.onde = lineare(p.onde, s.onde, FACTORS.onde.scale)
    if (p.tAcqua !== null && s.tAcqua !== null) r.tAcqua = lineare(p.tAcqua, s.tAcqua, FACTORS.tAcqua.scale)
    if (p.tAria !== null && s.tAria !== null) r.tAria = lineare(p.tAria, s.tAria, FACTORS.tAria.scale)
    if (p.condizioni && s.condizioni) {
        r.condizioni = Math.max(0, 1 - Math.abs(WEATHER_ORDER[p.condizioni] - WEATHER_ORDER[s.condizioni]) / 2)
    }
    if (p.luna && s.luna) {
        const d = Math.abs(MOON_PHASES.indexOf(p.luna) - MOON_PHASES.indexOf(s.luna))
        const dist = Math.min(d, MOON_PHASES.length - d)
        r.luna = Math.max(0, 1 - dist / 2)
    }
    if (mare && p.marea && s.marea) {
        r.marea = TIDE_PHASES.reduce((sum, f) => sum + Math.min(p.marea[f], s.marea[f]), 0)
    }
    return r
}

/** Somiglianza complessiva (0-1) o null se i dati in comune sono troppo pochi */
export const somiglianza = (previsto, storico, opzioni) => {
    const fattori = somiglianzaFattori(previsto, storico, opzioni)
    let pesi = 0
    let somma = 0
    for (const [k, v] of Object.entries(fattori)) {
        pesi += FACTORS[k].weight
        somma += FACTORS[k].weight * v
    }
    if (pesi < MIN_PESO_FATTORI) return null
    return somma / pesi
}

const pesoSomiglianza = (sim) => sim === null || sim < SIM_MIN ? 0 : ((sim - SIM_MIN) / (1 - SIM_MIN)) ** 2

const percentile = (valori, p) => {
    if (valori.length === 0) return null
    const ordinati = [...valori].sort((a, b) => a - b)
    const idx = Math.min(ordinati.length - 1, Math.max(0, Math.ceil(p * ordinati.length) - 1))
    return ordinati[idx]
}

const topConteggi = (valori, n = 3) => {
    const conteggi = new Map()
    for (const v of valori) {
        if (!v) continue
        conteggi.set(v, (conteggi.get(v) || 0) + 1)
    }
    return [...conteggi.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, n)
        .map(([nome, numero]) => ({ nome, numero }))
}

/** Specie piu' catturate, ognuna con l'esca che ha reso di piu' per quella specie */
const predeConEsca = (catture, n = 3) => topConteggi(catture.map(c => c.specie), n).map(({ nome, numero }) => {
    const esca = topConteggi(catture.filter(c => c.specie === nome).map(c => c.esca), 1)[0]
    return { specie: nome, numero, esca: esca ? esca.nome : null }
})

/** Fascia di due ore con piu' catture (servono almeno 3 catture con orario) */
const fasciaMigliore = (catture) => {
    const ore = catture.map(c => parseOra(c.ora)).filter(m => m !== null).map(m => Math.floor(m / 60))
    if (ore.length < 3) return null
    let best = null
    for (let h = 0; h < 24; h++) {
        const n = ore.filter(o => o === h || o === (h + 1) % 24).length
        if (!best || n > best.n) best = { h, n }
    }
    const pad = (x) => String(x % 24).padStart(2, '0')
    return { da: `${pad(best.h)}:00`, a: `${pad(best.h + 2)}:00`, catture: best.n }
}

/** Arricchisce le uscite con la distribuzione di marea della loro finestra */
const conMarea = (u) => {
    if (!u.meteo) return u
    const marea = distribuzioneMarea(u.meteo.maree, u.inizioMin, u.fineMin)
    return { ...u, meteoConfronto: { ...u.meteo, luna: u.luna, marea } }
}

/**
 * Confronto tra meteo previsto e uscite migliori dello spot (fino a 5, con
 * almeno una cattura): per ogni fattore indica l'intervallo storico e se il
 * valore previsto vi rientra.
 */
const confrontoMigliori = (previsto, usciteSpot, mare) => {
    const migliori = usciteSpot
        .filter(u => u.meteoConfronto && u.numeroCatture > 0)
        .sort((a, b) => b.numeroCatture / b.durataOre - a.numeroCatture / a.durataOre)
        .slice(0, 5)
    if (migliori.length === 0) return { nMigliori: 0, righe: [] }

    const righe = []
    const numerico = (chiave, tolleranza) => {
        const valori = migliori.map(u => u.meteoConfronto[chiave]).filter(v => v !== null)
        if (valori.length === 0 || previsto[chiave] === null) return
        const min = Math.min(...valori)
        const max = Math.max(...valori)
        righe.push({
            fattore: chiave, previsto: previsto[chiave], min, max,
            ok: previsto[chiave] >= min - tolleranza && previsto[chiave] <= max + tolleranza
        })
    }
    numerico('pressione', 2)
    numerico('ventoKn', 3)
    const direzioni = migliori.filter(u => u.meteoConfronto.ventoDir !== null).map(u => u.meteoConfronto.ventoDir)
    if (direzioni.length && previsto.ventoDir !== null) {
        righe.push({
            fattore: 'ventoDir', previsto: previsto.ventoDir, valori: [...new Set(direzioni)],
            ok: direzioni.some(d => differenzaAngolo(d, previsto.ventoDir) <= 45)
        })
    }
    if (mare) numerico('onde', 15)
    numerico('tAcqua', 1)
    numerico('tAria', 2)
    const categorico = (chiave, valori, ok) => {
        if (valori.length && previsto[chiave]) righe.push({ fattore: chiave, previsto: previsto[chiave], valori: [...new Set(valori)], ok })
    }
    const cond = migliori.map(u => u.meteoConfronto.condizioni).filter(Boolean)
    categorico('condizioni', cond, cond.some(c => Math.abs(WEATHER_ORDER[c] - WEATHER_ORDER[previsto.condizioni]) <= 1))
    const lune = migliori.map(u => u.meteoConfronto.luna).filter(Boolean)
    categorico('luna', lune, lune.some(l => {
        const d = Math.abs(MOON_PHASES.indexOf(l) - MOON_PHASES.indexOf(previsto.luna))
        return Math.min(d, MOON_PHASES.length - d) <= 1
    }))
    if (mare && previsto.marea) {
        const fasi = migliori.map(u => faseDominante(u.meteoConfronto.marea)).filter(Boolean)
        const prevista = faseDominante(previsto.marea)
        if (fasi.length) righe.push({ fattore: 'marea', previsto: prevista, valori: [...new Set(fasi)], ok: fasi.includes(prevista) })
    }
    return { nMigliori: migliori.length, righe }
}

/**
 * Valuta gli spot di una zona.
 *
 * @param {Object} params
 * @param {Array} params.uscite - output di costruisciUscite (tutte)
 * @param {Array} params.spot - [{ nome, tipo: 'mare'|'lago'|'fiume' }] della zona
 * @param {Object} params.previsto - meteo pianificato della zona (valori numerici)
 * @param {Object} [params.correzioniSpot] - { [nomeSpot]: { campo: valore } }
 * @param {Object} params.finestra - { inizioMin, fineMin } fascia oraria scelta
 * @returns {Array} classifica ordinata per punteggio
 */
export const valutaSpot = ({ uscite, spot, previsto, correzioniSpot = {}, finestra }) => {
    const nomi = new Set(spot.map(s => s.nome))
    const usciteZona = uscite.filter(u => nomi.has(u.spot)).map(conMarea)
    const tasso = (u) => u.numeroCatture / u.durataOre

    const tassiZona = usciteZona.map(tasso)
    const mediaZona = tassiZona.length ? tassiZona.reduce((a, b) => a + b, 0) / tassiZona.length : 0
    const tassiPositivi = tassiZona.filter(t => t > 0)
    const riferimento = percentile(tassiPositivi, 0.9)

    const risultati = spot.map(sp => {
        const mare = sp.tipo !== 'lago' && sp.tipo !== 'fiume'
        const base = { ...previsto, ...(correzioniSpot[sp.nome] || {}) }
        const marea = mare ? distribuzioneMarea(base.maree, finestra.inizioMin, finestra.fineMin) : null
        const previstoSpot = { ...base, marea }

        const usciteSpot = usciteZona.filter(u => u.spot === sp.nome)
        const tassiSpot = usciteSpot.map(tasso)
        const prior = tassiSpot.length >= 3
            ? tassiSpot.reduce((a, b) => a + b, 0) / tassiSpot.length
            : mediaZona

        let sommaPesi = 0
        let sommaPesata = 0
        const valutate = []
        let senzaMeteo = 0
        for (const u of usciteSpot) {
            if (!u.meteoConfronto) { senzaMeteo++; continue }
            const sim = somiglianza(previstoSpot, u.meteoConfronto, { mare })
            if (sim === null) { senzaMeteo++; continue }
            const w = pesoSomiglianza(sim)
            sommaPesi += w
            sommaPesata += w * tasso(u)
            valutate.push({ uscita: u, sim })
        }

        const stima = (sommaPesata + SHRINK_K * prior) / (sommaPesi + SHRINK_K)
        const punteggio = riferimento ? Math.round(100 * Math.min(1, stima / riferimento)) : 0
        const simili = valutate.filter(v => v.sim >= SIM_SIMILE).sort((a, b) => b.sim - a.sim)
        const cattureSimili = simili.flatMap(v => v.uscita.catture)
        const nSimili = simili.length
        // Prede ed esche: dalle sessioni con meteo simile, altrimenti da tutto lo storico dello spot
        const catturePrede = cattureSimili.length ? cattureSimili : usciteSpot.flatMap(u => u.catture)
        const affidabilita = nSimili >= SIMILI_AFFIDABILITA_ALTA ? 'alta'
            : nSimili >= SIMILI_AFFIDABILITA_MEDIA ? 'media' : 'bassa'

        return {
            spot: sp.nome,
            tipo: mare ? 'mare' : sp.tipo,
            punteggio,
            stimaCatturePerOra: stima,
            affidabilita,
            pesoDati: sommaPesi,
            nUscite: usciteSpot.length,
            nUsciteCondivise: usciteSpot.filter(u => u.condivisa).length,
            nSenzaMeteo: senzaMeteo,
            nSimili,
            mediaCatture: nSimili ? simili.reduce((sum, v) => sum + v.uscita.numeroCatture, 0) / nSimili : null,
            percVuote: nSimili ? simili.filter(v => v.uscita.numeroCatture === 0).length / nSimili : null,
            specie: topConteggi(cattureSimili.map(c => c.specie)),
            esche: topConteggi(cattureSimili.map(c => c.esca)),
            prede: {
                fonte: cattureSimili.length ? 'simili' : 'spot',
                elenco: predeConEsca(catturePrede),
                esche: topConteggi(catturePrede.map(c => c.esca))
            },
            fasciaMigliore: fasciaMigliore(cattureSimili),
            confronto: confrontoMigliori(previstoSpot, usciteSpot, mare),
            sessioniSimili: simili.slice(0, 10).map(v => ({
                id: v.uscita.id,
                data: v.uscita.data,
                catture: v.uscita.numeroCatture,
                somiglianza: v.sim,
                condivisa: !!v.uscita.condivisa
            })),
            previsto: previstoSpot
        }
    })

    // Gli spot con dati insufficienti vanno in fondo: un'uscita fortunata non basta
    const insufficiente = (r) => r.affidabilita === 'bassa' ? 1 : 0
    return risultati.sort((a, b) =>
        insufficiente(a) - insufficiente(b) || b.punteggio - a.punteggio || b.pesoDati - a.pesoDati)
}
