/**
 * Pianifica uscita - integrazione delle sessioni ricevute da altri utenti.
 *
 * Una sessione condivisa vicina a uno spot dell'utente ne prende il nome
 * (e quindi la zona); le altre restano spot a se', assegnati in automatico
 * alla zona piu' vicina.
 */

export const RAGGIO_SPOT_KM = 3
export const RAGGIO_ZONA_KM = 25
const SUFFISSO_CONDIVISO = ' (condiviso)'

export const distanzaKm = (lat1, lng1, lat2, lng2) => {
    const r = (x) => x * Math.PI / 180
    const dLat = r(lat2 - lat1)
    const dLng = r(lng2 - lng1)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(dLng / 2) ** 2
    return 2 * 6371 * Math.asin(Math.sqrt(a))
}

const piuVicino = (lat, lng, punti, raggioKm) => {
    let best = null
    for (const p of punti) {
        if (p.lat === null || p.lng === null || p.lat === undefined || p.lng === undefined) continue
        const d = distanzaKm(lat, lng, p.lat, p.lng)
        if (d <= raggioKm && (!best || d < best.d)) best = { punto: p, d }
    }
    return best ? best.punto : null
}

/**
 * Rinomina le uscite condivise con il nome del proprio spot piu' vicino:
 * conta la distanza dalla propria sessione piu' vicina (entro RAGGIO_SPOT_KM),
 * cosi' anche gli spot lunghi qualche km vengono riconosciuti. Se uno spot
 * lontano ha lo stesso nome di uno dei propri, viene distinto con un suffisso.
 *
 * @param {Array} usciteCondivise - output di costruisciUscite sui dati ricevuti
 * @param {Array} usciteMie - output di costruisciUscite sui propri dati
 */
export const assegnaSpotCondivisi = (usciteCondivise, usciteMie) => {
    const nomiMiei = new Set(usciteMie.map(u => u.spot))
    const puntiMiei = usciteMie.map(u => ({ nome: u.spot, lat: u.lat, lng: u.lng }))
    return usciteCondivise.map(u => {
        const vicino = u.lat !== null && u.lng !== null ? piuVicino(u.lat, u.lng, puntiMiei, RAGGIO_SPOT_KM) : null
        if (vicino) return { ...u, spot: vicino.nome, condivisa: true }
        const spot = nomiMiei.has(u.spot) ? `${u.spot}${SUFFISSO_CONDIVISO}` : u.spot
        return { ...u, spot, condivisa: true }
    })
}

/**
 * Zona automatica per gli spot presenti solo nei dati condivisi: la zona
 * con il centro piu' vicino entro RAGGIO_ZONA_KM.
 *
 * @param {Array} spotSoloCondivisi - [{ nome, lat, lng }]
 * @param {Array} centriZone - [{ id, lat, lng }]
 * @returns {Object} { [nomeSpot]: zonaId }
 */
export const zoneAutomatiche = (spotSoloCondivisi, centriZone) => {
    const out = {}
    for (const s of spotSoloCondivisi) {
        if (s.lat === null || s.lng === null) continue
        const zona = piuVicino(s.lat, s.lng, centriZone, RAGGIO_ZONA_KM)
        if (zona) out[s.nome] = zona.id
    }
    return out
}
