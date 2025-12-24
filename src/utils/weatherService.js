/**
 * Weather Service - Open-Meteo API
 * API gratuita, nessuna chiave richiesta
 * https://open-meteo.com/
 */

// Mappa codici meteo Open-Meteo -> condizioni (match con dropdown MeteoForm)
// Dropdown options: 'sereno', 'nuvoloso', 'coperto', 'pioggia', 'temporale', 'nebbia'
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WEATHER_CODES = {
    0: 'sereno',           // Clear sky
    1: 'sereno',           // Mainly clear -> sereno
    2: 'nuvoloso',         // Partly cloudy -> nuvoloso
    3: 'coperto',          // Overcast -> coperto
    45: 'nebbia',          // Fog
    48: 'nebbia',          // Depositing rime fog -> nebbia
    51: 'pioggia',         // Light drizzle -> pioggia
    53: 'pioggia',         // Moderate drizzle
    55: 'pioggia',         // Dense drizzle
    56: 'pioggia',         // Light freezing drizzle
    57: 'pioggia',         // Dense freezing drizzle
    61: 'pioggia',         // Slight rain
    63: 'pioggia',         // Moderate rain
    65: 'pioggia',         // Heavy rain
    66: 'pioggia',         // Light freezing rain
    67: 'pioggia',         // Heavy freezing rain
    71: 'pioggia',         // Slight snow -> pioggia (no snow option)
    73: 'pioggia',         // Moderate snow
    75: 'pioggia',         // Heavy snow
    77: 'pioggia',         // Snow grains
    80: 'pioggia',         // Slight rain showers
    81: 'pioggia',         // Moderate rain showers
    82: 'pioggia',         // Violent rain showers
    85: 'pioggia',         // Slight snow showers
    86: 'pioggia',         // Heavy snow showers
    95: 'temporale',       // Thunderstorm
    96: 'temporale',       // Thunderstorm with slight hail
    99: 'temporale'        // Thunderstorm with heavy hail
}

// Converti gradi in direzione cardinale (formato completo per dropdown)
const degreesToDirection = (degrees) => {
    if (degrees === null || degrees === undefined) return null

    // Mappa gradi -> direzione completa (16 direzioni per maggiore precisione)
    const directions = [
        { min: 348.75, max: 360, dir: 'N (Tramontana - 4°/1° Quadrante - 0°)' },
        { min: 0, max: 11.25, dir: 'N (Tramontana - 4°/1° Quadrante - 0°)' },
        { min: 11.25, max: 33.75, dir: 'NNE (Tramontana-Grecale - 1° Quadrante - 22,5°)' },
        { min: 33.75, max: 56.25, dir: 'NE (Grecale - 1° Quadrante - 45°)' },
        { min: 56.25, max: 78.75, dir: 'ENE (Grecale-Levante - 1° Quadrante - 67,5°)' },
        { min: 78.75, max: 101.25, dir: 'E (Levante - 1°/2° Quadrante - 90°)' },
        { min: 101.25, max: 123.75, dir: 'ESE (Levante-Scirocco - 2° Quadrante - 112,5°)' },
        { min: 123.75, max: 146.25, dir: 'SE (Scirocco - 2° Quadrante - 135°)' },
        { min: 146.25, max: 168.75, dir: 'SSE (Scirocco-Ostro - 2° Quadrante - 157,5°)' },
        { min: 168.75, max: 191.25, dir: 'S (Ostro - 2°/3° Quadrante - 180°)' },
        { min: 191.25, max: 213.75, dir: 'SSW (Ostro-Libeccio - 3° Quadrante - 202,5°)' },
        { min: 213.75, max: 236.25, dir: 'SW (Libeccio - 3° Quadrante - 225°)' },
        { min: 236.25, max: 258.75, dir: 'WSW (Libeccio-Ponente - 3° Quadrante - 247,5°)' },
        { min: 258.75, max: 281.25, dir: 'W (Ponente - 3°/4° Quadrante - 270°)' },
        { min: 281.25, max: 303.75, dir: 'WNW (Ponente-Maestrale - 4° Quadrante - 292,5°)' },
        { min: 303.75, max: 326.25, dir: 'NW (Maestrale - 4° Quadrante - 315°)' },
        { min: 326.25, max: 348.75, dir: 'NNW (Maestrale-Tramontana - 4° Quadrante - 337,5°)' }
    ]

    // Normalizza gradi (0-360)
    const normalized = ((degrees % 360) + 360) % 360

    // Trova la direzione corrispondente
    for (const d of directions) {
        if (normalized >= d.min && normalized < d.max) {
            return d.dir
        }
    }

    return directions[0].dir // Default N
}

// Calcola fase lunare approssimativa (match con opzioni dropdown)
const calcolaFaseLunare = () => {
    const oggi = new Date()
    // Luna nuova di riferimento: 6 gennaio 2000
    const lunaRiferimento = new Date(2000, 0, 6)
    const giorni = Math.floor((oggi - lunaRiferimento) / (1000 * 60 * 60 * 24))
    const ciclo = giorni % 29.53

    // Fasi che matchano le opzioni del dropdown MeteoForm
    if (ciclo < 1.85) return 'luna nuova'
    if (ciclo < 7.38) return 'crescente'
    if (ciclo < 9.23) return 'primo quarto'
    if (ciclo < 14.77) return 'gibbosa crescente'
    if (ciclo < 16.61) return 'piena'
    if (ciclo < 22.15) return 'gibbosa calante'
    if (ciclo < 23.99) return 'ultimo quarto'
    return 'calante'
}

/**
 * Ottieni dati meteo da Open-Meteo
 * @param {number} lat - Latitudine
 * @param {number} lng - Longitudine
 * @returns {Promise<Object>} Dati meteo formattati
 */
export const fetchWeatherData = async (lat, lng) => {
    try {
        // Costruisci URL API
        const params = new URLSearchParams({
            latitude: lat.toString(),
            longitude: lng.toString(),
            current: [
                'temperature_2m',
                'relative_humidity_2m',
                'surface_pressure',
                'wind_speed_10m',
                'wind_direction_10m',
                'weather_code'
            ].join(','),
            timezone: 'Europe/Rome',
            wind_speed_unit: 'kn' // nodi
        })

        const url = `https://api.open-meteo.com/v1/forecast?${params}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`)
        }

        const data = await response.json()

        if (!data.current) {
            throw new Error('Nessun dato meteo disponibile')
        }

        const current = data.current

        // Formatta i dati
        const weatherData = {
            temperatura: current.temperature_2m ? Math.round(current.temperature_2m).toString() : '',
            temperaturaAcqua: '', // Non disponibile da Open-Meteo, l'utente può inserirla manualmente
            pressione: current.surface_pressure ? Math.round(current.surface_pressure).toString() : '',
            vento: current.wind_speed_10m ? Math.round(current.wind_speed_10m).toString() : '',
            direzioneVento: degreesToDirection(current.wind_direction_10m) || '',
            condizioni: WEATHER_CODES[current.weather_code] || '',
            faseLunare: calcolaFaseLunare(),
            // Campi maree - non disponibili, l'utente li inserisce manualmente
            altaMareaOra: '',
            bassaMareaOra: '',
            altezzaOnde: '',
            frequenzaOnde: ''
        }

        return {
            success: true,
            data: weatherData
        }

    } catch (error) {
        console.error('Errore fetch meteo:', error)
        return {
            success: false,
            error: error.message || 'Errore connessione API meteo',
            data: null
        }
    }
}

export default fetchWeatherData
