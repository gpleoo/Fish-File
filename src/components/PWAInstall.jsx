import React, { useState, useEffect } from 'react'
import { useToast } from './Toast'

const PWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstall, setShowInstall] = useState(false)
    const toast = useToast()

    useEffect(() => {
        // Handle beforeinstallprompt event
        const handleBeforeInstall = (e) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowInstall(true)
        }

        // Handle app installed event
        const handleAppInstalled = () => {
            setDeferredPrompt(null)
            setShowInstall(false)
            toast.success('App installata con successo!')
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstall)
        window.addEventListener('appinstalled', handleAppInstalled)

        // Check if app is already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowInstall(false)
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [toast])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setDeferredPrompt(null)
            setShowInstall(false)
        }
    }

    if (!showInstall) return null

    return (
        <button
            onClick={handleInstall}
            className="fixed bottom-4 left-4 bg-cyan-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 z-40 active:bg-cyan-700"
        >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3"/>
            </svg>
            Installa App
        </button>
    )
}

export default PWAInstall
