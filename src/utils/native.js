/**
 * Native functionality utilities for Capacitor
 * These functions provide access to native device features
 */

import { Capacitor } from '@capacitor/core'
import { Haptics, ImpactStyle } from '@capacitor/haptics'
import { StatusBar, Style } from '@capacitor/status-bar'
import { Geolocation } from '@capacitor/geolocation'
import { Share } from '@capacitor/share'
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

// Check if running on native platform
export const isNative = () => Capacitor.isNativePlatform()
export const getPlatform = () => Capacitor.getPlatform()

// Haptic feedback
export const hapticLight = async () => {
    if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Light })
    }
}

export const hapticMedium = async () => {
    if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Medium })
    }
}

export const hapticHeavy = async () => {
    if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Heavy })
    }
}

export const hapticSuccess = async () => {
    if (isNative()) {
        await Haptics.notification({ type: 'SUCCESS' })
    }
}

export const hapticError = async () => {
    if (isNative()) {
        await Haptics.notification({ type: 'ERROR' })
    }
}

// Status bar
export const setStatusBarDark = async () => {
    if (isNative()) {
        await StatusBar.setStyle({ style: Style.Dark })
        await StatusBar.setBackgroundColor({ color: '#000000' })
    }
}

export const hideStatusBar = async () => {
    if (isNative()) {
        await StatusBar.hide()
    }
}

export const showStatusBar = async () => {
    if (isNative()) {
        await StatusBar.show()
    }
}

// Geolocation with native permissions
export const getCurrentPosition = async () => {
    try {
        // Request permissions on native
        if (isNative()) {
            const permissions = await Geolocation.requestPermissions()
            if (permissions.location !== 'granted') {
                throw new Error('Permesso geolocalizzazione negato')
            }
        }

        const position = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        })

        return {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
        }
    } catch (error) {
        console.error('Geolocation error:', error)
        throw error
    }
}

// Share functionality
export const shareData = async (title, text, url) => {
    try {
        await Share.share({
            title,
            text,
            url,
            dialogTitle: 'Condividi'
        })
        return true
    } catch (error) {
        console.error('Share error:', error)
        return false
    }
}

// File system - save data
export const saveDataToFile = async (filename, data) => {
    try {
        await Filesystem.writeFile({
            path: filename,
            data: JSON.stringify(data, null, 2),
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        })
        return true
    } catch (error) {
        console.error('Save file error:', error)
        return false
    }
}

// File system - read data
export const readDataFromFile = async (filename) => {
    try {
        const result = await Filesystem.readFile({
            path: filename,
            directory: Directory.Documents,
            encoding: Encoding.UTF8
        })
        return JSON.parse(result.data)
    } catch (error) {
        console.error('Read file error:', error)
        return null
    }
}

// Initialize native features on app start
export const initNativeFeatures = async () => {
    if (isNative()) {
        try {
            await setStatusBarDark()
            console.log(`Running on ${getPlatform()}`)
        } catch (error) {
            console.error('Init native features error:', error)
        }
    }
}
