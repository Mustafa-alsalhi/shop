import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import {
  selectToastNotifications,
  removeToastNotification,
} from '../../store/slices/uiSlice'

const Notifications = () => {
  const dispatch = useDispatch()
  const toastNotifications = useSelector(selectToastNotifications) || []

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'error':
        return <ExclamationCircleIcon className="h-6 w-6 text-red-500" />
      case 'warning':
        return <InformationCircleIcon className="h-6 w-6 text-yellow-500" />
      case 'info':
      default:
        return <InformationCircleIcon className="h-6 w-6 text-blue-500" />
    }
  }

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'warning':
        return 'text-yellow-800'
      case 'info':
      default:
        return 'text-blue-800'
    }
  }

  React.useEffect(() => {
    if (toastNotifications && toastNotifications.length > 0) {
      const timers = toastNotifications.map((notification) => {
        if (notification.autoClose) {
          return setTimeout(() => {
            dispatch(removeToastNotification(notification.id))
          }, notification.duration || 5000)
        }
        return null
      })

      return () => {
        timers.forEach((timer) => {
          if (timer) clearTimeout(timer)
        })
      }
    }
  }, [toastNotifications, dispatch])

  if (!toastNotifications || toastNotifications.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toastNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`
            flex items-start p-4 rounded-lg border shadow-lg
            transform transition-all duration-300 ease-in-out
            animate-slide-in max-w-sm
            ${getBackgroundColor(notification.type)}
          `}
        >
          <div className="flex-shrink-0 mr-3">
            {getIcon(notification.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className={`text-sm font-medium ${getTextColor(notification.type)}`}>
                {notification.title}
              </h4>
            )}
            <p className={`text-sm ${getTextColor(notification.type)}`}>
              {notification.message}
            </p>
          </div>
          
          <button
            onClick={() => dispatch(removeToastNotification(notification.id))}
            className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  )
}

export default Notifications
