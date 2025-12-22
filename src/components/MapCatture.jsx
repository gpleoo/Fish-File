import React, { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'
import { useTranslation } from '../locales/LanguageContext'

// Colori in base al numero di catture
const getColorByCount = (count) => {
    if (count === 0) return '#ef4444'      // rosso
    if (count <= 4) return '#ec4899'       // magenta/pink
    if (count <= 8) return '#22c55e'       // verde
    return '#3b82f6'                        // blu
}

// Crea icona marker con numero catture
const createMarkerIcon = (count, color) => {
    const size = count === 0 ? 36 : Math.min(36 + count * 2, 50)

    return L.divIcon({
        className: 'custom-marker-session',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                border: 3px solid white;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                font-size: ${count > 99 ? '11px' : '14px'};
                color: white;
                box-shadow: 0 4px 12px rgba(0,0,0,0.4);
                font-family: system-ui, sans-serif;
            ">
                ${count}
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2]
    })
}

// Calcola offset per marker vicini
const calculateOffset = (index, total) => {
    if (total <= 1) return { lat: 0, lng: 0 }

    // Disposizione a cerchio per marker sovrapposti
    const angle = (2 * Math.PI * index) / total
    const radius = 0.0008 * Math.ceil(total / 6) // ~80m per livello

    return {
        lat: Math.cos(angle) * radius,
        lng: Math.sin(angle) * radius
    }
}

const MapCatture = ({ sessioni, catture, filtri }) => {
    const { t } = useTranslation()
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersLayerRef = useRef(null)

    // Raggruppa sessioni per posizione e calcola catture
    const sessioniConDati = useMemo(() => {
        if (!sessioni || sessioni.length === 0) return []

        // Filtra sessioni con coordinate valide
        const sessioniValide = sessioni.filter(s => {
            const lat = parseFloat(s.latitudine)
            const lng = parseFloat(s.longitudine)
            return !isNaN(lat) && !isNaN(lng) && lat >= 35 && lat <= 47 && lng >= 6 && lng <= 19
        })

        // Calcola catture per ogni sessione
        const sessioniConCatture = sessioniValide.map(sessione => {
            const cattureSessione = catture.filter(c => c.sessioneId === sessione.id)

            // Applica TUTTI i filtri alle catture
            const cattureFiltrate = cattureSessione.filter(c => {
                if (!filtri) return true

                // Filtro anno
                if (filtri.anno !== 'tutti' && c.data && !c.data.startsWith(filtri.anno)) return false

                // Filtro mese
                if (filtri.mese !== 'tutti' && c.data) {
                    const mese = c.data.split('-')[1]
                    if (mese !== filtri.mese) return false
                }

                // Filtro specie
                if (filtri.specie !== 'tutte' && c.specie !== filtri.specie) return false

                // Filtro località
                if (filtri.localita !== 'tutte' && c.localita !== filtri.localita) return false

                // Filtro direzione vento
                if (filtri.direzioneVento !== 'tutte' && c.meteo?.direzioneVento !== filtri.direzioneVento) return false

                // Filtro condizioni meteo
                if (filtri.condizioni !== 'tutte' && c.meteo?.condizioni !== filtri.condizioni) return false

                // Filtro fase lunare
                if (filtri.faseLunare !== 'tutte' && c.meteo?.faseLunare !== filtri.faseLunare) return false

                return true
            })

            return {
                ...sessione,
                numeroCatture: cattureFiltrate.length,
                catture: cattureFiltrate,
                specieUniche: [...new Set(cattureFiltrate.map(c => c.specie).filter(Boolean))]
            }
        })

        // Filtra: mostra solo sessioni con almeno 1 cattura che matcha i filtri
        // Se non ci sono filtri attivi, mostra tutte le sessioni
        const hasFiltriAttivi = filtri && Object.entries(filtri).some(([key, val]) =>
            val !== 'tutti' && val !== 'tutte'
        )

        if (hasFiltriAttivi) {
            return sessioniConCatture.filter(s => s.numeroCatture > 0)
        }

        return sessioniConCatture
    }, [sessioni, catture, filtri])

    // Raggruppa marker vicini per applicare offset
    const sessioniConOffset = useMemo(() => {
        if (sessioniConDati.length === 0) return []

        // Raggruppa per posizione approssimata (entro ~100m)
        const gruppi = {}
        const precision = 3 // ~100m

        sessioniConDati.forEach(sessione => {
            const lat = parseFloat(sessione.latitudine).toFixed(precision)
            const lng = parseFloat(sessione.longitudine).toFixed(precision)
            const key = `${lat},${lng}`

            if (!gruppi[key]) gruppi[key] = []
            gruppi[key].push(sessione)
        })

        // Applica offset ai marker nello stesso gruppo
        const risultato = []
        Object.values(gruppi).forEach(gruppo => {
            gruppo.forEach((sessione, index) => {
                const offset = calculateOffset(index, gruppo.length)
                risultato.push({
                    ...sessione,
                    latOffset: parseFloat(sessione.latitudine) + offset.lat,
                    lngOffset: parseFloat(sessione.longitudine) + offset.lng
                })
            })
        })

        return risultato
    }, [sessioniConDati])

    // Inizializza mappa
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return

        const defaultCenter = [42.5, 12.5]
        const defaultZoom = 6

        mapInstanceRef.current = L.map(mapRef.current, {
            center: defaultCenter,
            zoom: defaultZoom,
            zoomControl: true,
            attributionControl: true
        })

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(mapInstanceRef.current)

        markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    // Aggiorna marker
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return

        markersLayerRef.current.clearLayers()

        if (sessioniConOffset.length === 0) return

        const bounds = []

        sessioniConOffset.forEach(sessione => {
            const lat = sessione.latOffset
            const lng = sessione.lngOffset
            const count = sessione.numeroCatture
            const color = getColorByCount(count)
            const icon = createMarkerIcon(count, color)

            const marker = L.marker([lat, lng], { icon })

            // Crea popup con dettagli sessione
            const specieList = sessione.specieUniche.length > 0
                ? sessione.specieUniche.slice(0, 5).join(', ') + (sessione.specieUniche.length > 5 ? '...' : '')
                : t('map.noCatches')

            const popupContent = `
                <div style="min-width: 200px; font-family: system-ui, sans-serif;">
                    <div style="font-weight: bold; font-size: 16px; color: ${color}; margin-bottom: 8px;">
                        ${sessione.localita || t('map.unknownLocation')}
                    </div>
                    <div style="font-size: 13px; color: #e5e7eb; line-height: 1.8;">
                        <div><strong>${t('map.catches')}:</strong> ${count}</div>
                        <div><strong>${t('catch.date')}:</strong> ${sessione.dataInizio || 'N/D'}</div>
                        <div><strong>${t('sessions.time')}:</strong> ${sessione.oraInizio || 'N/D'} - ${sessione.oraFine || 'N/D'}</div>
                        ${sessione.specieUniche.length > 0 ? `<div><strong>${t('catch.species')}:</strong> ${specieList}</div>` : ''}
                    </div>
                </div>
            `

            marker.bindPopup(popupContent, {
                maxWidth: 280,
                className: 'custom-popup'
            })

            marker.addTo(markersLayerRef.current)
            bounds.push([lat, lng])
        })

        // Centra mappa
        if (bounds.length > 0) {
            if (bounds.length === 1) {
                mapInstanceRef.current.setView(bounds[0], 12)
            } else {
                mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
            }
        }
    }, [sessioniConOffset, t])

    // Statistiche totali
    const totali = useMemo(() => {
        const totaleCatture = sessioniConOffset.reduce((sum, s) => sum + s.numeroCatture, 0)
        return {
            sessioni: sessioniConOffset.length,
            catture: totaleCatture
        }
    }, [sessioniConOffset])

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0 mb-2 sm:mb-3">
                <h4 className="text-cyan-400 font-bold text-sm sm:text-base">{t('map.title')}</h4>
                <span className="text-gray-400 text-xs sm:text-sm">
                    {totali.sessioni} {t('sessions.title')} - {totali.catture} {t('map.catches')}
                </span>
            </div>

            {sessioniConOffset.length === 0 ? (
                <div className="text-gray-500 text-center py-6 sm:py-8">
                    <p className="text-sm sm:text-base">{t('map.noSessions')}</p>
                    <p className="text-xs sm:text-sm mt-2">{t('map.completeSession')}</p>
                </div>
            ) : (
                <div
                    ref={mapRef}
                    className="rounded-lg overflow-hidden map-container"
                />
            )}

            {/* Legenda colori - responsive */}
            {sessioniConOffset.length > 0 && (
                <div className="mt-2 sm:mt-3 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 justify-center">
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" /> 0 {t('map.catches')}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-pink-500 flex-shrink-0" /> 1-4
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-green-500 flex-shrink-0" /> 5-8
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                        <span className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" /> 9+
                    </span>
                </div>
            )}
        </div>
    )
}

export default MapCatture
