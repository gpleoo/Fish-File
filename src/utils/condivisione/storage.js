/**
 * Condivisione dati - salvataggio locale.
 * Usa solo chiavi proprie, escluse dal backup personale (che salva un
 * elenco fisso di chiavi in backupService.js).
 */

import { useEffect, useState } from 'react'
import { nuovoIdProfilo } from './condivisione.js'

const KEY_CONDIVISI = 'diarioPesca_condivisi'
const KEY_PROFILO = 'diarioPesca_profiloCondivisione'
const EVENTO = 'fishfile:condivisi-aggiornati'

const STATO_VUOTO = { utenti: [] }

export const caricaCondivisi = () => {
    try {
        const raw = localStorage.getItem(KEY_CONDIVISI)
        const stato = raw ? JSON.parse(raw) : STATO_VUOTO
        return Array.isArray(stato?.utenti) ? stato : STATO_VUOTO
    } catch {
        return STATO_VUOTO
    }
}

/** Salva e avvisa le sezioni che mostrano i dati condivisi. Lancia errore se lo spazio e' pieno. */
export const salvaCondivisi = (stato) => {
    localStorage.setItem(KEY_CONDIVISI, JSON.stringify(stato))
    window.dispatchEvent(new CustomEvent(EVENTO))
}

/** Dati ricevuti da altri utenti, aggiornati quando si importa o si elimina */
export const useDatiCondivisi = () => {
    const [stato, setStato] = useState(caricaCondivisi)
    useEffect(() => {
        const handler = () => setStato(caricaCondivisi())
        window.addEventListener(EVENTO, handler)
        return () => window.removeEventListener(EVENTO, handler)
    }, [])
    return stato
}

/** Profilo di chi condivide: id fisso generato alla prima lettura, nome scelto dall'utente */
export const caricaProfilo = () => {
    try {
        const raw = localStorage.getItem(KEY_PROFILO)
        const profilo = raw ? JSON.parse(raw) : null
        if (profilo && profilo.id) return profilo
    } catch {
        // profilo illeggibile: se ne crea uno nuovo
    }
    const nuovo = { id: nuovoIdProfilo(), nome: '' }
    try {
        localStorage.setItem(KEY_PROFILO, JSON.stringify(nuovo))
    } catch {
        // senza salvataggio l'id cambia a ogni avvio: l'import dei propri file non viene bloccato
    }
    return nuovo
}

export const salvaProfilo = (profilo) => {
    try {
        localStorage.setItem(KEY_PROFILO, JSON.stringify(profilo))
    } catch (e) {
        console.error('Condivisione: salvataggio profilo non riuscito', e)
    }
}
