import React, { useState, useEffect } from 'react'
import activityService from '../../services/activityService'
import AdvertisementBanner from '../AdvertisementBanner'
import RestaurantCard from '../Restaurant/RestaurantCard'
import FoodCard from '../Restaurant/FoodCard'
import { getImageUrl, handleImageError, DEFAULT_CATEGORY_IMAGE } from '../../utils/imageUrl'
import {
  MagnifyingGlassIcon,
  SparklesIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline'

const ActivitySection = ({ activity, hideBanner = false }) => {
  const [places, setPlaces] = useState([])
  const [categories, setCategories] = useState([])
  const [popularItems, setPopularItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [openOnly, setOpenOnly] = useState(false)
  const [sortBy, setSortBy] = useState('popular')

  const slug = activity?.slug || 'restaurant'
  const placeLabel = activity?.place_label || 'مكان'
  const itemLabel = activity?.item_label || 'صنف'

  // إعادة ضبط الفلاتر عند تغيير النشاط
  useEffect(() => {
    setSelectedCategory(null)
    setSearchQuery('')
  }, [slug])

  // تحميل بيانات هذا النشاط
  useEffect(() => {
    let isMounted = true

    const fetchData = async () => {
      try {
        setLoading(true)
        const [placesRes, catRes, itemsRes] = await Promise.all([
          activityService.getActivityPlaces(slug, {
            search: searchQuery,
            category_id: selectedCategory,
            open_only: openOnly,
            sort_by: sortBy
          }),
          activityService.getActivityCategories(slug),
          activityService.getActivityPopularItems(slug)
        ])

        if (isMounted) {
          if (placesRes && placesRes.success) setPlaces(placesRes.data || [])
          setCategories(Array.isArray(catRes) ? catRes : (catRes?.data || []))
          if (itemsRes && itemsRes.success) setPopularItems(itemsRes.data || [])
        }
      } catch (err) {
        console.error('Error fetching activity section data:', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    const timer = setTimeout(() => {
      fetchData()
    }, 200)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [slug, searchQuery, selectedCategory, openOnly, sortBy])

  return (
    <div id="activity-section-content" className="space-y-10 pb-16 rtl" dir="rtl">
      {/* 1. Advertisement Banner for this activity (if not already rendered above by Home.jsx) */}
      {!hideBanner && <AdvertisementBanner activityType={slug} />}

      {/* 2. Activity Category Carousel */}
      {categories.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <span>التصنيفات الخاصة بـ {activity?.name || 'النشاط'}</span>
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
                      : 'border-gray-100 hover:border-amber-300 shadow-sm bg-white'
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
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <div className="relative flex items-center bg-gray-50 rounded-xl border border-gray-200 focus-within:border-amber-500 focus-within:ring-2 focus-within:ring-amber-500/20 transition-all">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`ابحث عن ${placeLabel} أو ${itemLabel}...`}
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

        {/* Filter Pills & Count */}
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
            تم العثور على {places.length} {placeLabel}
          </span>
        </div>
      </div>

      {/* 4. Popular Items Section for this Activity */}
      {popularItems.length > 0 && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
                <FireIcon className="w-6 h-6 text-rose-500" />
                <span>أشهر {itemLabel === 'وجبة' ? 'الوجبات' : itemLabel === 'مشروب' ? 'المشروبات' : 'الأصناف'} طلباً</span>
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                أصناف مفضلة لدى عملائنا يمكنك طلبها وتخصيصها بضغطة زر
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularItems.slice(0, 6).map((item) => (
              <FoodCard
                key={item.id}
                meal={item}
                restaurant={item.seller}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Places Grid for this Activity */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 flex items-center gap-2">
              <span>{activity?.icon || '🏬'}</span>
              <span>جميع {activity?.name || 'الأماكن'}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              اختر {placeLabel} المفضل لديك واكتشف القائمة ومواعيد العمل
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
        ) : places.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            <SparklesIcon className="w-12 h-12 text-amber-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-gray-800 mb-1">
              لا توجد {placeLabel} مطابقة لبحثك حالياً
            </h3>
            <p className="text-xs text-gray-500">جرب البحث بكلمات أخرى أو إزالة الفلاتر المحددة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <RestaurantCard
                key={place.id}
                restaurant={place}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivitySection
