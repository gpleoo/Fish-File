/**
 * Test della logica "Pianifica uscita".
 * Esecuzione: npm test  (usa il test runner integrato di Node, nessuna dipendenza)
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
    parseDirezione, parseOra, faseLunare, faseMareaAt, distribuzioneMarea,
    normalizzaMeteo, costruisciUscite, elencoSpot, somiglianza, valutaSpot, direzioneToLabel
} from './spotAdvisor.js'
import { scaricaPrevisione, scaricaStorico } from './meteoPianifica.js'

test('direzione vento: etichette app, sigle demo, nomi italiani, gradi', () => {
    assert.equal(parseDirezione('SE (Scirocco - 2° Quadrante - 135°)'), 135)
    assert.equal(parseDirezione('NNE (Tramontana-Grecale - 1° Quadrante - 22,5°)'), 22.5)
    assert.equal(parseDirezione('NW'), 315)
    assert.equal(parseDirezione('Libeccio'), 225)
    assert.equal(parseDirezione(370), 10)
    assert.equal(parseDirezione(''), null)
    assert.equal(parseDirezione('boh'), null)
    assert.equal(direzioneToLabel(130), 'SE (Scirocco - 2° Quadrante - 135°)')
})

test('ora: HH:MM in minuti', () => {
    assert.equal(parseOra('07:42'), 462)
    assert.equal(parseOra('7.05'), 425)
    assert.equal(parseOra('25:00'), null)
    assert.equal(parseOra(''), null)
})

test('fase lunare per data', () => {
    // Ciclo medio: vicino al cambio di fase l'errore puo' essere di circa un giorno.
    // Lune piene note: 2026-10-26; lune nuove: 2026-11-09
    assert.equal(faseLunare('2026-10-26'), 'fullMoon')
    assert.equal(faseLunare('2026-11-09'), 'newMoon')
    assert.equal(faseLunare('2026-10-31'), 'waningGibbous')
})

test('maree: montante, stanca, calante', () => {
    const maree = { alte: [parseOra('07:42'), parseOra('20:05')], basse: [parseOra('01:30'), parseOra('13:55')] }
    assert.equal(faseMareaAt(maree, parseOra('05:00')), 'montante')
    assert.equal(faseMareaAt(maree, parseOra('07:30')), 'stanca')
    assert.equal(faseMareaAt(maree, parseOra('10:00')), 'calante')
    assert.equal(faseMareaAt(maree, parseOra('23:30')), 'calante')
    assert.equal(faseMareaAt({ alte: [], basse: [] }, 600), null)

    const d = distribuzioneMarea(maree, parseOra('06:00'), parseOra('10:00'))
    assert.ok(Math.abs(d.montante + d.stanca + d.calante - 1) < 1e-9)
    assert.ok(d.montante > 0.3 && d.calante > 0.3 && d.stanca > 0.1)
})

test('maree con un solo orario (formato app) vengono estese', () => {
    const maree = { alte: [parseOra('12:00')], basse: [] }
    assert.equal(faseMareaAt(maree, parseOra('09:00')), 'montante')
    assert.equal(faseMareaAt(maree, parseOra('15:00')), 'calante')
})

test('normalizzazione meteo: formato app', () => {
    const m = normalizzaMeteo({
        temperatura: '16', temperaturaAcqua: '19', pressione: '1012', vento: '12',
        direzioneVento: 'SE (Scirocco - 2° Quadrante - 135°)', condizioni: 'cloudy',
        faseLunare: 'fullMoon', altaMareaOra: '07:42', bassaMareaOra: '13:55', altezzaOnde: '60', frequenzaOnde: '5.5'
    })
    assert.deepEqual(
        [m.tAria, m.tAcqua, m.pressione, m.ventoKn, m.ventoDir, m.condizioni, m.onde],
        [16, 19, 1012, 12, 135, 'cloudy', 60]
    )
    assert.deepEqual(m.maree, { alte: [462], basse: [835] })
})

test('normalizzazione meteo: formato demo (onde in metri)', () => {
    const m = normalizzaMeteo({ temperaturaAria: 10, forzaVento: 22, direzioneVento: 'NW', altezzaOnde: 0.8, pressione: 1013, mareaAlta1: '04:51', mareaBassa1: '10:07', mareaAlta2: '16:10', mareaBassa2: '22:51' })
    assert.equal(m.tAria, 10)
    assert.equal(m.ventoKn, 22)
    assert.equal(m.ventoDir, 315)
    assert.equal(m.onde, 80)
    assert.equal(m.maree.alte.length, 2)
})

test('normalizzazione meteo: vuoto -> null', () => {
    assert.equal(normalizzaMeteo({ temperatura: '', vento: '', condizioni: '' }), null)
    assert.equal(normalizzaMeteo(null), null)
})

test('uscite: formato app, meteo dalla cattura, sessione senza catture senza meteo', () => {
    const sessioni = [
        { id: 1, localita: 'Molo', latitudine: 41.7, longitudine: 12.2, dataInizio: '2026-03-01', oraInizio: '06:00', dataFine: '2026-03-01', oraFine: '10:00', numeroCatture: 2 },
        { id: 2, localita: 'Molo', latitudine: 41.7, longitudine: 12.2, dataInizio: '2026-03-02', oraInizio: '22:00', dataFine: '2026-03-03', oraFine: '02:00', numeroCatture: 0 }
    ]
    const catture = [
        { id: 10, sessioneId: 1, specie: 'Spigola', peso: '900', ora: '07:10', meteo: { pressione: '1010', vento: '10' } },
        { id: 11, sessioneId: 1, specie: 'Orata', peso: '500', ora: '08:00', meteo: { pressione: '1010', vento: '10' } }
    ]
    const uscite = costruisciUscite(sessioni, catture)
    assert.equal(uscite.length, 2)
    assert.equal(uscite[0].numeroCatture, 2)
    assert.equal(uscite[0].durataOre, 4)
    assert.equal(uscite[0].fonteMeteo, 'cattura')
    assert.equal(uscite[0].pesoTotale, 1400)
    assert.equal(uscite[1].meteo, null)
    assert.equal(uscite[1].durataOre, 4, 'sessione a cavallo della mezzanotte')

    const conArchivio = costruisciUscite(sessioni, catture, { 2: { pressione: 1020, ventoKn: 5 } })
    assert.equal(conArchivio[1].fonteMeteo, 'archivio')
})

test('i dati originali non vengono modificati', () => {
    const sessioni = [{ id: 1, localita: 'Molo', latitudine: 41.7, longitudine: 12.2, dataInizio: '2026-03-01', oraInizio: '06:00', dataFine: '2026-03-01', oraFine: '10:00' }]
    const catture = [{ id: 10, sessioneId: 1, specie: 'Spigola', ora: '07:10', meteo: { pressione: '1010', vento: '10' } }]
    const prima = JSON.stringify({ sessioni, catture })
    const uscite = costruisciUscite(sessioni, catture)
    valutaSpot({
        uscite, spot: [{ nome: 'Molo', tipo: 'mare' }],
        previsto: { pressione: 1010, ventoKn: 10, ventoDir: null, onde: null, tAcqua: null, tAria: null, condizioni: null, luna: null, maree: { alte: [], basse: [] } },
        finestra: { inizioMin: 360, fineMin: 600 }
    })
    assert.equal(JSON.stringify({ sessioni, catture }), prima)
})

test('somiglianza: identico = 1, troppo pochi dati = null, vento calmo ignora direzione', () => {
    const base = { pressione: 1012, ventoKn: 10, ventoDir: 135, onde: 50, tAcqua: 18, tAria: 15, condizioni: 'cloudy', luna: 'fullMoon', marea: null }
    assert.equal(somiglianza(base, base), 1)
    assert.equal(somiglianza({ ...base, ventoKn: null, pressione: null, ventoDir: null, onde: null, tAcqua: null, tAria: null, condizioni: null }, base), null)
    const calmo = { ...base, ventoKn: 2, ventoDir: 0 }
    assert.equal(somiglianza(calmo, { ...base, ventoKn: 2, ventoDir: 180 }) > 0.99, true)
    assert.ok(somiglianza(base, { ...base, ventoDir: 315 }) < somiglianza(base, { ...base, ventoDir: 157.5 }))
})

test('classifica sul backup demo: punteggi validi e ordinati', () => {
    const demo = JSON.parse(readFileSync(new URL('../../../demo-backup.json', import.meta.url)))
    const uscite = costruisciUscite(demo.data.diarioPesca_sessioniCompletate, demo.data.diarioPesca_catture)
    assert.equal(uscite.length, demo.data.diarioPesca_sessioniCompletate.length)
    assert.ok(uscite.every(u => u.meteo), 'nel demo ogni sessione ha meteo')

    const spot = elencoSpot(uscite).map(s => ({ nome: s.nome, tipo: 'mare' }))
    const previsto = normalizzaMeteo(demo.data.diarioPesca_sessioniCompletate[0].meteo)
    previsto.luna = faseLunare('2026-10-31')
    const classifica = valutaSpot({ uscite, spot, previsto, finestra: { inizioMin: 360, fineMin: 600 } })

    assert.equal(classifica.length, spot.length)
    for (let i = 0; i < classifica.length; i++) {
        const r = classifica[i]
        assert.ok(r.punteggio >= 0 && r.punteggio <= 100)
        assert.ok(['alta', 'media', 'bassa'].includes(r.affidabilita))
        const prec = classifica[i - 1]
        if (prec && (prec.affidabilita === 'bassa') === (r.affidabilita === 'bassa')) assert.ok(prec.punteggio >= r.punteggio)
        if (prec) assert.ok(!(prec.affidabilita === 'bassa' && r.affidabilita !== 'bassa'), 'dati insufficienti in fondo')
    }
    assert.ok(classifica.some(r => r.nSimili > 0))
})

test('spot con poche uscite fortunate non domina (prudenza sui pochi dati)', () => {
    const previsto = { pressione: 1012, ventoKn: 10, ventoDir: 135, onde: 50, tAcqua: 18, tAria: 15, condizioni: 'cloudy', luna: null, maree: { alte: [], basse: [] } }
    const meteo = { temperatura: '15', temperaturaAcqua: '18', pressione: '1012', vento: '10', direzioneVento: 'SE', condizioni: 'cloudy', altezzaOnde: '50' }
    const sessioni = []
    const catture = []
    let id = 1
    const aggiungi = (localita, n) => {
        const sid = id++
        sessioni.push({ id: sid, localita, latitudine: 41, longitudine: 12, dataInizio: '2026-02-01', oraInizio: '06:00', dataFine: '2026-02-01', oraFine: '10:00', meteo })
        for (let k = 0; k < n; k++) catture.push({ id: id++, sessioneId: sid, specie: 'Spigola', ora: '07:00', meteo })
    }
    aggiungi('Fortunato', 8)                       // 1 uscita, 8 catture
    for (let k = 0; k < 8; k++) aggiungi('Costante', 3)   // 8 uscite da 3
    for (let k = 0; k < 8; k++) aggiungi('Scarso', 0)     // 8 uscite a vuoto
    const uscite = costruisciUscite(sessioni, catture)
    const classifica = valutaSpot({
        uscite,
        spot: ['Fortunato', 'Costante', 'Scarso'].map(nome => ({ nome, tipo: 'mare' })),
        previsto, finestra: { inizioMin: 360, fineMin: 600 }
    })
    assert.equal(classifica[0].spot, 'Costante')
    assert.equal(classifica[2].spot, 'Fortunato', 'dati insufficienti in fondo')
    assert.equal(classifica.find(r => r.spot === 'Fortunato').affidabilita, 'bassa')
    assert.equal(classifica.find(r => r.spot === 'Scarso').percVuote, 1)
})

test('correzioni per singolo spot cambiano solo quello spot', () => {
    const meteoCalmo = { pressione: '1015', vento: '4', direzioneVento: 'N', condizioni: 'clear' }
    const sessioni = [
        { id: 1, localita: 'A', latitudine: 41, longitudine: 12, dataInizio: '2026-02-01', oraInizio: '06:00', dataFine: '2026-02-01', oraFine: '10:00', meteo: meteoCalmo },
        { id: 2, localita: 'B', latitudine: 41, longitudine: 12, dataInizio: '2026-02-01', oraInizio: '06:00', dataFine: '2026-02-01', oraFine: '10:00', meteo: meteoCalmo }
    ]
    const catture = [{ id: 3, sessioneId: 1, ora: '07:00' }, { id: 4, sessioneId: 2, ora: '07:00' }]
    const previsto = { pressione: 1015, ventoKn: 4, ventoDir: 0, onde: null, tAcqua: null, tAria: null, condizioni: 'clear', luna: null, maree: { alte: [], basse: [] } }
    const uscite = costruisciUscite(sessioni, catture)
    const spot = [{ nome: 'A', tipo: 'mare' }, { nome: 'B', tipo: 'mare' }]
    const senza = valutaSpot({ uscite, spot, previsto, finestra: { inizioMin: 360, fineMin: 600 } })
    const con = valutaSpot({ uscite, spot, previsto, correzioniSpot: { B: { ventoKn: 25, pressione: 995 } }, finestra: { inizioMin: 360, fineMin: 600 } })
    const p = (lista, nome) => lista.find(r => r.spot === nome)
    assert.equal(p(con, 'A').punteggio, p(senza, 'A').punteggio)
    assert.ok(p(con, 'B').previsto.ventoKn === 25)
    assert.equal(p(con, 'B').nSimili, 0)
})

// --- Rete simulata ---

const conFetchFinto = async (risposte, fn) => {
    const originale = globalThis.fetch
    const chiamate = []
    globalThis.fetch = async (url) => {
        chiamate.push(url)
        const host = new URL(url).host
        const body = risposte[host]
        if (!body) return { ok: false, status: 500, json: async () => ({}) }
        return { ok: true, status: 200, json: async () => (typeof body === 'function' ? body(url) : body) }
    }
    try {
        return await fn(chiamate)
    } finally {
        globalThis.fetch = originale
    }
}

const orarioFinto = (da, giorni, valori) => {
    const time = []
    for (let g = 0; g < giorni; g++) {
        const d = new Date(`${da}T12:00:00Z`)
        d.setUTCDate(d.getUTCDate() + g)
        const ds = d.toISOString().slice(0, 10)
        for (let h = 0; h < 24; h++) time.push(`${ds}T${String(h).padStart(2, '0')}:00`)
    }
    const out = { time }
    for (const [k, fn] of Object.entries(valori)) out[k] = time.map((t, i) => fn(i, t))
    return out
}

test('previsione: media della fascia oraria e conversione onde in cm', async () => {
    const weather = orarioFinto('2026-10-31', 1, {
        temperature_2m: (i) => i,                // ore 6-9 -> media 7.5
        surface_pressure: () => 1012.4,
        wind_speed_10m: () => 10,
        wind_direction_10m: (i) => (i % 2 ? 350 : 10), // media circolare ~0
        weather_code: (i) => (i < 8 ? 3 : 61)
    })
    const marine = orarioFinto('2026-10-31', 1, { wave_height: () => 0.6, sea_surface_temperature: () => 19.2 })
    await conFetchFinto({ 'api.open-meteo.com': { hourly: weather }, 'marine-api.open-meteo.com': { hourly: marine } }, async () => {
        const { meteo, errori } = await scaricaPrevisione(41, 13, '2026-10-31', 360, 600)
        assert.deepEqual(errori, [])
        assert.equal(meteo.tAria, 8)
        assert.equal(meteo.pressione, 1012)
        assert.equal(meteo.ventoKn, 10)
        assert.ok(meteo.ventoDir < 1 || meteo.ventoDir > 359)
        assert.equal(meteo.condizioni, 'overcast')
        assert.equal(meteo.onde, 60)
        assert.equal(meteo.tAcqua, 19)
        assert.equal(meteo.luna, 'waningGibbous')
    })
})

test('previsione: errore di rete non blocca, restituisce valori vuoti', async () => {
    await conFetchFinto({}, async () => {
        const { meteo, errori } = await scaricaPrevisione(41, 13, '2026-10-31', 360, 600)
        assert.equal(errori.length, 2)
        assert.equal(meteo.pressione, null)
        assert.equal(meteo.luna, 'waningGibbous')
    })
})

test('storico: una richiesta per spot e meteo assegnato a ogni uscita', async () => {
    const uscite = [
        { id: 'a', spot: 'Molo', lat: 41, lng: 12, data: '2025-03-01', inizioMin: 360, fineMin: 600, meteo: null },
        { id: 'b', spot: 'Molo', lat: 41, lng: 12, data: '2025-03-05', inizioMin: 1320, fineMin: 1560, meteo: null }
    ]
    const weather = orarioFinto('2025-03-01', 6, {
        temperature_2m: () => 12, surface_pressure: () => 1020, wind_speed_10m: () => 8,
        wind_direction_10m: () => 225, weather_code: () => 0
    })
    await conFetchFinto({ 'archive-api.open-meteo.com': { hourly: weather } }, async (chiamate) => {
        const { meteo } = await scaricaStorico(uscite, { mareBySpot: { Molo: false } })
        assert.equal(chiamate.length, 1)
        assert.equal(meteo.a.pressione, 1020)
        assert.equal(meteo.a.ventoDir, 225)
        assert.equal(meteo.b.condizioni, 'clear', 'fascia a cavallo della mezzanotte')
    })
})

test('prede con esca: da sessioni simili, altrimenti dallo storico dello spot', () => {
    const meteo = { pressione: '1012', vento: '10', direzioneVento: 'SE', condizioni: 'cloudy', temperatura: '15' }
    const sessioni = [1, 2, 3].map(id => ({ id, localita: 'Molo', latitudine: 41, longitudine: 12, dataInizio: '2026-02-0' + id, oraInizio: '06:00', dataFine: '2026-02-0' + id, oraFine: '10:00', meteo }))
    const catture = [
        { id: 10, sessioneId: 1, specie: 'Spigola', esca: 'Arenicola', ora: '07:00' },
        { id: 11, sessioneId: 2, specie: 'Spigola', esca: 'Arenicola', ora: '07:00' },
        { id: 12, sessioneId: 2, specie: 'Spigola', esca: 'Gambero', ora: '07:30' },
        { id: 13, sessioneId: 3, specie: 'Orata', esca: 'Bibi', ora: '08:00' }
    ]
    const uscite = costruisciUscite(sessioni, catture)
    const base = { pressione: 1012, ventoKn: 10, ventoDir: 135, onde: null, tAcqua: null, tAria: 15, condizioni: 'cloudy', luna: null, maree: { alte: [], basse: [] } }
    const finestra = { inizioMin: 360, fineMin: 600 }
    const [simile] = valutaSpot({ uscite, spot: [{ nome: 'Molo', tipo: 'mare' }], previsto: base, finestra })
    assert.equal(simile.prede.fonte, 'simili')
    assert.deepEqual(simile.prede.elenco[0], { specie: 'Spigola', numero: 3, esca: 'Arenicola' })
    assert.deepEqual(simile.prede.elenco[1], { specie: 'Orata', numero: 1, esca: 'Bibi' })

    const opposto = { ...base, pressione: 990, ventoKn: 30, ventoDir: 315, condizioni: 'storm', tAria: 35 }
    const [diverso] = valutaSpot({ uscite, spot: [{ nome: 'Molo', tipo: 'mare' }], previsto: opposto, finestra })
    assert.equal(diverso.nSimili, 0)
    assert.equal(diverso.prede.fonte, 'spot')
    assert.equal(diverso.prede.elenco[0].specie, 'Spigola')
})
