import React, { useEffect, useRef, useMemo } from 'react'
import L from 'leaflet'

// Fix per icone Leaflet in React/Vite
const createCustomIcon = (color = '#06b6d4') => {
    return L.divIcon({
        className: 'custom-marker',
        html: `
            <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.164 0 0 7.164 0 16c0 10 16 24 16 24s16-14 16-24c0-8.836-7.164-16-16-16z" fill="${color}"/>
                <circle cx="16" cy="16" r="6" fill="white"/>
            </svg>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 40],
        popupAnchor: [0, -40]
    })
}

// Colori per diverse specie
const coloriSpecie = {
    'Spigola': '#3b82f6',      // blue
    'Orata': '#f59e0b',        // amber
    'Sarago': '#8b5cf6',       // violet
    'Cefalo': '#6b7280',       // gray
    'Ombrina': '#ec4899',      // pink
    'Leccia stella': '#14b8a6', // teal
    'default': '#06b6d4'       // cyan
}

const getColorForSpecie = (specie) => {
    return coloriSpecie[specie] || coloriSpecie['default']
}

const MapCatture = ({ catture, filtri }) => {
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markersLayerRef = useRef(null)

    // Filtra catture con coordinate valide
    const cattureConCoordinate = useMemo(() => {
        return catture.filter(c => {
            // Deve avere coordinate valide
            const lat = parseFloat(c.latitudine)
            const lng = parseFloat(c.longitudine)
            if (isNaN(lat) || isNaN(lng)) return false
            if (lat < 35 || lat > 47 || lng < 6 || lng > 19) return false

            // Applica filtri
            if (filtri) {
                if (filtri.anno !== 'tutti' && c.data && !c.data.startsWith(filtri.anno)) return false
                if (filtri.mese !== 'tutti' && c.data) {
                    const mese = c.data.split('-')[1]
                    if (mese !== filtri.mese) return false
                }
                if (filtri.specie !== 'tutte' && c.specie !== filtri.specie) return false
                if (filtri.localita !== 'tutte' && c.localita !== filtri.localita) return false
                if (filtri.direzioneVento !== 'tutte' && c.meteo?.direzioneVento !== filtri.direzioneVento) return false
                if (filtri.condizioni !== 'tutte' && c.meteo?.condizioni !== filtri.condizioni) return false
                if (filtri.faseLunare !== 'tutte' && c.meteo?.faseLunare !== filtri.faseLunare) return false
            }

            return true
        })
    }, [catture, filtri])

    // Inizializza mappa
    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return

        // Centro Italia di default
        const defaultCenter = [42.5, 12.5]
        const defaultZoom = 6

        mapInstanceRef.current = L.map(mapRef.current, {
            center: defaultCenter,
            zoom: defaultZoom,
            zoomControl: true,
            attributionControl: true
        })

        // Layer OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(mapInstanceRef.current)

        // Layer per i marker
        markersLayerRef.current = L.layerGroup().addTo(mapInstanceRef.current)

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }
        }
    }, [])

    // Aggiorna marker quando cambiano le catture filtrate
    useEffect(() => {
        if (!mapInstanceRef.current || !markersLayerRef.current) return

        // Rimuovi marker esistenti
        markersLayerRef.current.clearLayers()

        if (cattureConCoordinate.length === 0) return

        // Aggiungi nuovi marker
        const bounds = []

        cattureConCoordinate.forEach(cattura => {
            const lat = parseFloat(cattura.latitudine)
            const lng = parseFloat(cattura.longitudine)
            const color = getColorForSpecie(cattura.specie)
            const icon = createCustomIcon(color)

            const marker = L.marker([lat, lng], { icon })

            // Crea contenuto popup
            const popupContent = `
                <div style="min-width: 180px; font-family: system-ui, sans-serif;">
                    <div style="font-weight: bold; font-size: 16px; color: ${color}; margin-bottom: 8px;">
                        🐟 ${cattura.specie || 'Specie sconosciuta'}
                    </div>
                    <div style="font-size: 13px; color: #374151; line-height: 1.6;">
                        ${cattura.peso ? `<div><strong>Peso:</strong> ${cattura.peso}g</div>` : ''}
                        ${cattura.lunghezza ? `<div><strong>Lunghezza:</strong> ${cattura.lunghezza}cm</div>` : ''}
                        ${cattura.esca ? `<div><strong>Esca:</strong> ${cattura.esca}</div>` : ''}
                        ${cattura.localita ? `<div><strong>Località:</strong> ${cattura.localita}</div>` : ''}
                        <div style="margin-top: 6px; color: #6b7280; font-size: 12px;">
                            📅 ${cattura.data || 'N/D'} ${cattura.ora ? `alle ${cattura.ora}` : ''}
                        </div>
                    </div>
                </div>
            `

            marker.bindPopup(popupContent, {
                maxWidth: 250,
                className: 'custom-popup'
            })

            marker.addTo(markersLayerRef.current)
            bounds.push([lat, lng])
        })

        // Centra la mappa sui marker
        if (bounds.length > 0) {
            if (bounds.length === 1) {
                mapInstanceRef.current.setView(bounds[0], 12)
            } else {
                mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] })
            }
        }
    }, [cattureConCoordinate])

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-cyan-400 font-bold">📍 mappa catture</h4>
                <span className="text-gray-400 text-sm">
                    {cattureConCoordinate.length} {cattureConCoordinate.length === 1 ? 'cattura' : 'catture'}
                </span>
            </div>

            {cattureConCoordinate.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                    <p>Nessuna cattura con coordinate GPS</p>
                    <p className="text-sm mt-2">Avvia una sessione di pesca per registrare la posizione</p>
                </div>
            ) : (
                <div
                    ref={mapRef}
                    className="rounded-lg overflow-hidden"
                    style={{ height: '350px', width: '100%' }}
                />
            )}

            {/* Legenda specie */}
            {cattureConCoordinate.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(
                        cattureConCoordinate.reduce((acc, c) => {
                            if (c.specie) acc[c.specie] = (acc[c.specie] || 0) + 1
                            return acc
                        }, {})
                    ).map(([specie, count]) => (
                        <span
                            key={specie}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs"
                            style={{
                                backgroundColor: `${getColorForSpecie(specie)}20`,
                                color: getColorForSpecie(specie)
                            }}
                        >
                            <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: getColorForSpecie(specie) }}
                            />
                            {specie} ({count})
                        </span>
                    ))}
                </div>
            )}
        </div>
    )
}

export default MapCatture
