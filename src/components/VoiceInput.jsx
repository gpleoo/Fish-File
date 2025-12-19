import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, X } from './Icons'
import { useToast } from './Toast'

// Verifica supporto Web Speech API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

const VoiceInput = ({ onResult, specieDisponibili, escheDisponibili }) => {
    const toast = useToast()
    const [isListening, setIsListening] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [isSupported, setIsSupported] = useState(true)
    const recognitionRef = useRef(null)

    // Verifica supporto al mount
    useEffect(() => {
        if (!SpeechRecognition) {
            setIsSupported(false)
        }
    }, [])

    // Parser del testo vocale per estrarre dati cattura
    const parseVoiceInput = useCallback((text) => {
        const textLower = text.toLowerCase()
        const result = {}

        // Cerca specie (match con lista disponibile)
        if (specieDisponibili && specieDisponibili.length > 0) {
            for (const specie of specieDisponibili) {
                if (textLower.includes(specie.toLowerCase())) {
                    result.specie = specie
                    break
                }
            }
        }

        // Cerca peso (pattern: "XXX grammi" o "X chili" o "peso XXX")
        const pesoPatterns = [
            /(\d+(?:[.,]\d+)?)\s*(?:grammi|gr|g\b)/i,
            /(\d+(?:[.,]\d+)?)\s*(?:chili|kg|chilogrammi)/i,
            /peso\s*(?:di\s*)?(\d+(?:[.,]\d+)?)/i,
            /(?:pesa|pesava)\s*(\d+(?:[.,]\d+)?)/i
        ]

        for (const pattern of pesoPatterns) {
            const match = text.match(pattern)
            if (match) {
                let peso = parseFloat(match[1].replace(',', '.'))
                // Se è in chili, converti in grammi
                if (pattern.toString().includes('chili') || pattern.toString().includes('kg')) {
                    peso = peso * 1000
                }
                result.peso = Math.round(peso).toString()
                break
            }
        }

        // Cerca lunghezza (pattern: "XX centimetri" o "XX cm" o "lungo XX")
        const lunghezzaPatterns = [
            /(\d+(?:[.,]\d+)?)\s*(?:centimetri|cm)/i,
            /(?:lungo|lunga|lunghezza)\s*(?:di\s*)?(\d+(?:[.,]\d+)?)/i,
            /(\d+(?:[.,]\d+)?)\s*(?:metri|m\b)/i
        ]

        for (const pattern of lunghezzaPatterns) {
            const match = text.match(pattern)
            if (match) {
                let lunghezza = parseFloat(match[1].replace(',', '.'))
                // Se è in metri, converti in cm
                if (pattern.toString().includes('metri')) {
                    lunghezza = lunghezza * 100
                }
                result.lunghezza = lunghezza.toString()
                break
            }
        }

        // Cerca esca (match con lista disponibile)
        if (escheDisponibili && escheDisponibili.length > 0) {
            for (const esca of escheDisponibili) {
                if (textLower.includes(esca.toLowerCase())) {
                    result.esca = esca
                    break
                }
            }
        }

        // Cerca parole chiave per esca comune non in lista
        const escheComuni = ['verme', 'gambero', 'cozza', 'granchio', 'sardina', 'calamaro', 'seppia', 'bigattino']
        if (!result.esca) {
            for (const esca of escheComuni) {
                if (textLower.includes(esca)) {
                    result.esca = esca.charAt(0).toUpperCase() + esca.slice(1)
                    break
                }
            }
        }

        return result
    }, [specieDisponibili, escheDisponibili])

    // Inizia registrazione vocale
    const startListening = useCallback(() => {
        if (!SpeechRecognition) {
            toast.error('Il tuo browser non supporta il riconoscimento vocale')
            return
        }

        try {
            const recognition = new SpeechRecognition()
            recognitionRef.current = recognition

            recognition.lang = 'it-IT'
            recognition.continuous = false
            recognition.interimResults = true
            recognition.maxAlternatives = 1

            recognition.onstart = () => {
                setIsListening(true)
                setTranscript('')
            }

            recognition.onresult = (event) => {
                let finalTranscript = ''
                let interimTranscript = ''

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript
                    } else {
                        interimTranscript += transcript
                    }
                }

                setTranscript(finalTranscript || interimTranscript)

                // Quando abbiamo il risultato finale, parsa e invia
                if (finalTranscript) {
                    const parsedData = parseVoiceInput(finalTranscript)
                    if (Object.keys(parsedData).length > 0) {
                        onResult(parsedData, finalTranscript)
                        // Mostra cosa è stato riconosciuto
                        const campiRiconosciuti = []
                        if (parsedData.specie) campiRiconosciuti.push(`specie: ${parsedData.specie}`)
                        if (parsedData.peso) campiRiconosciuti.push(`peso: ${parsedData.peso}g`)
                        if (parsedData.lunghezza) campiRiconosciuti.push(`lunghezza: ${parsedData.lunghezza}cm`)
                        if (parsedData.esca) campiRiconosciuti.push(`esca: ${parsedData.esca}`)
                        toast.success(campiRiconosciuti.join(', '), 'Compilato!')
                    } else {
                        toast.warning('Nessun dato riconosciuto. Prova a dire il nome di una specie.')
                    }
                }
            }

            recognition.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                setIsListening(false)

                if (event.error === 'not-allowed') {
                    toast.error('Permesso microfono negato. Abilita il microfono nelle impostazioni del browser.')
                } else if (event.error === 'no-speech') {
                    toast.warning('Nessun audio rilevato. Riprova.')
                } else {
                    toast.error(`Errore riconoscimento: ${event.error}`)
                }
            }

            recognition.onend = () => {
                setIsListening(false)
            }

            recognition.start()
        } catch (error) {
            console.error('Error starting recognition:', error)
            toast.error('Errore avvio riconoscimento vocale')
            setIsListening(false)
        }
    }, [parseVoiceInput, onResult, toast])

    // Ferma registrazione
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            recognitionRef.current.stop()
        }
        setIsListening(false)
    }, [])

    // Se non supportato, non mostrare nulla
    if (!isSupported) {
        return null
    }

    return (
        <div className="mb-3 sm:mb-4">
            {/* Pulsante microfono */}
            <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`w-full py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all ${
                    isListening
                        ? 'bg-red-600 text-white voice-recording'
                        : 'bg-gray-700 text-cyan-400 border-2 border-cyan-500 active:bg-gray-600'
                }`}
                aria-label={isListening ? 'Ferma registrazione' : 'Avvia registrazione vocale'}
            >
                {isListening ? (
                    <>
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>ferma registrazione...</span>
                    </>
                ) : (
                    <>
                        <Mic className="w-5 h-5 sm:w-6 sm:h-6" />
                        <span>registra con voce</span>
                    </>
                )}
            </button>

            {/* Indicatore ascolto */}
            {isListening && (
                <div className="mt-2 sm:mt-3 p-3 sm:p-4 bg-gray-800 rounded-lg border border-cyan-500">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <div className="flex gap-1">
                            <span className="w-1.5 sm:w-2 h-3 sm:h-4 bg-cyan-400 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 sm:w-2 h-5 sm:h-6 bg-cyan-400 rounded animate-pulse" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 sm:w-2 h-4 sm:h-5 bg-cyan-400 rounded animate-pulse" style={{ animationDelay: '300ms' }} />
                            <span className="w-1.5 sm:w-2 h-6 sm:h-7 bg-cyan-400 rounded animate-pulse" style={{ animationDelay: '450ms' }} />
                            <span className="w-1.5 sm:w-2 h-3 sm:h-4 bg-cyan-400 rounded animate-pulse" style={{ animationDelay: '600ms' }} />
                        </div>
                        <span className="text-cyan-400 text-xs sm:text-sm">in ascolto...</span>
                    </div>

                    {transcript && (
                        <p className="text-gray-300 text-xs sm:text-sm italic">"{transcript}"</p>
                    )}

                    <p className="text-gray-500 text-xs mt-2">
                        Esempi: "Orata" oppure "Spigola 40 centimetri con coreano"
                    </p>
                </div>
            )}

            {/* Suggerimento */}
            {!isListening && (
                <p className="text-gray-500 text-xs mt-1.5 sm:mt-2 text-center">
                    Basta dire la specie! Peso, lunghezza ed esca sono opzionali
                </p>
            )}
        </div>
    )
}

export default VoiceInput
