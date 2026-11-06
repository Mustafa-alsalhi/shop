import React, { useState, useEffect } from 'react'
import restaurantService from '../../services/restaurantService'
import AdvertisementBanner from '../AdvertisementBanner'
import RestaurantCard from './RestaurantCard'
import FoodCard from './FoodCard'
import { getImageUrl, handleImageError, DEFAULT_CATEGORY_IMAGE } from '../../utils/imageUrl'
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const RestaurantSection = ({ hideBanner = false }) => {
  const [restaurants, setRestaurants] = useState([])
  const [categories, setCategories] = useState([])
  const [popularMeals, setPopularMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [sortBy, setSortBy] = useState('popular')

  // تحميل البيانات
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [restRes, catRes, mealsRes] = await Promise.all([
          restaurantService.getRestaurants({
            search: searchQuery,
            category_id: selectedCategory,
            open_only: openOnly,
            sort_by: sortBy
          }),
          restaurantService.getCategories(),
          restaurantService.getPopularMeals()
        ])

        if (restRes.success) setRestaurants(restRes.data || [])
        setCategories(Array.isArray(catRes) ? catRes : (catRes.data || []))
        if (mealsRes.success) setPopularMeals(mealsRes.data || [])
      } catch (err) {
        console.error('Error fetching restaurants section data:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchData()
    }, 250)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedCategory, openOnly, sortBy])

  return (
    <div id="activity-section-content" className="space-y-10 pb-16 rtl" dir="rtl">
      {/* 1. Advertisement Banner for Restaurants */}
      {!hideBanner && <AdvertisementBanner activityType="restaurant" />}

      {/* 2. Food Category Circles Carousel */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>التصنيفات الغذائية</span>
            </h2>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-amber-600 hover:text-amber-700 font-bold"
              >
                عرض الكل
              </button>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className="flex flex-col items-center gap-2 flex-shrink-0 group transition-transform active:scale-95"
                >
                  <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden p-1 border-2 transition-all ${
                    isSelected
                      ? 'border-amber-500 ring-4 ring-amber-100 shadow-lg scale-105'
                      : 'border-gray-100 hover:border-amber-300 shadow-sm'
                  }`}>
                    <img
                      src={getImageUrl(cat.image_url || cat.image, DEFAULT_CATEGORY_IMAGE)}
                      alt={cat.name}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => handleImageError(e, DEFAULT_CATEGORY_IMAGE)}
                      loading="lazy"
                    />
                  </div>
                  <span className={`text-xs font-bold transition-colors ${
                    isSelected ? 'text-amber-600' : 'text-gray-700 group-hover:text-amber-600'
                  }`}>
                    {cat.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. Search, Filter and Sort Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl shadow-sm border border-gray-100">
        <div className="relative flex-1 max-w-md">
          <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مطعمك المفضل أو وجبتك (برجر، مندي، بيتزا...)"
              className="w-full py-2 px-2 bg-transparent text-gray-800 placeholder-gray-400 text-xs sm:text-sm focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-gray-400 hover:text-gray-600 px-2.5 font-bold"
              >
                مسح
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setOpenOnly(!openOnly)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                openOnly
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${openOnly ? 'bg-white' : 'bg-emerald-500'}`}></span>
              المفتوحة الآن فقط
            </button>

            <button
              onClick={() => setSortBy(sortBy === 'rating' ? 'popular' : 'rating')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                sortBy === 'rating'
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <StarIcon className="w-3.5 h-3.5" />
              الأعلى تقييماً
            </button>
          </div>

          <span className="text-xs text-gray-400 font-medium mr-1">
            تم العثور على {restaurants.length} مطعم
          </span>
        </div>
      </div>

      {/* 4. Popular & Delicious Meals Section */}
      {popularMeals.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <FireIcon className="w-6 h-6 text-rose-500" />
                <span>أشهر الوجبات طلباً</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                وجبات مفضلة لدى عملائنا يمكنك طلبها وتخصيصها بضغطة زر
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularMeals.slice(0, 6).map((meal) => (
              <FoodCard
                key={meal.id}
                meal={meal}
                restaurant={meal.seller}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Restaurants Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900">
              جميع المطاعم
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              اختر مطعمك المفضل واكتشف قائمته وأوقات عمله
            </p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-72 animate-pulse border border-gray-100">
                <div className="h-44 bg-gray-200 rounded-t-2xl"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">لا توجد مطاعم مطابقة لبحثك</h3>
            <p className="text-xs text-gray-500">جرب البحث بكلمات أخرى أو إزالة الفلاتر المحددة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantSection
