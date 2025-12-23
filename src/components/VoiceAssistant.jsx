/**
 * Voice Assistant Component
 * Handles voice input for adding catches with fuzzy matching
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, MicOff, X, Volume2 } from './Icons'
import { useTranslation } from '../locales/LanguageContext'
import { findBestMatchInPhrase, parseSpokenNumber, isAffirmative, isNegative, isNewCatch } from '../utils/fuzzyMatch'

// States for the voice assistant flow
const STATES = {
    IDLE: 'idle',
    ASKING_SPECIES: 'asking_species',
    ASKING_LENGTH: 'asking_length',
    ASKING_BAIT: 'asking_bait',
    ASKING_CONFIRM: 'asking_confirm',
    WAITING_NEW_CATCH: 'waiting_new_catch',
    ERROR: 'error'
}

const VoiceAssistant = ({
    isOpen,
    onClose,
    specieMemorizzate,
    escheMemorizzate,
    onCatchComplete
}) => {
    const { t, language } = useTranslation()

    // State
    const [state, setState] = useState(STATES.IDLE)
    const [isListening, setIsListening] = useState(false)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [transcript, setTranscript] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const [attempts, setAttempts] = useState(0)
    const [catchData, setCatchData] = useState({
        specie: '',
        lunghezza: '',
        esca: ''
    })

    // Refs
    const recognitionRef = useRef(null)
    const synthRef = useRef(window.speechSynthesis)
    const isProcessingRef = useRef(false)
    const currentStateRef = useRef(state)

    // Keep currentStateRef in sync
    useEffect(() => {
        currentStateRef.current = state
    }, [state])

    // Max attempts before manual input
    const MAX_ATTEMPTS = 3

    /**
     * Get female Italian voice
     */
    const getFemaleVoice = useCallback(() => {
        const voices = synthRef.current.getVoices()

        // Prioritize Italian female voices
        const italianFemale = voices.find(v =>
            v.lang.startsWith('it') &&
            (v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('femmina') ||
                v.name.toLowerCase().includes('alice') ||
                v.name.toLowerCase().includes('elsa') ||
                v.name.toLowerCase().includes('federica') ||
                v.name.includes('Google italiano'))
        )

        if (italianFemale) return italianFemale

        // Fallback to any Italian voice
        const italianVoice = voices.find(v => v.lang.startsWith('it'))
        if (italianVoice) return italianVoice

        // Fallback to default
        return voices[0]
    }, [])

    /**
     * Speak text using speech synthesis
     */
    const speak = useCallback((text) => {
        return new Promise((resolve) => {
            if (!synthRef.current) {
                resolve()
                return
            }

            // Cancel any ongoing speech
            synthRef.current.cancel()

            const utterance = new SpeechSynthesisUtterance(text)
            utterance.voice = getFemaleVoice()
            utterance.lang = 'it-IT'
            utterance.rate = 1.0
            utterance.pitch = 1.1

            utterance.onstart = () => setIsSpeaking(true)
            utterance.onend = () => {
                setIsSpeaking(false)
                resolve()
            }
            utterance.onerror = () => {
                setIsSpeaking(false)
                resolve()
            }

            synthRef.current.speak(utterance)
        })
    }, [getFemaleVoice])

    /**
     * Initialize speech recognition
     */
    const initRecognition = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            setStatusMessage(t('voice.notSupported'))
            return null
        }

        const recognition = new SpeechRecognition()
        recognition.lang = 'it-IT'
        recognition.continuous = false
        recognition.interimResults = false
        recognition.maxAlternatives = 3

        return recognition
    }, [t])

    /**
     * Start listening for voice input
     */
    const startListening = useCallback(() => {
        if (!recognitionRef.current) return

        try {
            setIsListening(true)
            setTranscript('')
            recognitionRef.current.start()
            console.log('startListening: microphone started')
        } catch (error) {
            console.error('Recognition start error:', error)
            setIsListening(false)
        }
    }, [])

    /**
     * Stop listening
     */
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop()
            } catch (e) {
                // Ignore errors when stopping
            }
        }
        setIsListening(false)
    }, [])

    /**
     * Process speech result based on current state
     */
    const processResult = useCallback(async (spokenText) => {
        console.log(`processResult called with: "${spokenText}", isProcessing: ${isProcessingRef.current}`)
        if (isProcessingRef.current) {
            console.log('processResult SKIPPED - already processing')
            return
        }
        isProcessingRef.current = true

        const currentState = currentStateRef.current
        console.log(`processResult processing state: ${currentState}`)

        try {
            switch (currentState) {
                case STATES.ASKING_SPECIES: {
                    const result = findBestMatchInPhrase(spokenText, specieMemorizzate, 0.55)
                    if (result.match) {
                        setCatchData(prev => ({ ...prev, specie: result.match }))
                        setAttempts(0)
                        await speak(`${result.match}. ${t('voice.askLength')}`)
                        setState(STATES.ASKING_LENGTH)
                        startListening()
                    } else {
                        const newAttempts = attempts + 1
                        setAttempts(newAttempts)
                        if (newAttempts >= MAX_ATTEMPTS) {
                            await speak(t('voice.fillManually'))
                            setState(STATES.ERROR)
                        } else {
                            await speak(t('voice.notUnderstood') + ' ' + t('voice.askSpecies'))
                            startListening()
                        }
                    }
                    break
                }

                case STATES.ASKING_LENGTH: {
                    console.log(`ASKING_LENGTH - received: "${spokenText}"`)
                    const length = parseSpokenNumber(spokenText)
                    console.log(`ASKING_LENGTH - parsed length: ${length}`)
                    if (length !== null) {
                        setCatchData(prev => ({ ...prev, lunghezza: length.toString() }))
                        setAttempts(0)
                        await speak(`${length} centimetri. ${t('voice.askBait')}`)
                        setState(STATES.ASKING_BAIT)
                        startListening()
                    } else {
                        const newAttempts = attempts + 1
                        setAttempts(newAttempts)
                        if (newAttempts >= MAX_ATTEMPTS) {
                            await speak(t('voice.fillManually'))
                            setState(STATES.ERROR)
                        } else {
                            await speak(t('voice.notUnderstood') + ' ' + t('voice.askLength'))
                            startListening()
                        }
                    }
                    break
                }

                case STATES.ASKING_BAIT: {
                    const result = findBestMatchInPhrase(spokenText, escheMemorizzate, 0.55)
                    if (result.match) {
                        setCatchData(prev => ({ ...prev, esca: result.match }))
                        setAttempts(0)
                        await speak(`${result.match}. ${t('voice.askConfirm')}`)
                        setState(STATES.ASKING_CONFIRM)
                        startListening()
                    } else {
                        const newAttempts = attempts + 1
                        setAttempts(newAttempts)
                        if (newAttempts >= MAX_ATTEMPTS) {
                            await speak(t('voice.fillManually'))
                            setState(STATES.ERROR)
                        } else {
                            await speak(t('voice.notUnderstood') + ' ' + t('voice.askBait'))
                            startListening()
                        }
                    }
                    break
                }

                case STATES.ASKING_CONFIRM: {
                    if (isAffirmative(spokenText)) {
                        // First speak, then save (to avoid interruption)
                        const catchToSave = { ...catchData }
                        setCatchData({ specie: '', lunghezza: '', esca: '' })
                        setState(STATES.WAITING_NEW_CATCH)

                        console.log('Speaking confirmation message...')
                        await speak(t('voice.catchRegistered') + ' ' + t('voice.sayNewCatch'))
                        console.log('Confirmation message spoken, saving catch...')

                        // Save the catch after speaking
                        onCatchComplete(catchToSave)
                        startListening()
                    } else if (isNegative(spokenText)) {
                        setCatchData({ specie: '', lunghezza: '', esca: '' })
                        setState(STATES.WAITING_NEW_CATCH)
                        await speak(t('voice.cancelled') + ' ' + t('voice.sayNewCatch'))
                        startListening()
                    } else {
                        await speak(t('voice.yesOrNo'))
                        startListening()
                    }
                    break
                }

                case STATES.WAITING_NEW_CATCH: {
                    if (isNewCatch(spokenText)) {
                        setAttempts(0)
                        await speak(t('voice.askSpecies'))
                        setState(STATES.ASKING_SPECIES)
                        startListening()
                    } else {
                        // Keep listening silently
                        startListening()
                    }
                    break
                }

                default:
                    break
            }
        } finally {
            isProcessingRef.current = false
        }
    }, [speak, t, specieMemorizzate, escheMemorizzate, attempts, onCatchComplete, startListening])

    /**
     * Setup recognition event handlers
     */
    useEffect(() => {
        if (!isOpen) return

        const recognition = initRecognition()
        if (!recognition) return

        recognitionRef.current = recognition

        recognition.onresult = (event) => {
            const results = event.results[0]
            const spokenText = results[0].transcript
            console.log(`Speech recognition result: "${spokenText}" (state: ${currentStateRef.current})`)
            setTranscript(spokenText)
            processResult(spokenText)
        }

        recognition.onerror = (event) => {
            console.error('Recognition error:', event.error)
            setIsListening(false)

            if (event.error === 'no-speech') {
                // Restart listening if no speech detected
                if (currentStateRef.current !== STATES.IDLE && currentStateRef.current !== STATES.ERROR) {
                    setTimeout(() => startListening(), 500)
                }
            }
        }

        recognition.onend = () => {
            setIsListening(false)
            console.log(`recognition.onend - state: ${currentStateRef.current}, isProcessing: ${isProcessingRef.current}`)

            // Auto-restart listening if we're in a state that needs it
            if (currentStateRef.current !== STATES.IDLE &&
                currentStateRef.current !== STATES.ERROR &&
                !isProcessingRef.current) {
                console.log('Auto-restarting listening...')
                setTimeout(() => startListening(), 300)
            }
        }

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop()
                } catch (e) {
                    // Ignore
                }
            }
            if (synthRef.current) {
                synthRef.current.cancel()
            }
        }
    }, [isOpen, initRecognition, processResult, startListening])

    /**
     * Load voices when component mounts
     */
    useEffect(() => {
        const loadVoices = () => {
            synthRef.current.getVoices()
        }

        loadVoices()
        if (synthRef.current.onvoiceschanged !== undefined) {
            synthRef.current.onvoiceschanged = loadVoices
        }
    }, [])

    /**
     * Start the assistant when opened
     */
    useEffect(() => {
        if (isOpen && state === STATES.IDLE) {
            const startAssistant = async () => {
                setState(STATES.ASKING_SPECIES)
                setStatusMessage(t('voice.starting'))
                await speak(t('voice.welcome') + ' ' + t('voice.askSpecies'))
                startListening()
            }
            startAssistant()
        }
    }, [isOpen, state, speak, t, startListening])

    /**
     * Reset when closed
     */
    useEffect(() => {
        if (!isOpen) {
            stopListening()
            setState(STATES.IDLE)
            setAttempts(0)
            setCatchData({ specie: '', lunghezza: '', esca: '' })
            setTranscript('')
            setStatusMessage('')
            if (synthRef.current) {
                synthRef.current.cancel()
            }
        }
    }, [isOpen, stopListening])

    /**
     * Update status message based on state
     */
    useEffect(() => {
        const messages = {
            [STATES.ASKING_SPECIES]: t('voice.waitingSpecies'),
            [STATES.ASKING_LENGTH]: t('voice.waitingLength'),
            [STATES.ASKING_BAIT]: t('voice.waitingBait'),
            [STATES.ASKING_CONFIRM]: t('voice.waitingConfirm'),
            [STATES.WAITING_NEW_CATCH]: t('voice.waitingNewCatch'),
            [STATES.ERROR]: t('voice.error')
        }
        if (messages[state]) {
            setStatusMessage(messages[state])
        }
    }, [state, t])

    /**
     * Handle close
     */
    const handleClose = () => {
        stopListening()
        if (synthRef.current) {
            synthRef.current.cancel()
        }
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl border-2 border-cyan-500 w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
                    <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
                        <Volume2 className="w-5 h-5" />
                        {t('voice.title')}
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Microphone indicator */}
                    <div className="flex flex-col items-center">
                        <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isListening
                                ? 'bg-red-500/20 border-4 border-red-500 animate-pulse'
                                : isSpeaking
                                    ? 'bg-cyan-500/20 border-4 border-cyan-500'
                                    : 'bg-gray-700 border-4 border-gray-600'
                            }`}>
                            {isListening ? (
                                <Mic className="w-12 h-12 text-red-500" />
                            ) : isSpeaking ? (
                                <Volume2 className="w-12 h-12 text-cyan-500" />
                            ) : (
                                <MicOff className="w-12 h-12 text-gray-500" />
                            )}
                        </div>

                        <p className="mt-3 text-sm font-medium">
                            {isListening ? (
                                <span className="text-red-400">{t('voice.listening')}</span>
                            ) : isSpeaking ? (
                                <span className="text-cyan-400">{t('voice.speaking')}</span>
                            ) : (
                                <span className="text-gray-500">{t('voice.waiting')}</span>
                            )}
                        </p>
                    </div>

                    {/* Status message */}
                    <div className="text-center">
                        <p className="text-gray-300 text-sm">{statusMessage}</p>
                    </div>

                    {/* Transcript */}
                    {transcript && (
                        <div className="bg-gray-800 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">{t('voice.heard')}:</p>
                            <p className="text-white">"{transcript}"</p>
                        </div>
                    )}

                    {/* Current catch data */}
                    {(catchData.specie || catchData.lunghezza || catchData.esca) && (
                        <div className="bg-gray-800 rounded-lg p-3 space-y-2">
                            <p className="text-xs text-gray-500">{t('voice.currentData')}:</p>
                            {catchData.specie && (
                                <p className="text-sm">
                                    <span className="text-gray-400">{t('catch.species')}:</span>{' '}
                                    <span className="text-cyan-400">{catchData.specie}</span>
                                </p>
                            )}
                            {catchData.lunghezza && (
                                <p className="text-sm">
                                    <span className="text-gray-400">{t('catch.length')}:</span>{' '}
                                    <span className="text-cyan-400">{catchData.lunghezza} cm</span>
                                </p>
                            )}
                            {catchData.esca && (
                                <p className="text-sm">
                                    <span className="text-gray-400">{t('catch.bait')}:</span>{' '}
                                    <span className="text-cyan-400">{catchData.esca}</span>
                                </p>
                            )}
                        </div>
                    )}

                    {/* Attempts indicator */}
                    {attempts > 0 && state !== STATES.WAITING_NEW_CATCH && (
                        <p className="text-center text-yellow-500 text-xs">
                            {t('voice.attempt')} {attempts}/{MAX_ATTEMPTS}
                        </p>
                    )}

                    {/* Error state - manual button */}
                    {state === STATES.ERROR && (
                        <button
                            onClick={handleClose}
                            className="w-full bg-cyan-600 text-white py-3 rounded-lg font-bold"
                        >
                            {t('voice.closeAndFillManually')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default VoiceAssistant
