import React, { useState, useEffect } from 'react'
import {
  SparklesIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BuildingStorefrontIcon,
  TagIcon,
  ShoppingBagIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import activityService from '../../services/activityService'

const PRESET_EMOJIS = ['🍔', '☕', '🥖', '🛒', '💊', '💐', '🥩', '🍕', '🍰', '🍦', '🍣', '🥗', '🥤', '🍩', '🍫']

const PRESET_GRADIENTS = [
  { name: 'برتقالي دافئ', value: 'from-amber-600 via-orange-600 to-amber-700' },
  { name: 'وردي / بني قهوة', value: 'from-rose-600 via-amber-700 to-amber-900' },
  { name: 'ذهبي / مخابز', value: 'from-amber-500 via-yellow-600 to-orange-600' },
  { name: 'زمردي / سوبرماركت', value: 'from-emerald-600 via-teal-700 to-emerald-800' },
  { name: 'أزرق كحلي / صيدليات', value: 'from-cyan-600 via-blue-700 to-indigo-800' },
  { name: 'بنفسجي فاخر', value: 'from-purple-600 via-fuchsia-700 to-pink-700' },
]

const AdminActivities = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [currentId, setCurrentId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    icon: '🍔',
    description: '',
    banner_title: '',
    banner_subtitle: '',
    banner_bg: 'from-amber-600 via-orange-600 to-amber-700',
    place_label: 'مطعم',
    item_label: 'وجبة',
    sort_order: 1,
    is_active: true,
  })

  useEffect(() => {
    fetchActivities()
  }, [])

  const fetchActivities = async () => {
    try {
      setLoading(true)
      const res = await activityService.getAdminActivities()
      if (res.success) {
        setActivities(res.data || [])
      } else {
        setError(res.message || 'فشل في جلب الأنشطة')
      }
    } catch (err) {
      console.error('Error fetching activities:', err)
      setError('تعذر الاتصال بالخادم لجلب الأنشطة')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setIsEditing(false)
    setCurrentId(null)
    setFormData({
      name: '',
      slug: '',
      icon: '🍔',
      description: '',
      banner_title: '',
      banner_subtitle: '',
      banner_bg: 'from-amber-600 via-orange-600 to-amber-700',
      place_label: 'مطعم',
      item_label: 'وجبة',
      sort_order: activities.length + 1,
      is_active: true,
    })
    setShowModal(true)
  }

  const handleOpenEdit = (act) => {
    setIsEditing(true)
    setCurrentId(act.id)
    setFormData({
      name: act.name || '',
      slug: act.slug || '',
      icon: act.icon || '🍔',
      description: act.description || '',
      banner_title: act.banner_title || '',
      banner_subtitle: act.banner_subtitle || '',
      banner_bg: act.banner_bg || 'from-amber-600 via-orange-600 to-amber-700',
      place_label: act.place_label || 'مطعم',
      item_label: act.item_label || 'وجبة',
      sort_order: act.sort_order ?? 1,
      is_active: Boolean(act.is_active),
    })
    setShowModal(true)
  }

  const handleAutoFillLabels = (name) => {
    const trimmed = name.trim()
    let place = 'مكان'
    let item = 'صنف'
    let icon = formData.icon

    if (trimmed.includes('مطعم') || trimmed.includes('وجب')) {
      place = 'مطعم'
      item = 'وجبة'
      icon = '🍔'
    } else if (trimmed.includes('كافيه') || trimmed.includes('مقهى') || trimmed.includes('قهو')) {
      place = 'كافيه'
      item = 'مشروب وحلى'
      icon = '☕'
    } else if (trimmed.includes('مخبز') || trimmed.includes('معجن') || trimmed.includes('حلوي')) {
      place = 'مخبز'
      item = 'مخبوزات'
      icon = '🥖'
    } else if (trimmed.includes('سوبر') || trimmed.includes('بقال') || trimmed.includes('غذائ')) {
      place = 'سوبرماركت'
      item = 'منتج'
      icon = '🛒'
    } else if (trimmed.includes('صيدل') || trimmed.includes('دواء')) {
      place = 'صيدلية'
      item = 'مستحضر'
      icon = '💊'
    } else if (trimmed.includes('ورد') || trimmed.includes('زهر')) {
      place = 'محل زهور'
      item = 'باقة'
      icon = '💐'
    } else if (trimmed.includes('لحم') || trimmed.includes('ملحم')) {
      place = 'ملحمة'
      item = 'صنف لحم'
      icon = '🥩'
    }

    setFormData(prev => ({
      ...prev,
      name,
      place_label: place,
      item_label: item,
      icon,
      banner_title: prev.banner_title || `أفضل ${name} مع أسرع توصيل لباب بيتك`,
      banner_subtitle: prev.banner_subtitle || `اطلب الآن من أميز ${name} واستمتع بخدمة راقية وسرعة استثنائية.`
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccessMsg('')

    try {
      if (isEditing) {
        const res = await activityService.updateActivity(currentId, formData)
        if (res.success) {
          setSuccessMsg(res.message || 'تم تحديث النشاط بنجاح!')
          setShowModal(false)
          fetchActivities()
        } else {
          setError(res.message || 'تعذر تحديث النشاط')
        }
      } else {
        const res = await activityService.createActivity(formData)
        if (res.success) {
          setSuccessMsg(res.message || 'تمت إضافة النشاط بنجاح!')
          setShowModal(false)
          fetchActivities()
        } else {
          setError(res.message || 'تعذر إنشاء النشاط')
        }
      }
    } catch (err) {
      console.error('Submit activity error:', err)
      const msg = err.response?.data?.message || err.message || 'حدث خطأ أثناء حفظ البيانات'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggle = async (id) => {
    try {
      const res = await activityService.toggleActivity(id)
      if (res.success) {
        setActivities(prev => prev.map(a => a.id === id ? { ...a, is_active: res.is_active } : a))
      }
    } catch (err) {
      alert('تعذر تغيير حالة النشاط')
    }
  }

  const handleDelete = async (act) => {
    if (!window.confirm(`هل أنت متأكد من حذف نشاط "${act.name}"؟`)) return

    try {
      const res = await activityService.deleteActivity(act.id)
      if (res.success) {
        setSuccessMsg(res.message || 'تم حذف النشاط بنجاح')
        fetchActivities()
      } else {
        alert(res.message || 'لا يمكن حذف النشاط')
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'تعذر حذف النشاط'
      alert(msg)
    }
  }

  const totalPlaces = activities.reduce((sum, a) => sum + (Number(a.places_count) || 0), 0)
  const totalCategories = activities.reduce((sum, a) => sum + (Number(a.categories_count) || 0), 0)

  return (
    <div className="space-y-6 pb-12 rtl" dir="rtl">
      {/* 1. Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
            <SparklesIcon className="w-4 h-4 text-amber-600" />
            <span>نظام الأنشطة التجارية الديناميكي</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            إدارة الأنشطة والخدمات
          </h1>
          <p className="text-sm text-gray-500 mt-1 max-w-2xl leading-relaxed">
            أضف أي نشاط تجاري بنفسك (مثل المطاعم، الكافيهات، المخابز، السوبرماركت...) وستظهر تلقائياً في الواجهة الرئيسية بنفس صفحات وتفاصيل وقوائم المطاعم الحالية!
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold px-5 py-3 rounded-2xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-all transform active:scale-95 flex-shrink-0 text-sm"
        >
          <PlusIcon className="w-5 h-5 stroke-[2.5]" />
          <span>إضافة نشاط تجاري جديد</span>
        </button>
      </div>

      {/* 2. Messages */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-rose-500 hover:text-rose-700 text-xs font-bold">إغلاق</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-sm">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700 text-xs font-bold">إغلاق</button>
        </div>
      )}

      {/* 3. KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            ✨
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">الأنشطة المضافة</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{activities.length}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl flex-shrink-0">
            <BuildingStorefrontIcon className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">إجمالي الأماكن / المتاجر</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalPlaces}</h3>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl flex-shrink-0">
            <TagIcon className="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold">إجمالي التصنيفات المرتبطة</p>
            <h3 className="text-2xl font-black text-gray-900 mt-0.5">{totalCategories}</h3>
          </div>
        </div>
      </div>

      {/* 4. Activities Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
          <ArrowPathIcon className="w-8 h-8 animate-spin text-amber-500" />
          <p className="text-sm font-medium">جاري تحميل قائمة الأنشطة التجارية...</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center text-gray-500 border border-gray-100 shadow-sm space-y-4">
          <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">لم يتم العثور على أنشطة مضافة بعد</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            قم بالضغط على زر "إضافة نشاط تجاري جديد" للبدء في ربط الأنشطة وإظهارها في المنصة.
          </p>
          <button
            onClick={handleOpenAdd}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all inline-flex items-center gap-2"
          >
            <PlusIcon className="w-4 h-4" />
            إضافة أول نشاط
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {activities.map((act) => {
            const isCoreRestaurant = act.slug === 'restaurant'
            return (
              <div
                key={act.id}
                className={`bg-white rounded-3xl border transition-all duration-300 p-5 shadow-sm hover:shadow-md flex flex-col justify-between ${
                  act.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60 bg-gray-50/50'
                }`}
              >
                <div>
                  {/* Top Bar: Icon, Name, Slug, Active Toggle */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner">
                        {act.icon || '🏬'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-gray-900 text-base">{act.name}</h3>
                          {isCoreRestaurant && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                              أساسي
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-mono text-gray-400 block mt-0.5" dir="ltr">
                          slug: {act.slug}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Active Switch */}
                    <button
                      onClick={() => handleToggle(act.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        act.is_active ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                      title={act.is_active ? 'تعطيل النشاط' : 'تفعيل النشاط'}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          act.is_active ? 'translate-x-0' : '-translate-x-5'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Description */}
                  {act.description && (
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">
                      {act.description}
                    </p>
                  )}

                  {/* Banner Preview Swatch */}
                  <div className={`p-3 rounded-2xl bg-gradient-to-r ${act.banner_bg || 'from-amber-600 via-orange-600 to-amber-700'} text-white shadow-sm mb-4`}>
                    <p className="text-[11px] font-extrabold line-clamp-1">{act.banner_title || 'عنوان البانر الافتراضي'}</p>
                    <p className="text-[10px] text-white/80 line-clamp-1 mt-0.5">{act.banner_subtitle || 'وصف ترويجي'}</p>
                  </div>

                  {/* Labels and Stats */}
                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px]">مسمى المكان</span>
                      <span className="font-bold text-gray-800">{act.place_label || 'مكان'}</span>
                    </div>
                    <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-gray-400 block text-[10px]">مسمى الصنف</span>
                      <span className="font-bold text-gray-800">{act.item_label || 'صنف'}</span>
                    </div>
                  </div>

                  {/* Badges for counts */}
                  <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-gray-600 mb-4">
                    <span className="bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">
                      {act.places_count || 0} {act.place_label || 'مكان'}
                    </span>
                    <span className="bg-orange-50 text-orange-800 px-2.5 py-1 rounded-lg">
                      {act.categories_count || 0} تصنيف
                    </span>
                    <span className="bg-teal-50 text-teal-800 px-2.5 py-1 rounded-lg">
                      {act.items_count || 0} صنف
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(act)}
                      className="p-2 rounded-xl text-amber-600 hover:bg-amber-50 transition-colors"
                      title="تعديل النشاط"
                    >
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                    {!isCoreRestaurant && (
                      <button
                        onClick={() => handleDelete(act)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-colors"
                        title="حذف النشاط"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    )}
                  </div>

                  <a
                    href={`/?tab=${act.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl transition-colors"
                  >
                    <EyeIcon className="w-4 h-4" />
                    <span>معاينة بالرئيسية</span>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 5. Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 rtl" dir="rtl">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {formData.icon || '✨'}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {isEditing ? 'تعديل النشاط التجاري' : 'إضافة نشاط تجاري جديد'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    التحكم في بيانات النشاط ومسمياته وتصميمه
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors shadow-sm"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-grow text-xs sm:text-sm">
              {/* Row 1: Name & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    اسم النشاط *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleAutoFillLabels(e.target.value)}
                    placeholder="مثال: الكافيهات والحلويات، المخابز..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    الرمز الفريد (slug) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="مثال: cafe, bakery, supermarket..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-mono"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Row 2: Emoji Picker */}
              <div>
                <label className="block font-bold text-gray-700 mb-1.5">
                  أيقونة / إيموجي النشاط
                </label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {PRESET_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: emoji })}
                      className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition-all ${
                        formData.icon === emoji
                          ? 'bg-amber-500 text-white shadow-md scale-110 ring-2 ring-amber-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="أو اكتب أي إيموجي هنا..."
                  className="w-full max-w-xs px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500/20 outline-none text-base"
                />
              </div>

              {/* Row 3: Custom Place & Item Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    مسمى المكان / المتجر
                  </label>
                  <input
                    type="text"
                    value={formData.place_label}
                    onChange={(e) => setFormData({ ...formData, place_label: e.target.value })}
                    placeholder="مثال: مطعم، كافيه، مخبز، صيدلية..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">يظهر في البطاقات مثل: "جميع الكافيهات"، "معلومات الكافيه"</p>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    مسمى الصنف / المنتج
                  </label>
                  <input
                    type="text"
                    value={formData.item_label}
                    onChange={(e) => setFormData({ ...formData, item_label: e.target.value })}
                    placeholder="مثال: وجبة، مشروب، مخبوزات، منتج..."
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">يظهر في القوائم مثل: "أشهر المشروبات طلباً"، "لديك 3 وجبات بالسلة"</p>
                </div>
              </div>

              {/* Row 4: Description */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">
                  وصف مختصر عن النشاط
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="وصف للعملاء يوضح نوعية الخدمات والمنتجات..."
                  rows={2}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
                />
              </div>

              {/* Row 5: Banner Title & Subtitle */}
              <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/70">
                <h4 className="font-bold text-gray-900 text-xs uppercase flex items-center gap-1.5">
                  <span>🎨 تخصيص البانر الترويجي لهذا النشاط</span>
                </h4>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    عنوان البانر الرئيسي
                  </label>
                  <input
                    type="text"
                    value={formData.banner_title}
                    onChange={(e) => setFormData({ ...formData, banner_title: e.target.value })}
                    placeholder="مثال: استمتع بألذ أنواع القهوة المختصة والحلويات الفاخرة"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    وصف البانر الفرعي
                  </label>
                  <input
                    type="text"
                    value={formData.banner_subtitle}
                    onChange={(e) => setFormData({ ...formData, banner_subtitle: e.target.value })}
                    placeholder="مثال: اطلب الآن وتذوق المذاق الأصيل مع توصيل سريع وموثوق."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-white focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-700 mb-1.5">
                    تدرج لون البانر
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {PRESET_GRADIENTS.map((grad) => (
                      <button
                        key={grad.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, banner_bg: grad.value })}
                        className={`p-2 rounded-xl text-white text-[11px] font-bold text-center bg-gradient-to-r ${grad.value} transition-all ${
                          formData.banner_bg === grad.value ? 'ring-4 ring-amber-400 scale-[1.02] shadow-md' : 'opacity-85 hover:opacity-100'
                        }`}
                      >
                        {grad.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row 6: Sort Order & Is Active */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">
                    ترتيب الظهور
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-amber-500/20 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="is_active_check"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="is_active_check" className="font-bold text-gray-800 cursor-pointer select-none">
                    تفعيل النشاط فوراً وإظهاره في المنصة
                  </label>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-100 font-bold transition-colors"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white rounded-xl font-bold shadow-lg shadow-orange-500/25 transition-all transform active:scale-95 disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ...' : (isEditing ? 'حفظ التعديلات' : 'إضافة النشاط الآن')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminActivities
