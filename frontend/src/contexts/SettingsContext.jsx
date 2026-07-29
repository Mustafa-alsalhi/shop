import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const SettingsContext = createContext()

export const useSettings = () => {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Try to load settings from localStorage on initial load
    const savedSettings = localStorage.getItem('app_settings')
    return savedSettings ? JSON.parse(savedSettings) : {}
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/settings')
      // Handle both formats: direct data or wrapped in 'data' property
      const settingsData = response.data.data || response.data
      
      // Convert relative image paths to absolute URLs
      if (settingsData.store_logo && settingsData.store_logo.startsWith('/')) {
        const baseURL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'
        settingsData.store_logo = `${baseURL}${settingsData.store_logo}`
      }
      
      setSettings(settingsData || {})
      // Save to localStorage for faster subsequent loads
      localStorage.setItem('app_settings', JSON.stringify(settingsData || {}))
    } catch (err) {
      console.error('Error fetching settings:', err)
      // Don't reset settings on error - keep existing settings
    } finally {
      setLoading(false)
    }
  }

  const value = {
    settings,
    loading,
    fetchSettings,
    storeName: settings.store_name || 'My Store',
    storeDescription: settings.store_description || '',
    storeLogo: settings.store_logo || '',
    storeEmail: settings.store_email || '',
    storePhone: settings.store_phone || '',
    storeAddress: settings.store_address || '',
    facebookUrl: settings.facebook_url || '',
    instagramUrl: settings.instagram_url || '',
    twitterUrl: settings.twitter_url || '',
    tiktokUrl: settings.tiktok_url || '',
    youtubeUrl: settings.youtube_url || '',
    telegramUrl: settings.telegram_url || '',
    whatsappUrl: settings.whatsapp_url || '',
    siteName: settings.site_name || 'My Store',
    siteLanguage: settings.site_language || 'ar',
    timezone: settings.timezone || 'Asia/Riyadh',
    dateFormat: settings.date_format || 'Y-m-d',
    timeFormat: settings.time_format || 'H:i',
    allowRegistration: settings.allow_registration !== false,
    allowGuestCheckout: settings.allow_guest_checkout !== false,
    seoTitle: settings.seo_title || '',
    seoDescription: settings.seo_description || '',
    seoKeywords: settings.seo_keywords || '',
    analyticsCode: settings.analytics_code || '',
    maintenanceMode: settings.maintenance_mode || false,
    maintenanceMessage: settings.maintenance_message || '',
  }

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  )
}
