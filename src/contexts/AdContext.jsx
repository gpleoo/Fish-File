/**
 * AdContext - Gestione pubblicità AdMob
 *
 * Strategia:
 * - Banner fisso in basso (sempre visibile)
 * - Interstitial dopo ogni 3 catture
 * - Interstitial alla fine della sessione
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { Capacitor } from '@capacitor/core'
import { AdMob, BannerAdSize, BannerAdPosition, BannerAdPluginEvents, InterstitialAdPluginEvents } from '@capacitor-community/admob'

// Test IDs forniti da Google (sostituire con ID reali in produzione)
const AD_IDS = {
    // Test IDs - funzionano solo in modalità sviluppo
    android: {
        banner: 'ca-app-pub-3940256099942544/6300978111',      // Test banner
        interstitial: 'ca-app-pub-3940256099942544/1033173712', // Test interstitial
        rewarded: 'ca-app-pub-3940256099942544/5224354917'      // Test rewarded
    },
    ios: {
        banner: 'ca-app-pub-3940256099942544/2934735716',      // Test banner
        interstitial: 'ca-app-pub-3940256099942544/4411468910', // Test interstitial
        rewarded: 'ca-app-pub-3940256099942544/1712485313'      // Test rewarded
    }
}

// Configurazione
const CONFIG = {
    catchesBeforeInterstitial: 3,  // Mostra interstitial ogni N catture
    showBanner: true,
    showInterstitials: true,
    testMode: true  // Impostare a false in produzione
}

const AdContext = createContext(null)

export const useAds = () => {
    const context = useContext(AdContext)
    if (!context) {
        // Return a mock if not in AdProvider (for web/dev)
        return {
            isInitialized: false,
            showBanner: () => {},
            hideBanner: () => {},
            showInterstitial: () => Promise.resolve(),
            trackCatch: () => {},
            showSessionEndAd: () => Promise.resolve(),
            bannerVisible: false,
            isNative: false
        }
    }
    return context
}

export const AdProvider = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false)
    const [bannerVisible, setBannerVisible] = useState(false)
    const [interstitialLoaded, setInterstitialLoaded] = useState(false)
    const catchCountRef = useRef(0)
    const isNative = Capacitor.isNativePlatform()

    // Get platform-specific ad IDs
    const getAdId = useCallback((type) => {
        const platform = Capacitor.getPlatform()
        if (platform === 'android') {
            return AD_IDS.android[type]
        } else if (platform === 'ios') {
            return AD_IDS.ios[type]
        }
        return null
    }, [])

    // Initialize AdMob
    useEffect(() => {
        const initializeAdMob = async () => {
            if (!isNative) {
                console.log('AdMob: Non in ambiente nativo, skip inizializzazione')
                return
            }

            try {
                await AdMob.initialize({
                    requestTrackingAuthorization: true,
                    testingDevices: CONFIG.testMode ? ['EMULATOR'] : [],
                    initializeForTesting: CONFIG.testMode
                })

                // Setup event listeners
                AdMob.addListener(BannerAdPluginEvents.Loaded, () => {
                    console.log('Banner caricato')
                })

                AdMob.addListener(BannerAdPluginEvents.FailedToLoad, (error) => {
                    console.warn('Banner fallito:', error)
                })

                AdMob.addListener(InterstitialAdPluginEvents.Loaded, () => {
                    console.log('Interstitial caricato')
                    setInterstitialLoaded(true)
                })

                AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
                    console.log('Interstitial chiuso')
                    setInterstitialLoaded(false)
                    // Precarica il prossimo
                    prepareInterstitial()
                })

                AdMob.addListener(InterstitialAdPluginEvents.FailedToLoad, (error) => {
                    console.warn('Interstitial fallito:', error)
                    setInterstitialLoaded(false)
                })

                setIsInitialized(true)
                console.log('AdMob inizializzato con successo')

                // Precarica interstitial
                await prepareInterstitial()

            } catch (error) {
                console.error('Errore inizializzazione AdMob:', error)
            }
        }

        initializeAdMob()

        return () => {
            // Cleanup listeners
            if (isNative) {
                AdMob.removeAllListeners()
            }
        }
    }, [isNative])

    // Prepare interstitial ad
    const prepareInterstitial = async () => {
        if (!isNative || !CONFIG.showInterstitials) return

        try {
            const adId = getAdId('interstitial')
            if (adId) {
                await AdMob.prepareInterstitial({
                    adId,
                    isTesting: CONFIG.testMode
                })
            }
        } catch (error) {
            console.warn('Errore preparazione interstitial:', error)
        }
    }

    // Show banner ad
    const showBanner = useCallback(async () => {
        if (!isNative || !CONFIG.showBanner || bannerVisible) return

        try {
            const adId = getAdId('banner')
            if (adId) {
                await AdMob.showBanner({
                    adId,
                    adSize: BannerAdSize.ADAPTIVE_BANNER,
                    position: BannerAdPosition.BOTTOM_CENTER,
                    margin: 0,
                    isTesting: CONFIG.testMode
                })
                setBannerVisible(true)
            }
        } catch (error) {
            console.error('Errore mostra banner:', error)
        }
    }, [isNative, bannerVisible, getAdId])

    // Hide banner ad
    const hideBanner = useCallback(async () => {
        if (!isNative || !bannerVisible) return

        try {
            await AdMob.hideBanner()
            setBannerVisible(false)
        } catch (error) {
            console.error('Errore nascondi banner:', error)
        }
    }, [isNative, bannerVisible])

    // Show interstitial ad
    const showInterstitial = useCallback(async () => {
        if (!isNative || !CONFIG.showInterstitials || !interstitialLoaded) {
            return false
        }

        try {
            await AdMob.showInterstitial()
            return true
        } catch (error) {
            console.error('Errore mostra interstitial:', error)
            return false
        }
    }, [isNative, interstitialLoaded])

    // Track catch and show ad if needed
    const trackCatch = useCallback(async () => {
        catchCountRef.current += 1
        console.log(`Catture: ${catchCountRef.current}/${CONFIG.catchesBeforeInterstitial}`)

        if (catchCountRef.current >= CONFIG.catchesBeforeInterstitial) {
            catchCountRef.current = 0
            await showInterstitial()
        }
    }, [showInterstitial])

    // Show ad at session end
    const showSessionEndAd = useCallback(async () => {
        // Reset catch counter
        catchCountRef.current = 0
        await showInterstitial()
    }, [showInterstitial])

    const value = {
        isInitialized,
        showBanner,
        hideBanner,
        showInterstitial,
        trackCatch,
        showSessionEndAd,
        bannerVisible,
        isNative
    }

    return (
        <AdContext.Provider value={value}>
            {children}
        </AdContext.Provider>
    )
}

export default AdContext
