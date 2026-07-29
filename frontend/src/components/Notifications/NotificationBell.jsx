import React, { useState, useEffect, useRef } from 'react'
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline'
import { BellIcon as BellIconSolid } from '@heroicons/react/24/solid'
import api from '../../services/api'
import { Link } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'

const NotificationBell = ({ userRole = 'admin', className = '' }) => {
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef(null)

    const apiPathPrefix = userRole === 'seller' ? '/seller' : '/admin'

    const fetchNotifications = async () => {
        try {
            const response = await api.get(`${apiPathPrefix}/notifications`)
            if (response.data.status === 'success') {
                setNotifications(response.data.data.notifications || [])
                setUnreadCount(response.data.data.unread_count || 0)
            }
        } catch (error) {
            console.error('Error fetching notifications:', error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAsRead = async (id) => {
        try {
            await api.post(`${apiPathPrefix}/notifications/${id}/mark-read`)
            fetchNotifications()
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    const markAllAsRead = async () => {
        try {
            await api.post(`${apiPathPrefix}/notifications/mark-all-read`)
            fetchNotifications()
        } catch (error) {
            console.error('Error marking all as read:', error)
        }
    }

    const formatTime = (timeStr) => {
        // Fallback robust time formatting safely
        try {
            return timeStr // backend already sends formatted distance
        } catch (e) {
            return 'مؤخراً'
        }
    }

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {unreadCount > 0 ? (
                    <>
                        <BellIconSolid className="w-6 h-6 text-blue-600 animate-pulse" />
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    </>
                ) : (
                    <BellIcon className="w-6 h-6" />
                )}
            </button>

            {isOpen && (
                <div className="absolute left-0 sm:right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden" dir="rtl">
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                        <h3 className="font-bold text-gray-800">الإشعارات</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead} 
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                            >
                                <CheckIcon className="w-3 h-3" />
                                تحديد الكل كمقروء
                            </button>
                        )}
                    </div>
                    
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div 
                                        key={notif.id} 
                                        className={`px-4 py-3 hover:bg-gray-50 transition-colors flex gap-3 ${!notif.read ? 'bg-blue-50/30' : ''}`}
                                    >
                                        <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${!notif.read ? 'bg-blue-500' : 'bg-transparent'}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notif.read ? 'font-semibold text-gray-900' : 'text-gray-800'}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                                {notif.message}
                                            </p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-[10px] text-gray-400">
                                                    {formatTime(notif.created_at)}
                                                </span>
                                                {notif.link && (
                                                    <Link 
                                                        to={notif.link}
                                                        onClick={() => {
                                                            if(!notif.read) markAsRead(notif.id);
                                                            setIsOpen(false);
                                                        }}
                                                        className="text-xs text-blue-500 hover:underline"
                                                    >
                                                        عرض التفاصيل
                                                    </Link>
                                                )}
                                                {!notif.read && !notif.link && (
                                                    <button 
                                                        onClick={() => markAsRead(notif.id)}
                                                        className="text-xs text-gray-500 hover:text-gray-700"
                                                    >
                                                        مقروء
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center text-gray-500 flex flex-col items-center justify-center">
                                <BellIcon className="w-12 h-12 text-gray-300 mb-2" />
                                <p className="text-sm">لا توجد إشعارات حالياً</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default NotificationBell
