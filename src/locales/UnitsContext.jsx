import React, { createContext, useContext, useState, useCallback } from 'react'

// Storage key
const STORAGE_KEY = 'diarioPesca_units'

// Default units (metric/European)
const defaultUnits = {
    weight: 'kg',      // kg, lb, oz
    length: 'cm',      // cm, in
    temperature: 'C',  // C, F
    timeFormat: '24h', // 24h, 12h
    dateFormat: 'DD/MM/YYYY' // DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
}

// Unit options
export const unitOptions = {
    weight: ['kg', 'lb', 'oz'],
    length: ['cm', 'in'],
    temperature: ['C', 'F'],
    timeFormat: ['24h', '12h'],
    dateFormat: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
}

// Conversion functions
const conversions = {
    // Weight conversions (stored in grams internally)
    weight: {
        toDisplay: (grams, unit) => {
            if (!grams || isNaN(grams)) return ''
            const g = parseFloat(grams)
            switch (unit) {
                case 'kg': return (g / 1000).toFixed(2)
                case 'lb': return (g / 453.592).toFixed(2)
                case 'oz': return (g / 28.3495).toFixed(2)
                default: return g.toString()
            }
        },
        toStorage: (value, unit) => {
            if (!value || isNaN(value)) return ''
            const v = parseFloat(value)
            switch (unit) {
                case 'kg': return (v * 1000).toString()
                case 'lb': return (v * 453.592).toString()
                case 'oz': return (v * 28.3495).toString()
                default: return v.toString()
            }
        },
        symbol: (unit) => {
            switch (unit) {
                case 'kg': return 'kg'
                case 'lb': return 'lb'
                case 'oz': return 'oz'
                default: return 'g'
            }
        }
    },
    // Length conversions (stored in cm internally)
    length: {
        toDisplay: (cm, unit) => {
            if (!cm || isNaN(cm)) return ''
            const c = parseFloat(cm)
            switch (unit) {
                case 'cm': return c.toFixed(1)
                case 'in': return (c / 2.54).toFixed(1)
                default: return c.toString()
            }
        },
        toStorage: (value, unit) => {
            if (!value || isNaN(value)) return ''
            const v = parseFloat(value)
            switch (unit) {
                case 'cm': return v.toString()
                case 'in': return (v * 2.54).toString()
                default: return v.toString()
            }
        },
        symbol: (unit) => unit === 'in' ? 'in' : 'cm'
    },
    // Temperature conversions (stored in Celsius internally)
    temperature: {
        toDisplay: (celsius, unit) => {
            if (!celsius || isNaN(celsius)) return ''
            const c = parseFloat(celsius)
            switch (unit) {
                case 'C': return c.toFixed(1)
                case 'F': return ((c * 9/5) + 32).toFixed(1)
                default: return c.toString()
            }
        },
        toStorage: (value, unit) => {
            if (!value || isNaN(value)) return ''
            const v = parseFloat(value)
            switch (unit) {
                case 'C': return v.toString()
                case 'F': return ((v - 32) * 5/9).toString()
                default: return v.toString()
            }
        },
        symbol: (unit) => unit === 'F' ? '°F' : '°C'
    },
    // Time format
    time: {
        toDisplay: (time24, format) => {
            if (!time24) return ''
            if (format === '24h') return time24

            const [hours, minutes] = time24.split(':').map(Number)
            const period = hours >= 12 ? 'PM' : 'AM'
            const hours12 = hours % 12 || 12
            return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`
        },
        toStorage: (time, format) => {
            if (!time) return ''
            if (format === '24h') return time

            // Parse 12h format to 24h
            const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
            if (!match) return time

            let [, hours, minutes, period] = match
            hours = parseInt(hours)
            if (period.toUpperCase() === 'PM' && hours !== 12) hours += 12
            if (period.toUpperCase() === 'AM' && hours === 12) hours = 0
            return `${hours.toString().padStart(2, '0')}:${minutes}`
        }
    },
    // Date format
    date: {
        toDisplay: (isoDate, format) => {
            if (!isoDate) return ''
            const [year, month, day] = isoDate.split('-')
            switch (format) {
                case 'DD/MM/YYYY': return `${day}/${month}/${year}`
                case 'MM/DD/YYYY': return `${month}/${day}/${year}`
                case 'YYYY-MM-DD': return isoDate
                default: return isoDate
            }
        },
        toStorage: (date, format) => {
            if (!date) return ''
            let day, month, year

            switch (format) {
                case 'DD/MM/YYYY':
                    [day, month, year] = date.split('/')
                    break
                case 'MM/DD/YYYY':
                    [month, day, year] = date.split('/')
                    break
                case 'YYYY-MM-DD':
                    return date // Already in ISO format
                default:
                    return date
            }
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }
    }
}

// Create context
const UnitsContext = createContext()

/**
 * Units Provider component
 */
export const UnitsProvider = ({ children }) => {
    // Load saved units or use defaults
    const [units, setUnitsState] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                return { ...defaultUnits, ...JSON.parse(saved) }
            }
            return defaultUnits
        } catch {
            return defaultUnits
        }
    })

    // Update a specific unit preference
    const setUnit = useCallback((type, value) => {
        if (unitOptions[type]?.includes(value)) {
            setUnitsState(prev => {
                const newUnits = { ...prev, [type]: value }
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUnits))
                } catch (e) {
                    console.error('Error saving unit preference:', e)
                }
                return newUnits
            })
        }
    }, [])

    // Conversion helpers
    const convertWeight = useCallback((value, toDisplay = true) => {
        return toDisplay
            ? conversions.weight.toDisplay(value, units.weight)
            : conversions.weight.toStorage(value, units.weight)
    }, [units.weight])

    const convertLength = useCallback((value, toDisplay = true) => {
        return toDisplay
            ? conversions.length.toDisplay(value, units.length)
            : conversions.length.toStorage(value, units.length)
    }, [units.length])

    const convertTemperature = useCallback((value, toDisplay = true) => {
        return toDisplay
            ? conversions.temperature.toDisplay(value, units.temperature)
            : conversions.temperature.toStorage(value, units.temperature)
    }, [units.temperature])

    const formatTime = useCallback((time) => {
        return conversions.time.toDisplay(time, units.timeFormat)
    }, [units.timeFormat])

    const formatDate = useCallback((date) => {
        return conversions.date.toDisplay(date, units.dateFormat)
    }, [units.dateFormat])

    // Get unit symbols
    const getWeightSymbol = useCallback(() => conversions.weight.symbol(units.weight), [units.weight])
    const getLengthSymbol = useCallback(() => conversions.length.symbol(units.length), [units.length])
    const getTemperatureSymbol = useCallback(() => conversions.temperature.symbol(units.temperature), [units.temperature])

    const value = {
        units,
        setUnit,
        unitOptions,
        // Conversion functions
        convertWeight,
        convertLength,
        convertTemperature,
        formatTime,
        formatDate,
        // Symbols
        getWeightSymbol,
        getLengthSymbol,
        getTemperatureSymbol
    }

    return (
        <UnitsContext.Provider value={value}>
            {children}
        </UnitsContext.Provider>
    )
}

/**
 * Hook to use units
 */
export const useUnits = () => {
    const context = useContext(UnitsContext)
    if (!context) {
        throw new Error('useUnits must be used within a UnitsProvider')
    }
    return context
}

export default UnitsContext
