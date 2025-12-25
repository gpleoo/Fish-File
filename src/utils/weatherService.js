/**
 * Weather Service - Open-Meteo API + Marine API
 * API gratuita, nessuna chiave richiesta
 * https://open-meteo.com/
 * https://open-meteo.com/en/docs/marine-weather-api
 */

// Mappa codici meteo Open-Meteo -> condizioni (chiavi per traduzioni)
// Reference: https://open-meteo.com/en/docs (WMO Weather interpretation codes)
const WEATHER_CODES = {
    0: 'clear',            // Clear sky
    1: 'clear',            // Mainly clear
    2: 'cloudy',           // Partly cloudy
    3: 'overcast',         // Overcast
    45: 'fog',             // Fog
    48: 'fog',             // Depositing rime fog
    51: 'rain',            // Light drizzle
    53: 'rain',            // Moderate drizzle
    55: 'rain',            // Dense drizzle
    56: 'rain',            // Light freezing drizzle
    57: 'rain',            // Dense freezing drizzle
    61: 'rain',            // Slight rain
    63: 'rain',            // Moderate rain
    65: 'rain',            // Heavy rain
    66: 'rain',            // Light freezing rain
    67: 'rain',            // Heavy freezing rain
    71: 'rain',            // Slight snow
    73: 'rain',            // Moderate snow
    75: 'rain',            // Heavy snow
    77: 'rain',            // Snow grains
    80: 'rain',            // Slight rain showers
    81: 'rain',            // Moderate rain showers
    82: 'rain',            // Violent rain showers
    85: 'rain',            // Slight snow showers
    86: 'rain',            // Heavy snow showers
    95: 'storm',           // Thunderstorm
    96: 'storm',           // Thunderstorm with slight hail
    99: 'storm'            // Thunderstorm with heavy hail
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

// Calcola fase lunare approssimativa (restituisce chiave per traduzione)
const calcolaFaseLunare = () => {
    const oggi = new Date()
    // Luna nuova di riferimento: 6 gennaio 2000
    const lunaRiferimento = new Date(2000, 0, 6)
    const giorni = Math.floor((oggi - lunaRiferimento) / (1000 * 60 * 60 * 24))
    const ciclo = giorni % 29.53

    // Chiavi che matchano moonPhaseKeys in MeteoForm
    if (ciclo < 1.85) return 'newMoon'
    if (ciclo < 7.38) return 'waxingCrescent'
    if (ciclo < 9.23) return 'firstQuarter'
    if (ciclo < 14.77) return 'waxingGibbous'
    if (ciclo < 16.61) return 'fullMoon'
    if (ciclo < 22.15) return 'waningGibbous'
    if (ciclo < 23.99) return 'lastQuarter'
    return 'waningCrescent'
}

/**
 * Ottieni dati marine da Open-Meteo Marine API
 * @param {number} lat - Latitudine
 * @param {number} lng - Longitudine
 * @returns {Promise<Object>} Dati marine (onde)
 */
const fetchMarineData = async (lat, lng) => {
    try {
        const params = new URLSearchParams({
            latitude: lat.toString(),
            longitude: lng.toString(),
            current: [
                'wave_height',
                'wave_period'
            ].join(','),
            timezone: 'Europe/Rome'
        })

        const url = `https://marine-api.open-meteo.com/v1/marine?${params}`

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        })

        if (!response.ok) {
            // Marine API potrebbe non essere disponibile per alcune località
            console.warn('Marine API non disponibile per questa località')
            return null
        }

        const data = await response.json()

        if (!data.current) {
            return null
        }

        return {
            waveHeight: data.current.wave_height ? Math.round(data.current.wave_height * 100).toString() : '', // converti m -> cm
            wavePeriod: data.current.wave_period ? data.current.wave_period.toFixed(1) : ''
        }

    } catch (error) {
        console.warn('Errore fetch marine:', error.message)
        return null
    }
}

/**
 * Ottieni dati meteo da Open-Meteo (Weather + Marine)
 * @param {number} lat - Latitudine
 * @param {number} lng - Longitudine
 * @returns {Promise<Object>} Dati meteo formattati
 */
export const fetchWeatherData = async (lat, lng) => {
    try {
        // Costruisci URL API Weather
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

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?${params}`

        // Fetch weather e marine in parallelo
        const [weatherResponse, marineData] = await Promise.all([
            fetch(weatherUrl, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            }),
            fetchMarineData(lat, lng)
        ])

        if (!weatherResponse.ok) {
            throw new Error(`HTTP error: ${weatherResponse.status}`)
        }

        const weatherData = await weatherResponse.json()

        if (!weatherData.current) {
            throw new Error('Nessun dato meteo disponibile')
        }

        const current = weatherData.current

        // Formatta i dati combinando weather + marine
        const result = {
            temperatura: current.temperature_2m ? Math.round(current.temperature_2m).toString() : '',
            temperaturaAcqua: '', // Non disponibile, l'utente può inserirla manualmente
            pressione: current.surface_pressure ? Math.round(current.surface_pressure).toString() : '',
            vento: current.wind_speed_10m ? Math.round(current.wind_speed_10m).toString() : '',
            direzioneVento: degreesToDirection(current.wind_direction_10m) || '',
            condizioni: WEATHER_CODES[current.weather_code] || '',
            faseLunare: calcolaFaseLunare(),
            // Campi maree - non disponibili da API, l'utente li inserisce manualmente
            altaMareaOra: '',
            bassaMareaOra: '',
            // Dati onde da Marine API
            altezzaOnde: marineData?.waveHeight || '',
            frequenzaOnde: marineData?.wavePeriod || ''
        }

        return {
            success: true,
            data: result
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
