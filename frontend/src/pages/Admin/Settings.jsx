import React, { useState, useEffect } from 'react'
import { CogIcon, BellIcon, GlobeAltIcon, ShieldCheckIcon, UserGroupIcon, DocumentTextIcon, HomeIcon, CloudArrowUpIcon, WrenchScrewdriverIcon, ShareIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  
  // Backup states
  const [backups, setBackups] = useState([])
  const [loadingBackups, setLoadingBackups] = useState(false)
  const [creatingBackup, setCreatingBackup] = useState(false)
  const [backupMessage, setBackupMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  useEffect(() => {
    if (activeTab === 'backup') {
      fetchBackups()
    }
  }, [activeTab])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await api.get('/admin/settings')
      setSettings(response.data || {})
    } catch (err) {
      console.error('Error fetching settings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const formData = new FormData()
      
      // General Settings
      formData.append('store_name', settings.store_name || '')
      formData.append('store_description', settings.store_description || '')
      formData.append('store_email', settings.store_email || '')
      formData.append('store_phone', settings.store_phone || '')
      formData.append('store_address', settings.store_address || '')
      
      // Social Media Links
      formData.append('facebook_url', settings.facebook_url || '')
      formData.append('instagram_url', settings.instagram_url || '')
      formData.append('twitter_url', settings.twitter_url || '')
      formData.append('tiktok_url', settings.tiktok_url || '')
      formData.append('youtube_url', settings.youtube_url || '')
      formData.append('telegram_url', settings.telegram_url || '')
      formData.append('whatsapp_url', settings.whatsapp_url || '')
      
      // Site Settings
      formData.append('site_name', settings.site_name || '')
      formData.append('site_language', settings.site_language || 'ar')
      formData.append('timezone', settings.timezone || 'Asia/Riyadh')
      formData.append('date_format', settings.date_format || 'Y-m-d')
      formData.append('time_format', settings.time_format || 'H:i')
      
      // Account Settings
      formData.append('allow_registration', settings.allow_registration ? '1' : '0')
      formData.append('allow_guest_checkout', settings.allow_guest_checkout ? '1' : '0')
      
      // Order Settings
      formData.append('order_start_number', settings.order_start_number || 1000)
      formData.append('cancelled_order_retention_days', settings.cancelled_order_retention_days || 30)
      formData.append('default_order_status', settings.default_order_status || 'pending')
      formData.append('delivery_zones', JSON.stringify(
        typeof settings.delivery_zones === 'string' 
          ? settings.delivery_zones.split(',').map(z => z.trim()).filter(Boolean) 
          : (settings.delivery_zones || ['الرياض', 'جدة'])
      ))
      
      // Notification Settings
      formData.append('admin_notifications', settings.admin_notifications ? '1' : '0')
      formData.append('customer_notifications', settings.customer_notifications ? '1' : '0')
      
      // SEO Settings
      formData.append('seo_title', settings.seo_title || '')
      formData.append('seo_description', settings.seo_description || '')
      formData.append('seo_keywords', settings.seo_keywords || '')
      formData.append('analytics_code', settings.analytics_code || '')
      
      // Homepage Settings
      formData.append('products_per_section', settings.products_per_section || 8)
      formData.append('homepage_sections', JSON.stringify(settings.homepage_sections || {}))
      formData.append('banner_settings', JSON.stringify(settings.banner_settings || {}))
      
      // Security Settings
      formData.append('max_login_attempts', settings.max_login_attempts || 5)
      formData.append('login_lockout_minutes', settings.login_lockout_minutes || 15)
      
      // Maintenance Settings
      formData.append('maintenance_mode', settings.maintenance_mode ? '1' : '0')
      formData.append('maintenance_message', settings.maintenance_message || '')
      formData.append('maintenance_admin_only', settings.maintenance_admin_only ? '1' : '0')
      
      // File uploads
      if (settings.store_logo_file) {
        formData.append('store_logo', settings.store_logo_file)
      }
      if (settings.store_favicon_file) {
        formData.append('store_favicon', settings.store_favicon_file)
      }

      // Add _method for Laravel PUT request with FormData
      formData.append('_method', 'PUT')

      await api.post('/admin/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      setMessage('تم حفظ الإعدادات بنجاح')
      setTimeout(() => setMessage(''), 3000)
      fetchSettings()
    } catch (err) {
      console.error('Error saving settings:', err)
      setMessage('حدث خطأ أثناء حفظ الإعدادات')
    } finally {
      setSaving(false)
    }
  }

  const handleFileChange = (e, field) => {
    const file = e.target.files[0]
    if (file) {
      setSettings({ ...settings, [field]: file })
    }
  }

  // Backup functions
  const fetchBackups = async () => {
    try {
      setLoadingBackups(true)
      const response = await api.get('/admin/backups')
      setBackups(response.data.backups || [])
    } catch (err) {
      console.error('Error fetching backups:', err)
      setBackupMessage('حدث خطأ أثناء جلب النسخ الاحتياطية')
    } finally {
      setLoadingBackups(false)
    }
  }

  const handleCreateBackup = async () => {
    try {
      setCreatingBackup(true)
      setBackupMessage('')
      const response = await api.post('/admin/backups/create')
      setBackupMessage(response.data.message || 'تم إنشاء النسخة الاحتياطية بنجاح')
      fetchBackups()
      setTimeout(() => setBackupMessage(''), 5000)
    } catch (err) {
      console.error('Error creating backup:', err)
      setBackupMessage('حدث خطأ أثناء إنشاء النسخة الاحتياطية')
    } finally {
      setCreatingBackup(false)
    }
  }

  const handleDownloadBackup = async (filename) => {
    try {
      const response = await api.get(`/admin/backups/download/${filename}`, {
        responseType: 'blob'
      })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      console.error('Error downloading backup:', err)
      setBackupMessage('حدث خطأ أثناء تحميل النسخة الاحتياطية')
    }
  }

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه النسخة الاحتياطية؟')) {
      return
    }
    try {
      await api.delete(`/admin/backups/${filename}`)
      setBackupMessage('تم حذف النسخة الاحتياطية بنجاح')
      fetchBackups()
      setTimeout(() => setBackupMessage(''), 3000)
    } catch (err) {
      console.error('Error deleting backup:', err)
      setBackupMessage('حدث خطأ أثناء حذف النسخة الاحتياطية')
    }
  }

  const tabs = [
    { id: 'general', label: 'الإعدادات العامة', icon: GlobeAltIcon },
    { id: 'social', label: 'روابط التواصل الاجتماعي', icon: ShareIcon },
    { id: 'site', label: 'إعدادات الموقع', icon: GlobeAltIcon },
    { id: 'accounts', label: 'إعدادات الحسابات', icon: UserGroupIcon },
    { id: 'orders', label: 'إعدادات الطلبات', icon: DocumentTextIcon },
    { id: 'notifications', label: 'إعدادات الإشعارات', icon: BellIcon },
    { id: 'seo', label: 'إعدادات SEO', icon: DocumentTextIcon },
    { id: 'homepage', label: 'إعدادات الصفحة الرئيسية', icon: HomeIcon },
    { id: 'security', label: 'إعدادات الأمان', icon: ShieldCheckIcon },
    { id: 'maintenance', label: 'إعدادات الصيانة', icon: WrenchScrewdriverIcon },
    { id: 'backup', label: 'النسخ الاحتياطي', icon: CloudArrowUpIcon },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg sm:rounded-xl">
                <CogIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                إعدادات النظام
              </h1>
            </div>
            {message && (
              <div className={`px-4 py-2 rounded-lg ${message.includes('نجاح') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-1">
            <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 p-2 sm:p-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-reverse space-x-2 sm:space-x-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg mb-1 sm:mb-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="text-xs sm:text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6">
              {activeTab === 'general' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">الإعدادات العامة</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">اسم المتجر</label>
                      <input
                        type="text"
                        value={settings.store_name || ''}
                        onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={settings.store_email || ''}
                        onChange={(e) => setSettings({ ...settings, store_email: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">رقم الهاتف</label>
                      <input
                        type="tel"
                        value={settings.store_phone || ''}
                        onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">الشعار</label>
                      <input
                        type="file"
                        onChange={(e) => handleFileChange(e, 'store_logo_file')}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">وصف المتجر</label>
                      <textarea
                        rows="3"
                        value={settings.store_description || ''}
                        onChange={(e) => setSettings({ ...settings, store_description: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">العنوان</label>
                      <textarea
                        rows="2"
                        value={settings.store_address || ''}
                        onChange={(e) => setSettings({ ...settings, store_address: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'social' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">روابط التواصل الاجتماعي</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">فيسبوك</label>
                      <input
                        type="url"
                        value={settings.facebook_url || ''}
                        onChange={(e) => setSettings({ ...settings, facebook_url: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="https://facebook.com/yourstore"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">إنستجرام</label>
                      <input
                        type="url"
                        value={settings.instagram_url || ''}
                        onChange={(e) => setSettings({ ...settings, instagram_url: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="https://instagram.com/yourstore"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">تويتر (X)</label>
                      <input
                        type="url"
                        value={settings.twitter_url || ''}
                        onChange={(e) => setSettings({ ...settings, twitter_url: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="https://twitter.com/yourstore"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">تيكتوك</label>
                      <input
                        type="url"
                        value={settings.tiktok_url || ''}
                        onChange={(e) => setSettings({ ...settings, tiktok_url: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="https://tiktok.com/@yourstore"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">يوتيوب</label>
                      <input
                        type="url"
                        value={settings.youtube_url || ''}
                        onChange={(e) => setSettings({ ...settings, youtube_url: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="https://youtube.com/@yourstore"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">تيلجرام</label>
                      <input
                        type="url"
                        value={settings.telegram_url || ''}
                        onChange={(e) => setSettings({ ...settings, telegram_url: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="https://t.me/yourstore"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">واتساب</label>
                      <input
                        type="url"
                        value={settings.whatsapp_url || ''}
                        onChange={(e) => setSettings({ ...settings, whatsapp_url: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="https://wa.me/1234567890"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'site' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات الموقع</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">اسم الموقع</label>
                      <input
                        type="text"
                        value={settings.site_name || ''}
                        onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">اللغة الافتراضية</label>
                      <select
                        value={settings.site_language || 'ar'}
                        onChange={(e) => setSettings({ ...settings, site_language: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">المنطقة الزمنية</label>
                      <select
                        value={settings.timezone || 'Asia/Riyadh'}
                        onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      >
                        <option value="Asia/Riyadh">الرياض</option>
                        <option value="Asia/Dubai">دبي</option>
                        <option value="Asia/Cairo">القاهرة</option>
                        <option value="UTC">UTC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">تنسيق التاريخ</label>
                      <select
                        value={settings.date_format || 'Y-m-d'}
                        onChange={(e) => setSettings({ ...settings, date_format: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      >
                        <option value="Y-m-d">YYYY-MM-DD</option>
                        <option value="d/m/Y">DD/MM/YYYY</option>
                        <option value="m/d/Y">MM/DD/YYYY</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accounts' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات الحسابات</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.allow_registration || false}
                          onChange={(e) => setSettings({ ...settings, allow_registration: e.target.checked })}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label className="text-xs sm:text-sm font-medium text-gray-900">السماح بالتسجيل</label>
                      </div>
                      <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.allow_guest_checkout || false}
                          onChange={(e) => setSettings({ ...settings, allow_guest_checkout: e.target.checked })}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label className="text-xs sm:text-sm font-medium text-gray-900">السماح بالشراء كضيف</label>
                      </div>
                      <UserGroupIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات الطلبات</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">رقم الطلب الابتدائي</label>
                      <input
                        type="number"
                        value={settings.order_start_number || 1000}
                        onChange={(e) => setSettings({ ...settings, order_start_number: parseInt(e.target.value) })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">مدة الاحتفاظ بالطلبات الملغاة (أيام)</label>
                      <input
                        type="number"
                        value={settings.cancelled_order_retention_days || 30}
                        onChange={(e) => setSettings({ ...settings, cancelled_order_retention_days: parseInt(e.target.value) })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">حالة الطلب الافتراضية</label>
                      <select
                        value={settings.default_order_status || 'pending'}
                        onChange={(e) => setSettings({ ...settings, default_order_status: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      >
                        <option value="pending">قيد الانتظار</option>
                        <option value="processing">قيد المعالجة</option>
                        <option value="completed">مكتمل</option>
                        <option value="cancelled">ملغي</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">مناطق التوصيل للمناديب (مفصولة بفاصلة)</label>
                      <input
                        type="text"
                        value={Array.isArray(settings.delivery_zones) ? settings.delivery_zones.join(', ') : (settings.delivery_zones || '')}
                        onChange={(e) => setSettings({ ...settings, delivery_zones: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                        placeholder="الرياض, جدة, الدمام, أبها"
                      />
                      <p className="text-xs text-gray-500 mt-1">هذه المناطق ستظهر للمندوب ليختار مكان عمله.</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات الإشعارات</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.admin_notifications || false}
                          onChange={(e) => setSettings({ ...settings, admin_notifications: e.target.checked })}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label className="text-xs sm:text-sm font-medium text-gray-900">إشعارات لوحة التحكم</label>
                      </div>
                      <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.customer_notifications || false}
                          onChange={(e) => setSettings({ ...settings, customer_notifications: e.target.checked })}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label className="text-xs sm:text-sm font-medium text-gray-900">إشعارات العملاء</label>
                      </div>
                      <BellIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات SEO</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">عنوان الموقع</label>
                      <input
                        type="text"
                        value={settings.seo_title || ''}
                        onChange={(e) => setSettings({ ...settings, seo_title: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">وصف الموقع</label>
                      <textarea
                        rows="3"
                        value={settings.seo_description || ''}
                        onChange={(e) => setSettings({ ...settings, seo_description: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">الكلمات المفتاحية</label>
                      <textarea
                        rows="2"
                        value={settings.seo_keywords || ''}
                        onChange={(e) => setSettings({ ...settings, seo_keywords: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">أكواد التحليلات</label>
                      <textarea
                        rows="4"
                        value={settings.analytics_code || ''}
                        onChange={(e) => setSettings({ ...settings, analytics_code: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'homepage' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات الصفحة الرئيسية</h2>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">عدد المنتجات المعروضة في كل قسم</label>
                    <input
                      type="number"
                      value={settings.products_per_section || 8}
                      onChange={(e) => setSettings({ ...settings, products_per_section: parseInt(e.target.value) })}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات الأمان</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">عدد محاولات تسجيل الدخول</label>
                      <input
                        type="number"
                        value={settings.max_login_attempts || 5}
                        onChange={(e) => setSettings({ ...settings, max_login_attempts: parseInt(e.target.value) })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">مدة القفل (دقائق)</label>
                      <input
                        type="number"
                        value={settings.login_lockout_minutes || 15}
                        onChange={(e) => setSettings({ ...settings, login_lockout_minutes: parseInt(e.target.value) })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'maintenance' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">إعدادات الصيانة</h2>
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.maintenance_mode || false}
                          onChange={(e) => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label className="text-xs sm:text-sm font-medium text-gray-900">وضع الصيانة</label>
                      </div>
                      <WrenchScrewdriverIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                      <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.maintenance_admin_only || false}
                          onChange={(e) => setSettings({ ...settings, maintenance_admin_only: e.target.checked })}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                        />
                        <label className="text-xs sm:text-sm font-medium text-gray-900">السماح للمشرفين فقط أثناء الصيانة</label>
                      </div>
                      <ShieldCheckIcon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">رسالة الصيانة</label>
                      <textarea
                        rows="3"
                        value={settings.maintenance_message || ''}
                        onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'backup' && (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">النسخ الاحتياطي</h2>
                  
                  {backupMessage && (
                    <div className={`p-4 rounded-lg ${backupMessage.includes('خطأ') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                      {backupMessage}
                    </div>
                  )}
                  
                  <div className="p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl">
                    <div className="mb-4">
                      <button
                        onClick={handleCreateBackup}
                        disabled={creatingBackup}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {creatingBackup ? 'جاري إنشاء النسخة الاحتياطية...' : 'إنشاء نسخة احتياطية'}
                      </button>
                    </div>
                    
                    {loadingBackups ? (
                      <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
                      </div>
                    ) : (
                      <div className="mt-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">النسخ الاحتياطية المتاحة</h3>
                        {backups.length === 0 ? (
                          <p className="text-sm text-gray-500">لا توجد نسخ احتياطية حالياً</p>
                        ) : (
                          <div className="space-y-2">
                            {backups.map((backup, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">{backup.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {backup.size} • {backup.created_at}
                                  </p>
                                </div>
                                <div className="flex space-x-2 space-x-reverse">
                                  <button
                                    onClick={() => handleDownloadBackup(backup.name)}
                                    className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                  >
                                    تحميل
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBackup(backup.name)}
                                    className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                  >
                                    حذف
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-6 sm:mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 sm:px-8 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
