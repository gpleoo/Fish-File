/**
 * Test della condivisione dati tra utenti.
 * Esecuzione: npm test
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
    pesoInGrammi, convertiPesiKg, creaFileCondivisione, leggiFileCondivisione, integraDatiRicevuti,
    rimuoviUtente, datiCondivisiMarcati, nomeFileCondivisione, ErroreCondivisione, NUMERO_VARIANTI_ICONA
} from './condivisione.js'
import { costruisciUscite } from '../pianifica/spotAdvisor.js'
import { assegnaSpotCondivisi, zoneAutomatiche, distanzaKm } from '../pianifica/condivisi.js'

const sessione = (id, extra = {}) => ({ id, localita: 'Latina - Foce Verde', latitudine: 41.41, longitudine: 12.80, dataInizio: '2026-03-01', oraInizio: '06:00', dataFine: '2026-03-01', oraFine: '10:00', ...extra })
const cattura = (id, sessioneId, extra = {}) => ({ id, sessioneId, specie: 'Spigola', peso: '1200', ora: '07:00', data: '2026-03-01', ...extra })

test('peso: valori sotto 20 sono kg e diventano grammi', () => {
    assert.equal(pesoInGrammi('1.5'), '1500')
    assert.equal(pesoInGrammi('0,8'), '800')
    assert.equal(pesoInGrammi(2), '2000')
    assert.equal(pesoInGrammi('224'), '224')
    assert.equal(pesoInGrammi('20'), '20')
    assert.equal(pesoInGrammi(''), '')
    assert.equal(pesoInGrammi(undefined), undefined)
    assert.equal(pesoInGrammi('0'), '0')
    assert.equal(pesoInGrammi('abc'), 'abc')
})

test('conversione pesi: conta le modifiche e non tocca il resto', () => {
    const originali = [{ id: 1, peso: '1.2' }, { id: 2, peso: '800' }, { id: 3 }]
    const { catture, convertite } = convertiPesiKg(originali)
    assert.equal(convertite, 1)
    assert.equal(catture[0].peso, '1200')
    assert.equal(catture[1], originali[1])
    assert.equal(originali[0].peso, '1.2', 'array originale invariato')
    const nessuna = convertiPesiKg([{ id: 2, peso: '800' }])
    assert.equal(nessuna.convertite, 0)
})

test('file condiviso: creazione e lettura', () => {
    const file = creaFileCondivisione({ profilo: { id: 'u-marco', nome: 'Marco' }, sessioni: [sessione(1)], catture: [cattura(10, 1)] })
    const letto = leggiFileCondivisione(JSON.stringify(file), { mioId: 'u-io' })
    assert.equal(letto.mittente.nome, 'Marco')
    assert.equal(letto.sessioni.length, 1)
    assert.equal(nomeFileCondivisione('Marco Rossì', new Date('2026-10-25T10:00:00Z')), 'fishfile-condivisione-marco-rossi-2026-10-25.json')
})

test('file condiviso: errori chiari', () => {
    const codice = (fn) => { try { fn(); return null } catch (e) { assert.ok(e instanceof ErroreCondivisione); return e.codice } }
    const file = creaFileCondivisione({ profilo: { id: 'u-io', nome: 'Io' }, sessioni: [sessione(1)], catture: [] })
    assert.equal(codice(() => leggiFileCondivisione('non json')), 'formato')
    assert.equal(codice(() => leggiFileCondivisione({ version: '1.0', data: { diarioPesca_catture: [] } })), 'backup')
    assert.equal(codice(() => leggiFileCondivisione(file, { mioId: 'u-io' })), 'proprio')
    assert.equal(codice(() => leggiFileCondivisione({ ...file, sessioni: [] }, { mioId: 'x' })), 'vuoto')
    assert.equal(codice(() => leggiFileCondivisione({ ...file, mittente: null })), 'formato')
})

test('integrazione: id separati, pesi convertiti, aggiornamento sostituisce', () => {
    const ricevuti = { mittente: { id: 'u-marco', nome: 'Marco' }, creatoIl: null, sessioni: [sessione(1)], catture: [cattura(10, 1, { peso: '1.5' })] }
    const primo = integraDatiRicevuti({ utenti: [] }, ricevuti)
    const marco = primo.stato.utenti[0]
    assert.equal(primo.sostituito, false)
    assert.equal(marco.sessioni[0].id, 'cond-u-marco-1')
    assert.equal(marco.catture[0].sessioneId, 'cond-u-marco-1')
    assert.equal(marco.catture[0].peso, '1500')
    assert.equal(marco.variante, 0)

    const conLuca = integraDatiRicevuti(primo.stato, { ...ricevuti, mittente: { id: 'u-luca', nome: 'Luca' } }).stato
    assert.equal(conLuca.utenti.find(u => u.id === 'u-luca').variante, 1)

    const aggiornato = integraDatiRicevuti(conLuca, { ...ricevuti, mittente: { id: 'u-marco', nome: 'Marco R.' }, sessioni: [sessione(1), sessione(2)] })
    assert.equal(aggiornato.sostituito, true)
    assert.equal(aggiornato.stato.utenti.length, 2)
    const marco2 = aggiornato.stato.utenti.find(u => u.id === 'u-marco')
    assert.equal(marco2.sessioni.length, 2)
    assert.equal(marco2.nome, 'Marco R.')
    assert.equal(marco2.variante, 0, 'la variante icona resta la stessa')

    assert.equal(rimuoviUtente(aggiornato.stato, 'u-marco').utenti.length, 1)
})

test('varianti icona: tutte diverse fino al massimo, poi si riusano', () => {
    let stato = { utenti: [] }
    for (let i = 0; i < NUMERO_VARIANTI_ICONA + 1; i++) {
        stato = integraDatiRicevuti(stato, { mittente: { id: `u${i}`, nome: `U${i}` }, sessioni: [sessione(1)], catture: [] }).stato
    }
    const varianti = stato.utenti.slice(0, NUMERO_VARIANTI_ICONA).map(u => u.variante)
    assert.equal(new Set(varianti).size, NUMERO_VARIANTI_ICONA)
})

test('dati marcati: filtro per persona', () => {
    let stato = integraDatiRicevuti({ utenti: [] }, { mittente: { id: 'a', nome: 'A' }, sessioni: [sessione(1)], catture: [cattura(10, 1)] }).stato
    stato = integraDatiRicevuti(stato, { mittente: { id: 'b', nome: 'B' }, sessioni: [sessione(1), sessione(2)], catture: [] }).stato
    assert.equal(datiCondivisiMarcati(stato).sessioni.length, 3)
    assert.equal(datiCondivisiMarcati(stato, 'b').sessioni.length, 2)
    const { sessioni, catture } = datiCondivisiMarcati(stato, 'a')
    assert.deepEqual(sessioni[0].condivisa, { utenteId: 'a', nome: 'A', variante: 0 })
    assert.equal(catture[0].condivisa.nome, 'A')
})

test('pianificazione: sessioni condivise prendono il nome del proprio spot entro 3 km', () => {
    const mie = costruisciUscite([sessione(1, { localita: 'Foce Verde', latitudine: 41.4100, longitudine: 12.8000 })], [])
    const ricevute = costruisciUscite([
        { ...sessione('cond-a-1', { localita: 'Spiaggia Latina', latitudine: 41.4150, longitudine: 12.8100 }), condivisa: { utenteId: 'a' } },
        { ...sessione('cond-a-2', { localita: 'Foce Verde', latitudine: 41.2800, longitudine: 13.2500 }), condivisa: { utenteId: 'a' } },
        { ...sessione('cond-a-3', { localita: 'Sperlonga', latitudine: 41.2600, longitudine: 13.4300 }), condivisa: { utenteId: 'a' } }
    ], [])
    assert.ok(distanzaKm(41.41, 12.80, 41.415, 12.81) < 3)
    const assegnate = assegnaSpotCondivisi(ricevute, mie)
    assert.equal(assegnate[0].spot, 'Foce Verde')
    assert.equal(assegnate[1].spot, 'Foce Verde (condiviso)', 'stesso nome ma lontano: distinto')
    assert.equal(assegnate[2].spot, 'Sperlonga')
    assert.ok(assegnate.every(u => u.condivisa))

    // Spot lungo: conta la sessione propria piu' vicina, non il punto medio dello spot
    const lungo = costruisciUscite([
        sessione(5, { localita: 'Sabaudia', latitudine: 41.3400, longitudine: 12.9550 }),
        sessione(6, { localita: 'Sabaudia', latitudine: 41.2600, longitudine: 13.0200 })
    ], [])
    const vicinoAlCapo = costruisciUscite([{ ...sessione('cond-a-9', { localita: 'Dune', latitudine: 41.2650, longitudine: 13.0150 }), condivisa: { utenteId: 'a' } }], [])
    assert.equal(assegnaSpotCondivisi(vicinoAlCapo, lungo)[0].spot, 'Sabaudia')

    const zone = zoneAutomatiche(
        [{ nome: 'Foce Verde (condiviso)', lat: 41.28, lng: 13.25 }, { nome: 'Lontano', lat: 40.5, lng: 14.5 }],
        [{ id: 'nord', lat: 41.44, lng: 12.65 }, { id: 'sud', lat: 41.29, lng: 13.10 }]
    )
    assert.deepEqual(zone, { 'Foce Verde (condiviso)': 'sud' })
})
