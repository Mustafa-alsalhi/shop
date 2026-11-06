import api from './api'

export const restaurantService = {
  // جلب المطاعم مع الفلاتر
  getRestaurants: async (params = {}) => {
    const response = await api.get('/restaurants', { params })
    return response.data
  },

  // المطاعم المميزة
  getFeaturedRestaurants: async () => {
    const response = await api.get('/restaurants/featured')
    return response.data
  },

  // تفاصيل المطعم الكاملة مع قائمة الوجبات
  getRestaurant: async (id, params = {}) => {
    const response = await api.get(`/restaurants/${id}`, { params })
    return response.data
  },

  // تصنيفات المأكولات والمطاعم
  getCategories: async () => {
    const response = await api.get('/restaurant-categories')
    return response.data
  },

  // الوجبات الأكثر طلباً
  getPopularMeals: async (params = {}) => {
    const response = await api.get('/restaurants/meals', { params })
    return response.data
  },
}

export default restaurantService
