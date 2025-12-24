import React, { createContext, useContext, useState, useCallback } from 'react'
import { X, CheckCircle, AlertTriangle, Info, XCircle } from './Icons'

// Toast Context
const ToastContext = createContext(null)

// Toast types config
const toastConfig = {
    success: {
        icon: CheckCircle,
        bgColor: 'bg-green-800',
        borderColor: 'border-green-500',
        iconColor: 'text-green-400'
    },
    error: {
        icon: XCircle,
        bgColor: 'bg-red-800',
        borderColor: 'border-red-500',
        iconColor: 'text-red-400'
    },
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-yellow-800',
        borderColor: 'border-yellow-500',
        iconColor: 'text-yellow-400'
    },
    info: {
        icon: Info,
        bgColor: 'bg-cyan-800',
        borderColor: 'border-cyan-500',
        iconColor: 'text-cyan-400'
    }
}

// Single Toast Component
const ToastItem = ({ toast, onClose }) => {
    const config = toastConfig[toast.type] || toastConfig.info
    const Icon = config.icon

    return (
        <div
            className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 shadow-lg flex items-start gap-3 animate-slide-in max-w-sm`}
            role="alert"
        >
            <Icon className={config.iconColor} width={20} height={20} />
            <div className="flex-1">
                {toast.title && (
                    <p className="text-white font-bold text-sm">{toast.title}</p>
                )}
                <p className="text-gray-200 text-sm">{toast.message}</p>
            </div>
            <button
                onClick={() => onClose(toast.id)}
                className="text-gray-400 hover:text-white"
            >
                <X width={16} height={16} />
            </button>
        </div>
    )
}

// Toast Container Component
const ToastContainer = ({ toasts, removeToast }) => {
    if (toasts.length === 0) return null

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={removeToast} />
            ))}
        </div>
    )
}

// Maximum number of toasts visible at once
const MAX_TOASTS = 5

// Toast Provider Component
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', title = null, duration = 4000) => {
        const id = Date.now() + Math.random()
        const newToast = { id, message, type, title }

        setToasts(prev => {
            // Remove oldest toasts if we exceed the limit
            const updated = [...prev, newToast]
            if (updated.length > MAX_TOASTS) {
                return updated.slice(-MAX_TOASTS)
            }
            return updated
        })

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    // Convenience methods
    const toast = {
        success: (message, title) => addToast(message, 'success', title),
        error: (message, title) => addToast(message, 'error', title, 6000),
        warning: (message, title) => addToast(message, 'warning', title, 5000),
        info: (message, title) => addToast(message, 'info', title)
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer toasts={toasts} removeToast={removeToast} />
        </ToastContext.Provider>
    )
}

// Custom hook
export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

export default ToastProvider
