import React, { useRef, useState } from 'react'
import { ChevronDown, ChevronUp, Download, Upload, Trash2, Users } from '../Icons'
import { useToast } from '../Toast'
import { useTranslation } from '../../locales/LanguageContext'
import {
    creaFileCondivisione, leggiFileCondivisione, integraDatiRicevuti, rimuoviUtente, nomeFileCondivisione, ErroreCondivisione
} from '../../utils/condivisione/condivisione'
import { caricaCondivisi, salvaCondivisi, useDatiCondivisi, caricaProfilo, salvaProfilo } from '../../utils/condivisione/storage'
import TriangoloCondiviso from './TriangoloCondiviso'

const leggiProprie = (key) => {
    try {
        const v = JSON.parse(localStorage.getItem(key) || '[]')
        return Array.isArray(v) ? v : []
    } catch {
        return []
    }
}

const scaricaJson = (oggetto, nomeFile) => {
    const blob = new Blob([JSON.stringify(oggetto)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = nomeFile
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}

/**
 * Impostazioni > Condivisione dati: invio dei propri dati ad altri utenti,
 * importazione dei loro (separata dai propri) e gestione delle persone.
 */
const CondivisioneDati = () => {
    const { t } = useTranslation()
    const toast = useToast()
    const condivisi = useDatiCondivisi()
    const [aperta, setAperta] = useState(false)
    const [profilo, setProfilo] = useState(caricaProfilo)
    const fileRef = useRef(null)

    const aggiornaNome = (nome) => {
        const nuovo = { ...profilo, nome }
        setProfilo(nuovo)
        salvaProfilo(nuovo)
    }

    const condividi = () => {
        const nome = profilo.nome.trim()
        if (!nome) {
            toast.warning(t('sharing.nameRequired'))
            return
        }
        const sessioni = leggiProprie('diarioPesca_sessioniCompletate')
        const catture = leggiProprie('diarioPesca_catture')
        if (sessioni.length === 0) {
            toast.warning(t('sharing.nothingToShare'))
            return
        }
        scaricaJson(creaFileCondivisione({ profilo: { ...profilo, nome }, sessioni, catture }), nomeFileCondivisione(nome))
        toast.success(t('sharing.exported', { sessions: sessioni.length, catches: catture.length }))
    }

    const importa = async (e) => {
        const file = e.target.files && e.target.files[0]
        e.target.value = ''
        if (!file) return
        try {
            const ricevuti = leggiFileCondivisione(await file.text(), { mioId: profilo.id })
            const { stato, sostituito, utente } = integraDatiRicevuti(caricaCondivisi(), ricevuti)
            try {
                salvaCondivisi(stato)
            } catch {
                toast.error(t('sharing.errors.storage'))
                return
            }
            toast.success(t(sostituito ? 'sharing.updated' : 'sharing.imported', {
                name: utente.nome, sessions: utente.sessioni.length, catches: utente.catture.length
            }))
        } catch (err) {
            const codice = err instanceof ErroreCondivisione ? err.codice : 'formato'
            toast.error(t(`sharing.errors.${codice}`))
        }
    }

    const elimina = (utente) => {
        if (!window.confirm(t('sharing.confirmDelete', { name: utente.nome }))) return
        try {
            salvaCondivisi(rimuoviUtente(caricaCondivisi(), utente.id))
            toast.success(t('sharing.deleted', { name: utente.nome }))
        } catch {
            toast.error(t('sharing.errors.storage'))
        }
    }

    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <button onClick={() => setAperta(!aperta)} className="w-full flex items-center justify-between">
                <h3 className="text-cyan-400 font-semibold text-sm flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {t('sharing.title')}
                </h3>
                {aperta ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
            </button>

            {aperta && (
                <div className="mt-4 space-y-4">
                    <p className="text-gray-400 text-xs">{t('sharing.description')}</p>

                    <div className="bg-gray-900 rounded-lg p-3 space-y-2">
                        <label className="block text-gray-300 text-xs">
                            {t('sharing.yourName')}
                            <input
                                value={profilo.nome}
                                onChange={(e) => aggiornaNome(e.target.value)}
                                placeholder={t('sharing.namePlaceholder')}
                                maxLength={40}
                                className="mt-1 w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-cyan-500 focus:outline-none"
                            />
                        </label>
                        <button onClick={condividi} className="w-full bg-cyan-600 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:bg-cyan-700">
                            <Download className="w-4 h-4" />
                            {t('sharing.export')}
                        </button>
                        <p className="text-gray-500 text-xs">{t('sharing.exportHelp')}</p>
                    </div>

                    <div className="bg-gray-900 rounded-lg p-3 space-y-2">
                        <button onClick={() => fileRef.current && fileRef.current.click()} className="w-full bg-amber-600 text-white py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 active:bg-amber-700">
                            <Upload className="w-4 h-4" />
                            {t('sharing.import')}
                        </button>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".json,.txt,application/json,text/plain"
                            onChange={importa}
                            className="hidden"
                        />
                        <p className="text-gray-500 text-xs">{t('sharing.importHelp')}</p>
                    </div>

                    <div>
                        <h4 className="text-gray-300 text-xs font-semibold mb-2">{t('sharing.receivedTitle')}</h4>
                        {condivisi.utenti.length === 0 ? (
                            <p className="text-gray-500 text-xs">{t('sharing.noneReceived')}</p>
                        ) : (
                            <ul className="space-y-2">
                                {condivisi.utenti.map(u => (
                                    <li key={u.id} className="flex items-center justify-between bg-gray-900 rounded-lg p-3">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <TriangoloCondiviso variante={u.variante} colore="#9ca3af" size={16} />
                                            <div className="min-w-0">
                                                <p className="text-white text-sm truncate">{u.nome}</p>
                                                <p className="text-gray-500 text-xs">
                                                    {t('sharing.counts', { sessions: u.sessioni.length, catches: u.catture.length })}
                                                    {' - '}{(u.importatoIl || '').slice(0, 10)}
                                                </p>
                                            </div>
                                        </div>
                                        <button onClick={() => elimina(u)} className="text-red-400 p-2" aria-label={t('common.delete')}>
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default CondivisioneDati
