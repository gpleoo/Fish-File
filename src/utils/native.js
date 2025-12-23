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
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera'
import { App } from '@capacitor/app'

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

// Camera - take photo
export const takePhoto = async () => {
    try {
        // Request permissions on native
        if (isNative()) {
            const permissions = await Camera.requestPermissions()
            if (permissions.camera !== 'granted') {
                throw new Error('Permesso fotocamera negato')
            }
        }

        const photo = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Camera,
            saveToGallery: true,
            correctOrientation: true
        })

        return photo.dataUrl
    } catch (error) {
        console.error('Camera error:', error)
        throw error
    }
}

// Camera - pick from gallery
export const pickFromGallery = async () => {
    try {
        if (isNative()) {
            const permissions = await Camera.requestPermissions()
            if (permissions.photos !== 'granted') {
                throw new Error('Permesso galleria negato')
            }
        }

        const photo = await Camera.getPhoto({
            quality: 90,
            allowEditing: false,
            resultType: CameraResultType.DataUrl,
            source: CameraSource.Photos,
            correctOrientation: true
        })

        return photo.dataUrl
    } catch (error) {
        console.error('Gallery error:', error)
        throw error
    }
}

// Camera - choose source (camera or gallery)
export const getPhoto = async (useCamera = true) => {
    if (useCamera) {
        return await takePhoto()
    } else {
        return await pickFromGallery()
    }
}

// App lifecycle listeners
let backButtonListeners = []
let pauseListeners = []
let resumeListeners = []

export const onBackButton = (callback) => {
    backButtonListeners.push(callback)
    return () => {
        backButtonListeners = backButtonListeners.filter(cb => cb !== callback)
    }
}

export const onAppPause = (callback) => {
    pauseListeners.push(callback)
    return () => {
        pauseListeners = pauseListeners.filter(cb => cb !== callback)
    }
}

export const onAppResume = (callback) => {
    resumeListeners.push(callback)
    return () => {
        resumeListeners = resumeListeners.filter(cb => cb !== callback)
    }
}

// Initialize native features on app start
export const initNativeFeatures = async () => {
    if (isNative()) {
        try {
            await setStatusBarDark()
            console.log(`Running on ${getPlatform()}`)

            // Setup back button handler (Android)
            App.addListener('backButton', ({ canGoBack }) => {
                if (backButtonListeners.length > 0) {
                    // Call all registered listeners
                    backButtonListeners.forEach(cb => cb(canGoBack))
                } else if (canGoBack) {
                    window.history.back()
                } else {
                    App.exitApp()
                }
            })

            // Setup app state listeners
            App.addListener('appStateChange', ({ isActive }) => {
                if (isActive) {
                    resumeListeners.forEach(cb => cb())
                } else {
                    pauseListeners.forEach(cb => cb())
                }
            })

        } catch (error) {
            console.error('Init native features error:', error)
        }
    }
}
