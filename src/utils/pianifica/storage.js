/**
 * Pianifica uscita - salvataggio locale.
 * Usa solo chiavi proprie (diarioPesca_pianifica_*): i dati esistenti
 * dell'app non vengono mai letti o scritti da qui.
 */

import { useEffect, useState } from 'react'

const KEY_ATTIVA = 'diarioPesca_pianifica_attiva'
const KEY_CONFIG = 'diarioPesca_pianifica_config'
const KEY_ARCHIVIO = 'diarioPesca_pianifica_archivio'
const EVENTO_ATTIVA = 'fishfile:pianifica-attiva'

const leggi = (key, fallback) => {
    try {
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : fallback
    } catch {
        return fallback
    }
}

const scrivi = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
    } catch (e) {
        console.error(`Pianifica uscita: salvataggio ${key} non riuscito`, e)
        return false
    }
}

// --- Interruttore funzione (attiva di default) ---

export const isPianificaAttiva = () => leggi(KEY_ATTIVA, true) !== false

export const setPianificaAttiva = (attiva) => {
    scrivi(KEY_ATTIVA, !!attiva)
    window.dispatchEvent(new CustomEvent(EVENTO_ATTIVA, { detail: !!attiva }))
}

/** Stato dell'interruttore, sincronizzato tra Impostazioni e pagina principale */
export const usePianificaAttiva = () => {
    const [attiva, setAttiva] = useState(isPianificaAttiva)
    useEffect(() => {
        const handler = (e) => setAttiva(!!e.detail)
        window.addEventListener(EVENTO_ATTIVA, handler)
        return () => window.removeEventListener(EVENTO_ATTIVA, handler)
    }, [])
    return [attiva, setPianificaAttiva]
}

// --- Zone e assegnazione spot ---
// { zone: [{ id, nome }], spot: { [nomeSpot]: { zonaId, tipo: 'mare'|'lago'|'fiume' } } }

const CONFIG_VUOTA = { zone: [], spot: {} }

export const caricaConfig = () => {
    const c = leggi(KEY_CONFIG, CONFIG_VUOTA)
    return {
        zone: Array.isArray(c.zone) ? c.zone : [],
        spot: c.spot && typeof c.spot === 'object' ? c.spot : {}
    }
}

export const salvaConfig = (config) => scrivi(KEY_CONFIG, config)

// --- Cache del meteo storico recuperato (per id sessione) ---

export const caricaArchivio = () => {
    const a = leggi(KEY_ARCHIVIO, {})
    return a && typeof a === 'object' ? a : {}
}

export const salvaArchivio = (archivio) => scrivi(KEY_ARCHIVIO, archivio)
