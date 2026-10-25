/**
 * Fish File - Dati di test per "Pianifica uscita"
 *
 * Genera un backup importabile (formato dati reale dell'app) con sessioni
 * lungo il litorale pontino. Ogni spot "preferisce" alcune condizioni meteo,
 * cosi' si puo' verificare che la classifica suggerisca lo spot giusto.
 *
 * Uso:   node scripts/generaDatiTestPianifica.mjs [numeroSessioni] [seme]
 * Output: test-data/fishfile-test-pianifica-<numeroSessioni>.json
 *
 * ATTENZIONE: importare il file nell'app SOSTITUISCE i dati presenti.
 * Esportare prima un backup dei propri dati reali.
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { faseLunare, direzioneToLabel } from '../src/utils/pianifica/spotAdvisor.js'

const NUMERO_SESSIONI = Number(process.argv[2]) || 50
const SEME = Number(process.argv[3]) || 42

// Generatore pseudo-casuale con seme: stesso seme = stessi dati
let stato = SEME
const rnd = () => {
    stato = (stato + 0x6D2B79F5) | 0
    let t = Math.imul(stato ^ (stato >>> 15), 1 | stato)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const tra = (a, b) => a + rnd() * (b - a)
const intero = (a, b) => Math.floor(tra(a, b + 1))
const scegli = (lista) => lista[Math.floor(rnd() * lista.length)]
const poisson = (lambda) => {
    const L = Math.exp(-lambda)
    let k = 0
    let p = 1
    do { k++; p *= rnd() } while (p > L)
    return k - 1
}
const pad = (n) => String(n).padStart(2, '0')
const hhmm = (min) => `${pad(Math.floor(((min % 1440) + 1440) % 1440 / 60))}:${pad(((min % 60) + 60) % 60)}`

// --- Tipi di tempo tipici del Tirreno laziale ---
const TIPI_METEO = {
    scirocco: { dir: [120, 160], vento: [12, 22], onde: [60, 140], press: [1000, 1010], cielo: ['overcast', 'cloudy', 'rain'] },
    libeccio: { dir: [205, 245], vento: [15, 28], onde: [80, 180], press: [997, 1008], cielo: ['rain', 'overcast', 'storm'] },
    maestrale: { dir: [295, 330], vento: [10, 20], onde: [40, 100], press: [1012, 1022], cielo: ['clear', 'cloudy'] },
    tramontana: { dir: [350, 400], vento: [8, 18], onde: [10, 40], press: [1018, 1030], cielo: ['clear', 'clear', 'cloudy'] },
    calma: { dir: [0, 359], vento: [0, 5], onde: [0, 25], press: [1014, 1026], cielo: ['clear', 'cloudy', 'fog'] }
}
// Frequenza dei tipi di tempo per stagione
const TIPI_PER_STAGIONE = {
    inverno: ['scirocco', 'libeccio', 'libeccio', 'tramontana', 'tramontana', 'maestrale', 'calma'],
    primavera: ['scirocco', 'libeccio', 'maestrale', 'maestrale', 'tramontana', 'calma', 'calma'],
    estate: ['maestrale', 'maestrale', 'calma', 'calma', 'calma', 'scirocco', 'tramontana'],
    autunno: ['scirocco', 'scirocco', 'libeccio', 'libeccio', 'maestrale', 'tramontana', 'calma']
}
const stagione = (mese) => mese <= 2 || mese === 12 ? 'inverno' : mese <= 5 ? 'primavera' : mese <= 8 ? 'estate' : 'autunno'
const TEMP_ARIA = [11, 12, 14, 17, 21, 26, 29, 29, 25, 20, 16, 12]
const TEMP_ACQUA = [14, 13, 14, 15, 18, 22, 25, 26, 24, 21, 18, 15]

// --- Spot e condizioni preferite (verita' nota per verificare i risultati) ---
// Ogni spot e' un tratto di costa (da -> a): ogni sessione cade in un punto
// diverso del tratto, come quando ci si sposta di 1-2 km lungo la spiaggia.
const SPOT = [
    { nome: 'Anzio - Riviera di Ponente', zona: 'nord', tratto: [[41.4870, 12.5860], [41.4520, 12.6100]], pref: { maestrale: 1, calma: 0.6, tramontana: 0.3, scirocco: 0.2, libeccio: 0.1 }, specie: ['Orata', 'Sarago', 'Leccia stella'] },
    { nome: 'Nettuno - Litorale di Levante', zona: 'nord', tratto: [[41.4555, 12.6700], [41.4420, 12.7250]], pref: { scirocco: 1, libeccio: 0.7, maestrale: 0.3, tramontana: 0.1, calma: 0.1 }, specie: ['Mormora', 'Ombrina', 'Spigola'] },
    { nome: 'Latina - Foce Verde', zona: 'sud', tratto: [[41.4120, 12.7900], [41.3940, 12.8450]], pref: { libeccio: 1, scirocco: 0.7, maestrale: 0.3, tramontana: 0.2, calma: 0.1 }, specie: ['Spigola', 'Cefalo', 'Pesce serra'] },
    { nome: 'Latina - Rio Martino', zona: 'sud', tratto: [[41.3800, 12.8850], [41.3600, 12.9300]], pref: { scirocco: 0.8, calma: 0.5, libeccio: 0.4, maestrale: 0.3, tramontana: 0.2 }, specie: ['Spigola', 'Orata', 'Cefalo'] },
    { nome: 'Sabaudia - Lungomare', zona: 'sud', tratto: [[41.3400, 12.9550], [41.2600, 13.0200]], pref: { scirocco: 0.9, libeccio: 0.8, maestrale: 0.4, calma: 0.2, tramontana: 0.1 }, specie: ['Spigola', 'Ombrina', 'Mormora', 'Pesce serra'] },
    { nome: 'San Felice Circeo - Torre Paola', zona: 'sud', tratto: [[41.2560, 13.0250], [41.2420, 13.0340]], pref: { calma: 1, tramontana: 0.8, maestrale: 0.3, scirocco: 0.1, libeccio: 0.1 }, specie: ['Orata', 'Sarago', 'Occhiata'] },
    { nome: 'Terracina - Ponente e Molo', zona: 'sud', tratto: [[41.2935, 13.2050], [41.2830, 13.2470]], pref: { scirocco: 1, libeccio: 0.5, calma: 0.3, maestrale: 0.2, tramontana: 0.2 }, specie: ['Spigola', 'Orata', 'Sarago'] },
    { nome: 'Terracina - Spiaggia di Levante', zona: 'sud', tratto: [[41.2850, 13.2560], [41.2900, 13.2950]], pref: { libeccio: 0.9, scirocco: 0.8, maestrale: 0.3, tramontana: 0.1, calma: 0.1 }, specie: ['Spigola', 'Ombrina', 'Mormora'] }
]

/** Punto casuale lungo il tratto di costa, con uno scarto di qualche decina di metri */
const puntoNelTratto = ([[lat1, lng1], [lat2, lng2]]) => {
    const t = rnd()
    return {
        lat: Number((lat1 + (lat2 - lat1) * t + tra(-0.0003, 0.0003)).toFixed(6)),
        lng: Number((lng1 + (lng2 - lng1) * t + tra(-0.0003, 0.0003)).toFixed(6))
    }
}
const PESO_SPECIE = {
    Spigola: [400, 3500], Orata: [300, 1800], Sarago: [150, 900], Mormora: [100, 450], Ombrina: [500, 3000],
    Cefalo: [300, 1500], 'Pesce serra': [800, 4000], 'Leccia stella': [200, 900], Occhiata: [100, 400]
}
const ESCHE_SPECIE = {
    Spigola: ['Arenicola', 'Muriddu', 'Gambero'], Orata: ['Bibi', 'Granchio', 'Canolicchio'], Sarago: ['Bibi', 'Gambero', 'Arenicola'],
    Mormora: ['Arenicola', 'Americano', 'Coreano'], Ombrina: ['Bibi', 'Arenicola', 'Granchio'], Cefalo: ['Americano', 'Coreano'],
    'Pesce serra': ['Cefalo', 'Seppia'], 'Leccia stella': ['Gambero', 'Americano'], Occhiata: ['Americano', 'Gambero']
}
const CANNE = ['Surf 4.20 m', 'Bolognese 6 m', 'Beach ledgering 3.90 m']
const TRAVI = ['1x300', '2x200', '3x100']
const AMI = ['1/0', '2', '4', '6', '8']
const PIOMBI = ['Idropiramide 125', 'Idropiramide 150', 'Ogiva 100', 'Sporten 125', 'Palla 100']

// --- Meteo nel formato salvato dall'app ---
const generaMeteo = (tipo, data, mese, localita) => {
    const m = TIPI_METEO[tipo]
    const dir = Math.round(tra(...m.dir)) % 360
    const pressione = Math.round(tra(...m.press))
    const vento = Math.round(tra(...m.vento))
    const onde = Math.round(tra(...m.onde) / 5) * 5
    // Maree semidiurne: alta che slitta di circa 50 minuti al giorno
    const giorno = Math.round(Date.parse(data) / 86400000)
    const alta = ((giorno * 50 + 137) % 745 + 745) % 745
    return {
        data,
        localita,
        temperatura: String(Math.round(TEMP_ARIA[mese - 1] + tra(-3, 3))),
        temperaturaAcqua: String(Math.round(TEMP_ACQUA[mese - 1] + tra(-1, 1))),
        pressione: String(pressione),
        vento: String(vento),
        direzioneVento: direzioneToLabel(dir),
        condizioni: scegli(m.cielo),
        faseLunare: faseLunare(data),
        altaMareaOra: hhmm(alta),
        bassaMareaOra: hhmm(alta + 372),
        altezzaOnde: String(onde),
        frequenzaOnde: (onde / 20 + tra(2, 4)).toFixed(1)
    }
}

// --- Generazione ---
const ANNO = 2026
const OGGI = '2026-10-20'
const sessioni = []
const catture = []
const statistiche = { senzaCatture: 0, senzaMeteo: 0, perSpot: {} }

const dateUsate = new Set()
for (let i = 0; i < NUMERO_SESSIONI; i++) {
    const spot = SPOT[i % SPOT.length]
    let data
    do {
        const mese = intero(1, 10)
        data = `${ANNO}-${pad(mese)}-${pad(intero(1, 28))}`
    } while (data >= OGGI || dateUsate.has(`${data}-${spot.nome}`))
    dateUsate.add(`${data}-${spot.nome}`)
    const mese = Number(data.slice(5, 7))
    const tipo = scegli(TIPI_PER_STAGIONE[stagione(mese)])

    // Fascia: alba, giorno, tramonto o notte
    const fascia = scegli(['alba', 'alba', 'tramonto', 'tramonto', 'notte', 'giorno'])
    const inizio = { alba: intero(4, 6) * 60 + scegli([0, 30]), giorno: intero(9, 12) * 60, tramonto: intero(16, 18) * 60 + scegli([0, 30]), notte: intero(20, 22) * 60 }[fascia]
    const durata = intero(3, 6) * 60
    const fine = inizio + durata
    const dataFine = fine >= 1440
        ? new Date(Date.parse(`${data}T12:00:00Z`) + 86400000).toISOString().slice(0, 10)
        : data

    const meteo = generaMeteo(tipo, data, mese, spot.nome)
    const punto = puntoNelTratto(spot.tratto)

    // Catture attese: preferenza dello spot x fascia (alba e tramonto rendono di piu')
    const bonusFascia = { alba: 1.3, tramonto: 1.2, notte: 1, giorno: 0.6 }[fascia]
    const lambda = 3.2 * spot.pref[tipo] * bonusFascia * (durata / 240)
    const numero = poisson(lambda)

    const id = Date.parse(`${data}T${hhmm(inizio)}:00Z`) + i
    for (let k = 0; k < numero; k++) {
        const specie = scegli(spot.specie)
        const [pMin, pMax] = PESO_SPECIE[specie]
        const peso = Math.round(tra(pMin, pMax) / 10) * 10
        const minuto = inizio + intero(10, durata - 10)
        catture.push({
            id: id * 100 + k,
            sessioneId: id,
            data: minuto >= 1440 ? dataFine : data,
            ora: hhmm(minuto),
            specie,
            peso: String(peso),
            lunghezza: String(Math.round(Math.cbrt(peso) * 4.2)),
            localita: spot.nome,
            latitudine: String(punto.lat),
            longitudine: String(punto.lng),
            esca: scegli(ESCHE_SPECIE[specie]),
            canna: scegli(CANNE),
            trave: scegli(TRAVI),
            amo: scegli(AMI),
            piombo: scegli(PIOMBI),
            note: k === 0 && rnd() < 0.3 ? scegli(['Mangiata decisa', 'Acqua torbida', 'Pesce in superficie', 'Slamata una piu grossa']) : '',
            meteo
        })
    }

    const sessione = {
        id,
        localita: spot.nome,
        latitudine: punto.lat,
        longitudine: punto.lng,
        dataInizio: data,
        oraInizio: hhmm(inizio),
        dataFine,
        oraFine: hhmm(fine),
        numeroCatture: numero
    }
    // L'app salva il meteo solo sulle catture. Per le uscite a vuoto lo
    // aggiungiamo alla sessione, tranne alcune: queste verranno completate
    // da "Pianifica uscita" con il meteo storico di Open-Meteo (serve internet).
    if (numero === 0) {
        statistiche.senzaCatture++
        if (statistiche.senzaCatture % 4 === 0) statistiche.senzaMeteo++
        else sessione.meteo = meteo
    }
    sessioni.push(sessione)

    const s = (statistiche.perSpot[spot.nome] ||= { sessioni: 0, catture: 0, perTipo: {} })
    s.sessioni++
    s.catture += numero
    const pt = (s.perTipo[tipo] ||= { sessioni: 0, catture: 0 })
    pt.sessioni++
    pt.catture += numero
}

sessioni.sort((a, b) => `${a.dataInizio}${a.oraInizio}`.localeCompare(`${b.dataInizio}${b.oraInizio}`))

// Zone gia' pronte per Pianifica uscita (ripristinate insieme al backup)
const configPianifica = {
    zone: [
        { id: 'z-nord', nome: 'Anzio - Nettuno' },
        { id: 'z-sud', nome: 'Latina - Circeo - Terracina' }
    ],
    spot: Object.fromEntries(SPOT.map(s => [s.nome, { zonaId: s.zona === 'nord' ? 'z-nord' : 'z-sud', tipo: 'mare' }]))
}

const backup = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    data: {
        diarioPesca_catture: catture,
        diarioPesca_sessioniCompletate: sessioni,
        diarioPesca_specie: [...new Set(SPOT.flatMap(s => s.specie))].sort(),
        diarioPesca_localita: SPOT.map(s => s.nome).sort(),
        diarioPesca_esche: [...new Set(Object.values(ESCHE_SPECIE).flat())].sort(),
        diarioPesca_canne: CANNE,
        diarioPesca_travi: TRAVI,
        diarioPesca_ami: AMI,
        diarioPesca_piombi: PIOMBI,
        diarioPesca_note: [],
        diarioPesca_pianifica_config: configPianifica
    }
}

mkdirSync('test-data', { recursive: true })
const file = `test-data/fishfile-test-pianifica-${NUMERO_SESSIONI}.json`
writeFileSync(file, JSON.stringify(backup, null, 2))

console.log(`Creato ${file}`)
console.log(`Sessioni: ${sessioni.length}, catture: ${catture.length}, uscite a vuoto: ${statistiche.senzaCatture} (di cui ${statistiche.senzaMeteo} senza meteo)`)
console.log('\nCatture per spot e tipo di tempo (sessioni/catture):')
for (const [nome, s] of Object.entries(statistiche.perSpot)) {
    const dettaglio = Object.entries(s.perTipo).map(([t, v]) => `${t} ${v.sessioni}/${v.catture}`).join(', ')
    console.log(`- ${nome}: ${s.sessioni} sessioni, ${s.catture} catture | ${dettaglio}`)
}
