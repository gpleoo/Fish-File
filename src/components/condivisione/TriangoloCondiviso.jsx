import React from 'react'

/**
 * Icona a triangolo per i dati ricevuti da altri utenti.
 * Varianti 0-3: punta in su, giu', a destra, a sinistra; 4-7: le stesse con doppio bordo.
 */

const ROTAZIONI = [0, 180, 90, 270]
// Baricentro del triangolo (50,58) ruotato attorno al centro (50,50)
const CENTRO_TESTO = { 0: [50, 62], 180: [50, 46], 90: [43, 54], 270: [57, 54] }

/** SVG come stringa: usata anche dai marker Leaflet (solo numeri e colori interni) */
export const svgTriangolo = ({ variante = 0, colore, testo = '', size = 36 }) => {
    const v = ((Number(variante) % 8) + 8) % 8
    const rot = ROTAZIONI[v % 4]
    const doppio = v >= 4
    const [tx, ty] = CENTRO_TESTO[rot]
    const punti = '50,6 95,84 5,84'
    const testoSicuro = String(testo).replace(/[^0-9+]/g, '')
    const fontSize = testoSicuro.length > 2 ? 22 : 28
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100" style="overflow:visible;filter:drop-shadow(0 3px 6px rgba(0,0,0,.45))">`
        + `<polygon points="${punti}" transform="rotate(${rot} 50 50)" fill="${colore}" stroke="white" stroke-width="${doppio ? 9 : 6}" stroke-linejoin="round"/>`
        + (doppio ? `<polygon points="${punti}" transform="rotate(${rot} 50 50)" fill="none" stroke="#111827" stroke-width="3" stroke-linejoin="round"/>` : '')
        + (testoSicuro ? `<text x="${tx}" y="${ty}" text-anchor="middle" dominant-baseline="middle" font-family="system-ui,sans-serif" font-weight="bold" font-size="${fontSize}" fill="white">${testoSicuro}</text>` : '')
        + '</svg>'
}

const TriangoloCondiviso = ({ variante, colore, size = 14, className = '' }) => (
    <span
        className={`inline-flex flex-shrink-0 ${className}`}
        style={{ width: size, height: size }}
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svgTriangolo({ variante, colore, size }) }}
    />
)

export default TriangoloCondiviso
