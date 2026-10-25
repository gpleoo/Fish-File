/**
 * Condivisione dati tra utenti senza server.
 *
 * Modulo puro (nessun accesso a localStorage o React): crea il file da
 * condividere, lo valida in importazione e integra i dati ricevuti in uno
 * spazio separato da quello dell'utente.
 */

export const TIPO_FILE = 'fishfile-condivisione'
export const VERSIONE_FILE = 1
export const NUMERO_VARIANTI_ICONA = 8

// Sotto questo valore un peso non puo' essere in grammi: era stato inserito in kg
const SOGLIA_PESO_KG = 20

export class ErroreCondivisione extends Error {
    constructor(codice) {
        super(codice)
        this.codice = codice
    }
}

/** Peso in grammi: i valori sotto 20 sono kg inseriti per errore e vengono moltiplicati per 1000 */
export const pesoInGrammi = (peso) => {
    if (peso === null || peso === undefined || peso === '') return peso
    const n = Number(String(peso).replace(',', '.'))
    if (!Number.isFinite(n) || n <= 0 || n >= SOGLIA_PESO_KG) return peso
    return String(Math.round(n * 1000))
}

/** Converte i pesi in kg delle catture; restituisce le catture e quante sono cambiate */
export const convertiPesiKg = (catture = []) => {
    let convertite = 0
    const risultato = catture.map(c => {
        if (!c) return c
        const peso = pesoInGrammi(c.peso)
        if (peso === c.peso) return c
        convertite++
        return { ...c, peso }
    })
    return { catture: convertite ? risultato : catture, convertite }
}

/** Identificativo casuale per il profilo di chi condivide */
export const nuovoIdProfilo = () => {
    const casuale = Math.random().toString(36).slice(2, 10)
    return `u-${Date.now().toString(36)}-${casuale}`
}

/** Contenuto del file da inviare: tutte le sessioni e catture dell'utente */
export const creaFileCondivisione = ({ profilo, sessioni = [], catture = [] }) => ({
    tipo: TIPO_FILE,
    versione: VERSIONE_FILE,
    mittente: { id: profilo.id, nome: profilo.nome },
    creatoIl: new Date().toISOString(),
    sessioni,
    catture
})

export const nomeFileCondivisione = (nome, data = new Date()) => {
    const pulito = String(nome || 'utente')
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'utente'
    return `fishfile-condivisione-${pulito}-${data.toISOString().slice(0, 10)}.json`
}

/**
 * Valida il contenuto di un file ricevuto.
 * Errori (ErroreCondivisione.codice): 'formato', 'backup', 'proprio', 'vuoto'
 */
export const leggiFileCondivisione = (testo, { mioId } = {}) => {
    let dati
    try {
        dati = typeof testo === 'string' ? JSON.parse(testo) : testo
    } catch {
        throw new ErroreCondivisione('formato')
    }
    if (!dati || typeof dati !== 'object') throw new ErroreCondivisione('formato')
    if (dati.tipo !== TIPO_FILE) {
        // Un backup normale caricato nel pulsante sbagliato
        if (dati.data && (dati.data.diarioPesca_catture || dati.data.diarioPesca_sessioniCompletate)) {
            throw new ErroreCondivisione('backup')
        }
        throw new ErroreCondivisione('formato')
    }
    const mittente = dati.mittente
    if (!mittente || !mittente.id || !mittente.nome) throw new ErroreCondivisione('formato')
    if (mioId && mittente.id === mioId) throw new ErroreCondivisione('proprio')
    const sessioni = Array.isArray(dati.sessioni) ? dati.sessioni : []
    const catture = Array.isArray(dati.catture) ? dati.catture : []
    if (sessioni.length === 0) throw new ErroreCondivisione('vuoto')
    return { mittente: { id: String(mittente.id), nome: String(mittente.nome).trim() }, creatoIl: dati.creatoIl || null, sessioni, catture }
}

const prefissoId = (utenteId, id) => `cond-${utenteId}-${id}`

const primaVarianteLibera = (utenti) => {
    const usate = new Set(utenti.map(u => u.variante))
    for (let v = 0; v < NUMERO_VARIANTI_ICONA; v++) if (!usate.has(v)) return v
    return utenti.length % NUMERO_VARIANTI_ICONA
}

/**
 * Aggiunge (o sostituisce, se lo stesso mittente esiste gia') i dati ricevuti.
 * Gli id vengono resi unici con un prefisso per non confondersi con quelli
 * dell'utente; i pesi in kg vengono convertiti in grammi.
 */
export const integraDatiRicevuti = (stato, ricevuti, adesso = new Date()) => {
    const utenti = Array.isArray(stato?.utenti) ? stato.utenti : []
    const esistente = utenti.find(u => u.id === ricevuti.mittente.id)
    const altri = utenti.filter(u => u.id !== ricevuti.mittente.id)
    const uid = ricevuti.mittente.id

    const sessioni = ricevuti.sessioni
        .filter(s => s && s.id !== undefined && s.id !== null)
        .map(s => ({ ...s, id: prefissoId(uid, s.id) }))
    const catture = convertiPesiKg(ricevuti.catture
        .filter(c => c && c.sessioneId !== undefined && c.sessioneId !== null)
        .map(c => ({ ...c, id: prefissoId(uid, c.id), sessioneId: prefissoId(uid, c.sessioneId) }))).catture

    const utente = {
        id: uid,
        nome: ricevuti.mittente.nome,
        variante: esistente ? esistente.variante : primaVarianteLibera(altri),
        importatoIl: adesso.toISOString(),
        creatoIl: ricevuti.creatoIl,
        sessioni,
        catture
    }
    return {
        stato: { utenti: [...altri, utente] },
        sostituito: !!esistente,
        utente
    }
}

export const rimuoviUtente = (stato, utenteId) => ({
    utenti: (stato?.utenti || []).filter(u => u.id !== utenteId)
})

/**
 * Sessioni e catture ricevute, marcate con chi le ha condivise.
 * @param {string} filtro - 'tutti' | 'condivisi' | id di un utente
 */
export const datiCondivisiMarcati = (stato, filtro = 'tutti') => {
    const sessioni = []
    const catture = []
    for (const u of stato?.utenti || []) {
        if (filtro !== 'tutti' && filtro !== 'condivisi' && filtro !== u.id) continue
        const condivisa = { utenteId: u.id, nome: u.nome, variante: u.variante }
        for (const s of u.sessioni || []) sessioni.push({ ...s, condivisa })
        for (const c of u.catture || []) catture.push({ ...c, condivisa })
    }
    return { sessioni, catture }
}
