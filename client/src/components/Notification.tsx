'use client'

import { useState, useEffect, useCallback } from 'react'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  message: string
  type: NotificationType
  duration?: number
}

interface NotificationContextType {
  notifications: Notification[]
  showNotification: (message: string, type?: NotificationType, duration?: number) => void
  removeNotification: (id: string) => void
}

// Create a simple notification system using React state
let notificationIdCounter = 0
let notificationListeners: Array<(notifications: Notification[]) => void> = []
let currentNotifications: Notification[] = []

const notifyListeners = () => {
  notificationListeners.forEach((listener) => listener([...currentNotifications]))
}

export const showNotification = (
  message: string,
  type: NotificationType = 'info',
  duration: number = 5000
) => {
  const id = `notification-${++notificationIdCounter}`
  const notification: Notification = { id, message, type, duration }
  
  currentNotifications = [...currentNotifications, notification]
  notifyListeners()

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      currentNotifications = currentNotifications.filter((n) => n.id !== id)
      notifyListeners()
    }, duration)
  }
}

export const removeNotification = (id: string) => {
  currentNotifications = currentNotifications.filter((n) => n.id !== id)
  notifyListeners()
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const listener = (newNotifications: Notification[]) => {
      setNotifications(newNotifications)
    }
    
    notificationListeners.push(listener)
    setNotifications([...currentNotifications])

    return () => {
      notificationListeners = notificationListeners.filter((l) => l !== listener)
    }
  }, [])

  const show = useCallback((message: string, type?: NotificationType, duration?: number) => {
    showNotification(message, type, duration)
  }, [])

  const remove = useCallback((id: string) => {
    removeNotification(id)
  }, [])

  return { notifications, showNotification: show, removeNotification: remove }
}

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications()

  if (notifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => {
        const getStyles = () => {
          switch (notification.type) {
            case 'success':
              return 'bg-green-50 border-green-500 text-green-800'
            case 'error':
              return 'bg-red-50 border-red-500 text-red-800'
            case 'warning':
              return 'bg-yellow-50 border-yellow-500 text-yellow-800'
            default:
              return 'bg-blue-50 border-blue-500 text-blue-800'
          }
        }

        const getIcon = () => {
          switch (notification.type) {
            case 'success':
              return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            case 'error':
              return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
            case 'warning':
              return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )
            default:
              return (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
          }
        }

        return (
          <div
            key={notification.id}
            className={`${getStyles()} border-l-4 rounded-lg shadow-lg p-4 flex items-start transition-all duration-300 transform translate-x-0`}
          >
            <div className="flex-shrink-0 mr-3">{getIcon()}</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="ml-3 flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )
      })}
    </div>
  )
}

