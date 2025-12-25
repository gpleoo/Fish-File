/**
 * BannerAdPlaceholder - Placeholder visivo per il banner pubblicitario
 *
 * Mostra uno spazio riservato per il banner AdMob.
 * In ambiente nativo, il banner viene gestito nativamente.
 * In ambiente web, mostra un placeholder per mantenere il layout coerente.
 */

import React from 'react'
import { useAds } from '../contexts/AdContext'

const BannerAdPlaceholder = () => {
    const { isNative, bannerVisible } = useAds()

    // In ambiente nativo, il banner è gestito nativamente
    // Aggiungiamo solo padding per non coprire il contenuto
    if (isNative && bannerVisible) {
        return <div className="h-14 sm:h-16" /> // Spazio per il banner nativo
    }

    // In ambiente web (dev), mostra un placeholder visivo
    if (!isNative) {
        return (
            <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 text-center z-40">
                <div className="bg-gray-700 rounded px-4 py-2 inline-flex items-center gap-2">
                    <span className="text-gray-400 text-xs">Ad Banner Placeholder</span>
                    <span className="text-gray-500 text-xs">(AdMob in app nativa)</span>
                </div>
            </div>
        )
    }

    return null
}

export default BannerAdPlaceholder
