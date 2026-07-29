import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon, EyeIcon, ChartBarIcon, CurrencyDollarIcon, TruckIcon, MapPinIcon, PresentationChartLineIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

const Drivers = () => {
    const [drivers, setDrivers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    // Analytics state
    const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false)
    const [driverStats, setDriverStats] = useState(null)
    const [loadingStats, setLoadingStats] = useState(false)
    const [filterStatus, setFilterStatus] = useState('all')

    // Edit form state
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        phone: '',
        emergency_contact_phone: '',
        vehicle_type: '',
        vehicle_plate_number: '',
        kuraimi_account: '',
        personal_photo_file: null,
        id_card_image_file: null,
    })

    useEffect(() => {
        fetchDrivers()
    }, [])

    const fetchDrivers = async () => {
        try {
            setLoading(true)
            const response = await api.get('/admin/drivers')
            if (response.data.status === 'success') {
                setDrivers(response.data.data)
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب بيانات المناديب')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        const isConfirmed = window.confirm('هل أنت متأكد؟ لن تتمكن من استعادة بيانات هذا المندوب!');

        if (isConfirmed) {
            try {
                await api.delete(`/admin/drivers/${id}`)
                toast.success('تم حذف المندوب بنجاح')
                fetchDrivers()
            } catch (error) {
                toast.error('حدث خطأ أثناء الحذف')
            }
        }
    }

    const openAnalyticsModal = async (driver) => {
        setIsAnalyticsModalOpen(true)
        setLoadingStats(true)
        setDriverStats(null)
        setSelectedDriver(driver)
        
        try {
            const res = await api.get(`/admin/drivers/${driver.id}/statistics`)
            if (res.data.status === 'success') {
                setDriverStats(res.data.data)
            }
        } catch (error) {
            toast.error('حدث خطأ أثناء جلب تفاصيل أرباح المندوب')
        } finally {
            setLoadingStats(false)
        }
    }

    const openEditModal = (driver) => {
        setSelectedDriver(driver)
        setFormData({
            first_name: driver.first_name || '',
            last_name: driver.last_name || '',
            email: driver.email || '',
            password: '',
            phone: driver.phone || '',
            emergency_contact_phone: driver.driver?.emergency_contact_phone || '',
            vehicle_type: driver.driver?.vehicle_type || '',
            vehicle_plate_number: driver.driver?.vehicle_plate_number || '',
            kuraimi_account: driver.driver?.kuraimi_account || '',
            personal_photo_file: null,
            id_card_image_file: null,
        })
        setIsEditModalOpen(true)
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleFileChange = (e, field) => {
        const file = e.target.files[0]
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('يجب أن يكون حجم الملف أقل من 5MB')
                return
            }
            setFormData(prev => ({ ...prev, [field]: file }))
        }
    }

    const handleUpdate = async (e) => {
        e.preventDefault()
        setSaving(true)

        try {
            const submitData = new FormData()
            
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null && formData[key] !== '') {
                    submitData.append(key, formData[key])
                }
            })

            const token = localStorage.getItem('token')
            const apiUrl = import.meta.env.VITE_API_URL || '/api'

            // Using POST to allow multipart FormData updates
            const response = await fetch(`${apiUrl}/admin/drivers/${selectedDriver.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            })

            if (response.ok) {
                toast.success('تم التحديث بنجاح')
                setIsEditModalOpen(false)
                fetchDrivers()
            } else {
                const errorData = await response.json().catch(() => ({}))
                toast.error(errorData.message || 'حدث خطأ أثناء التحديث')
            }
        } catch (error) {
            toast.error('حدث خطأ في الاتصال بالخادم')
        } finally {
            setSaving(false)
        }
    }

    const getFullUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000';
        return `${baseUrl}/storage/${url.startsWith('/') ? url.slice(1) : url}`;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">إدارة مناديب التوصيل</h1>
                    <p className="text-gray-600 text-sm mt-1">تعديل وحذف واستعراض بيانات المناديب</p>
                </div>
                <Link
                    to="/admin/drivers/new"
                    className="w-full sm:w-auto justify-center bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md"
                >
                    <PlusIcon className="w-5 h-5 font-bold" />
                    <span className="font-semibold">إضافة مندوب جديد</span>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider text-center">المندوب</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider text-center">رقم الهاتف</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider text-center">نوع المركبة</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider text-center">حساب الكريمي</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider text-center">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200 text-center">
                                {drivers.map((driver) => (
                                    <tr key={driver.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                    {driver.driver?.personal_photo ? (
                                                        <img src={driver.driver.personal_photo} alt="صورة المندوب" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-blue-600 font-bold">{driver.first_name?.[0]}</span>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-medium text-gray-900">{driver.name}</div>
                                                    <div className="text-xs text-gray-500">{driver.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div dir="ltr">{driver.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                driver.driver?.vehicle_type === 'car' ? 'bg-green-100 text-green-800' :
                                                driver.driver?.vehicle_type === 'motorcycle' ? 'bg-orange-100 text-orange-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {driver.driver?.vehicle_type === 'motorcycle' ? 'دراجة نارية' :
                                                 driver.driver?.vehicle_type === 'car' ? 'سيارة' :
                                                 driver.driver?.vehicle_type === 'van' ? 'شاحنة/باص' : 'غير محدد'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {driver.driver?.kuraimi_account || 'غير محدد'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium w-full flex-wrap sm:flex-nowrap space-x-reverse space-x-2 flex justify-center items-center gap-y-2">
                                            <button 
                                                onClick={() => openAnalyticsModal(driver)}
                                                className="text-white hover:bg-green-700 bg-green-600 p-2 text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                                title="أرباح وتقارير المندوب"
                                            >
                                                <PresentationChartLineIcon className="w-5 h-5" />
                                                <span className="hidden sm:inline">تفاصيل الأرباح</span>
                                            </button>
                                            
                                            {driver.driver?.id_card_image && (
                                                <a 
                                                    href={getFullUrl(driver.driver.id_card_image)} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    title="عرض الهوية"
                                                    className="text-amber-500 hover:text-amber-700 bg-amber-50 p-2 rounded-lg"
                                                >
                                                    <EyeIcon className="w-5 h-5" />
                                                </a>
                                            )}
                                            <button 
                                                onClick={() => openEditModal(driver)}
                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 p-2 rounded-lg"
                                                title="تعديل"
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(driver.id)}
                                                className="text-red-500 hover:text-red-700 bg-red-50 p-2 rounded-lg"
                                                title="حذف"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {drivers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            لا يوجد أي مناديب مسجلين بعد.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-[0.65] backdrop-blur-sm transition-opacity" onClick={() => !saving && setIsEditModalOpen(false)}></div>
                        
                        <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100">
                                <h3 className="text-xl font-bold text-gray-900">تعديل المندوب: {selectedDriver?.name}</h3>
                                <button 
                                    onClick={() => !saving && setIsEditModalOpen(false)}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <form onSubmit={handleUpdate} className="p-6">
                                <div className="space-y-4 max-h-[60vh] overflow-y-auto px-2">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأول</label>
                                            <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم الأخير</label>
                                            <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني</label>
                                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">تغيير كلمة المرور</label>
                                            <input type="text" name="password" value={formData.password} onChange={handleInputChange} placeholder="اتركه فارغاً لعدم التغيير" className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">الهاتف المحمول</label>
                                            <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">رقم الطوارئ</label>
                                            <input type="text" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">حساب الكريمي</label>
                                            <input type="text" name="kuraimi_account" value={formData.kuraimi_account} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">نوع المركبة</label>
                                            <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500">
                                                <option value="">غير محدد</option>
                                                <option value="motorcycle">دراجة نارية</option>
                                                <option value="car">سيارة</option>
                                                <option value="van">باص / شاحنة</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4 pt-4 mt-4 border-t">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">تحديث الصورة الشخصية</label>
                                            {selectedDriver?.driver?.personal_photo && (
                                                <a href={selectedDriver.driver.personal_photo} target="_blank" className="text-xs text-blue-600 block mb-1">عرض الصورة الحالية</a>
                                            )}
                                            <input type="file" onChange={(e) => handleFileChange(e, 'personal_photo_file')} className="w-full text-sm border p-1 rounded-md" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">تحديث وثيقة الهوية</label>
                                            {selectedDriver?.driver?.id_card_image && (
                                                <a href={getFullUrl(selectedDriver.driver.id_card_image)} target="_blank" className="text-xs text-blue-600 block mb-1">عرض الوثيقة الحالية</a>
                                            )}
                                            <input type="file" onChange={(e) => handleFileChange(e, 'id_card_image_file')} className="w-full text-sm border p-1 rounded-md" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditModalOpen(false)}
                                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Analytics Modal (Driver Profits and Performance) */}
            {isAnalyticsModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex flex-col justify-center items-center p-2 sm:p-4">
                    <div className="bg-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mt-4 sm:mt-0">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 sm:p-6 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg"><PresentationChartLineIcon className="w-6 h-6 sm:w-7 sm:h-7" /></div>
                                <div>
                                    <h2 className="text-sm sm:text-xl font-bold line-clamp-1">الأداء المالي للمندوب</h2>
                                    <p className="text-green-100 text-xs sm:text-sm mt-0.5 line-clamp-1">{selectedDriver?.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAnalyticsModalOpen(false)} className="text-green-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors flex-shrink-0">
                                <XMarkIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                            </button>
                        </div>

                        <div className="p-3 sm:p-6 overflow-y-auto flex-1">
                            {loadingStats ? (
                                <div className="flex flex-col justify-center items-center h-48 space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                                    <p className="text-gray-500 font-medium">جاري تحليل الأرباح والطلبات...</p>
                                </div>
                            ) : driverStats ? (
                                <div className="space-y-6">
                                    {/* 4 Cards Summary */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 transform hover:-translate-y-1 transition-transform">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TruckIcon className="w-5 h-5" /></div>
                                                <p className="text-sm font-bold text-gray-600">إجمالي الطلبات</p>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900">{driverStats.total_orders}</p>
                                        </div>

                                        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 transform hover:-translate-y-1 transition-transform">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircleIcon className="w-5 h-5" /></div>
                                                <p className="text-sm font-bold text-gray-600">تم التسليم</p>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900">{driverStats.completed_orders_count}</p>
                                        </div>

                                        <div className="bg-white rounded-xl shadow border border-gray-100 p-5 transform hover:-translate-y-1 transition-transform">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><ClockIcon className="w-5 h-5" /></div>
                                                <p className="text-sm font-bold text-gray-600">قيد/فشل التسليم</p>
                                            </div>
                                            <p className="text-2xl font-black text-gray-900">{driverStats.incomplete_orders_count}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl shadow-lg border border-green-600 p-5 transform hover:-translate-y-1 transition-transform shadow-green-500/30">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-white/20 text-white rounded-lg"><CurrencyDollarIcon className="w-5 h-5" /></div>
                                                <p className="text-sm font-bold">صافي الأرباح العام</p>
                                            </div>
                                            <p className="text-2xl font-black">{Number(driverStats.total_profit).toFixed(2)} <span className="text-xs font-normal opacity-80">ريال</span></p>
                                            <p className="text-[10px] mt-1 opacity-90">معدل العموله: {driverStats.profit_percentage}</p>
                                        </div>
                                    </div>

                                    {/* Time-Based Profits */}
                                    <div className="bg-green-50/50 rounded-xl p-5 border border-green-100">
                                        <h3 className="text-sm font-bold text-green-800 mb-4 flex items-center gap-2">
                                            <ChartBarIcon className="w-5 h-5" />
                                            تفصيل الأرباح الزمنية
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-50">
                                                <p className="text-xs text-gray-500 font-bold mb-1">اليوم</p>
                                                <p className="text-lg font-black text-green-600">{Number(driverStats.profit_today).toFixed(2)} <span className="text-xs font-normal text-gray-400">ريال</span></p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-50">
                                                <p className="text-xs text-gray-500 font-bold mb-1">هذا الأسبوع</p>
                                                <p className="text-lg font-black text-green-600">{Number(driverStats.profit_week).toFixed(2)} <span className="text-xs font-normal text-gray-400">ريال</span></p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-50">
                                                <p className="text-xs text-gray-500 font-bold mb-1">هذا الشهر</p>
                                                <p className="text-lg font-black text-green-600">{Number(driverStats.profit_month).toFixed(2)} <span className="text-xs font-normal text-gray-400">ريال</span></p>
                                            </div>
                                            <div className="bg-white rounded-lg p-3 shadow-sm border border-green-50">
                                                <p className="text-xs text-gray-500 font-bold mb-1">هذا العام</p>
                                                <p className="text-lg font-black text-green-600">{Number(driverStats.profit_year).toFixed(2)} <span className="text-xs font-normal text-gray-400">ريال</span></p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map Link / Live Location Info Placeholder */}
                                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-blue-800">
                                            <MapPinIcon className="w-5 h-5" />
                                            <p className="font-semibold text-sm">موقع المندوب الجغرافي وحالته:</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${selectedDriver?.is_online ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-gray-200 text-gray-600'}`}>
                                            {selectedDriver?.is_online ? 'متصل وحي' : 'غير متصل'}
                                        </span>
                                    </div>

                                    {/* Latest Orders Table for the driver */}
                                    <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50">
                                            <div className="flex items-center gap-2">
                                                <TruckIcon className="w-5 h-5 text-gray-500" />
                                                <h3 className="font-bold text-gray-800 text-sm">سجل التوصيلات والعمليات</h3>
                                            </div>
                                            <select 
                                                value={filterStatus}
                                                onChange={(e) => setFilterStatus(e.target.value)}
                                                className="bg-white border border-gray-300 text-gray-700 text-xs font-bold rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                            >
                                                <option value="all">جميع الطلبات</option>
                                                <option value="delivered">المكتملة (تم التوصيل)</option>
                                                <option value="pending">قيد الانتظار / قيد المعالجة</option>
                                                <option value="cancelled">الملغية / المرفوضة</option>
                                            </select>
                                        </div>
                                        <div className="overflow-x-auto max-h-72 overflow-y-auto">
                                            <table className="min-w-full divide-y divide-gray-100">
                                                <thead className="bg-white sticky top-0 shadow-sm z-10">
                                                    <tr>
                                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500">رقم الطلب</th>
                                                        <th className="px-4 py-2 text-right text-xs font-bold text-gray-500">اسم العميل</th>
                                                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-500">الحالة</th>
                                                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-500">رسوم التوصيل</th>
                                                        <th className="px-4 py-2 text-center text-xs font-bold text-green-600 bg-green-50/[0.3]">أرباح المندوب</th>
                                                        <th className="px-4 py-2 text-center text-xs font-bold text-gray-500">التاريخ</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50">
                                                    {driverStats.recent_orders?.length > 0 ? (
                                                        driverStats.recent_orders.filter(o => {
                                                            if (filterStatus === 'all') return true;
                                                            if (filterStatus === 'delivered' && o.status === 'delivered') return true;
                                                            if (filterStatus === 'cancelled' && (o.status === 'cancelled' || o.status === 'rejected')) return true;
                                                            if (filterStatus === 'pending' && !['delivered', 'cancelled', 'rejected'].includes(o.status)) return true;
                                                            return false;
                                                        }).map((o, idx) => (
                                                            <tr key={idx} className="hover:bg-gray-50/50">
                                                                <td className="px-4 py-3 text-sm font-bold text-gray-800">#{o.order_number}</td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 font-medium">{o.customer_name}</td>
                                                                <td className="px-4 py-3 text-center">
                                                                    <span className={`px-2 py-1 text-xs rounded-full font-bold ${
                                                                        o.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                                                                        o.status === 'cancelled' || o.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                                                        'bg-yellow-100 text-yellow-800'
                                                                    }`}>
                                                                        {o.status === 'delivered' ? 'مكتمل' : o.status === 'cancelled' ? 'ملغي' : o.status === 'rejected' ? 'مرفوض' : o.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600 text-center">{Number(o.shipping_fee).toFixed(2)}</td>
                                                                <td className="px-4 py-3 text-sm text-green-600 font-black text-center bg-green-50/[0.3]">{Number(o.driver_profit).toFixed(2)} ر.ي</td>
                                                                <td className="px-4 py-3 text-xs text-gray-400 text-center" dir="ltr">{o.created_at}</td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr><td colSpan="6" className="p-6 text-center text-gray-400">لا توجد سجلات مطابقة.</td></tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Drivers
