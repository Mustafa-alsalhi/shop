import api from './api'

export const activityService = {
  // جلب الأنشطة التجارية المفعلة
  getActivities: async () => {
    const response = await api.get('/activities')
    return response.data
  },

  // تفاصيل نشاط معين بالرمز أو المعرف
  getActivity: async (slugOrId) => {
    const response = await api.get(`/activities/${slugOrId}`)
    return response.data
  },

  // جلب الأماكن / المتاجر التابعة لنشاط معين
  getActivityPlaces: async (slugOrId, params = {}) => {
    const response = await api.get(`/activities/${slugOrId}/places`, { params })
    return response.data
  },

  // جلب تصنيفات نشاط معين
  getActivityCategories: async (slugOrId) => {
    const response = await api.get(`/activities/${slugOrId}/categories`)
    return response.data
  },

  // جلب الأصناف الأكثر طلباً لهذا النشاط
  getActivityPopularItems: async (slugOrId, params = {}) => {
    const response = await api.get(`/activities/${slugOrId}/popular-items`, { params })
    return response.data
  },

  // تفاصيل أي مكان / متجر / مطعم تابع لأي نشاط
  getPlaceDetail: async (id, params = {}) => {
    const response = await api.get(`/activities/places/${id}`, { params })
    return response.data
  },

  /* -------------------------------------------------------------
   * وظائف لوحة تحكم المدير (Admin API)
   * ------------------------------------------------------------- */

  // جلب كافة الأنشطة للمدير مع الإحصائيات
  getAdminActivities: async () => {
    const response = await api.get('/admin/activities')
    return response.data
  },

  // إنشاء نشاط جديد
  createActivity: async (data) => {
    const response = await api.post('/admin/activities', data)
    return response.data
  },

  // تحديث نشاط
  updateActivity: async (id, data) => {
    const response = await api.put(`/admin/activities/${id}`, data)
    return response.data
  },

  // حذف نشاط
  deleteActivity: async (id) => {
    const response = await api.delete(`/admin/activities/${id}`)
    return response.data
  },

  // تبديل حالة التفعيل
  toggleActivity: async (id) => {
    const response = await api.patch(`/admin/activities/${id}/toggle`)
    return response.data
  },
}

export default activityService
