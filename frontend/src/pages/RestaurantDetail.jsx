import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import restaurantService from '../services/restaurantService'
import activityService from '../services/activityService'
import FoodCard from '../components/Restaurant/FoodCard'
import {
  StarIcon,
  ClockIcon,
  MapPinIcon,
  TruckIcon,
  InformationCircleIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ShoppingBagIcon,
  SparklesIcon
} from '@heroicons/react/24/solid'
import { useSelector } from 'react-redux'
import { getImageUrl, handleImageError, DEFAULT_RESTAURANT_AVATAR, DEFAULT_RESTAURANT_COVER } from '../utils/imageUrl'

const RestaurantDetail = () => {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('')
  const [error, setError] = useState(null)

  const cartItems = useSelector(state => state.cart?.items || [])
  const cartRestaurantCount = cartItems.filter(item => item.product?.seller_id === Number(id)).length

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true)
        let res = null
        try {
          res = await activityService.getPlaceDetail(id)
        } catch (e) {
          res = await restaurantService.getRestaurant(id)
        }

        if (res && res.success && res.data) {
          setRestaurant(res.data)
          if (res.data.menu_sections?.length > 0) {
            setActiveCategory(res.data.menu_sections[0].category_name)
          }
        } else {
          setError('لم نتمكن من العثور على المكان المطلوب')
        }
      } catch (err) {
        console.error('Error loading restaurant detail:', err)
        setError('تعذر تحميل بيانات المكان، يرجى المحاولة لاحقاً')
      } finally {
        setLoading(false)
      }
    }

    fetchDetails()
  }, [id])

  const placeLabel = restaurant?.place_label || 'المطعم'
  const itemLabel = restaurant?.item_label || 'وجبة'

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 rtl" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-500 text-sm font-medium">جاري تحميل قائمة {placeLabel} الشهية...</p>
        </div>
      </div>
    )
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-[70vh] bg-gray-50 flex flex-col items-center justify-center p-6 text-center rtl" dir="rtl">
        <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
          <InformationCircleIcon className="w-9 h-9" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'المطعم غير متاح'}</h2>
        <Link
          to="/"
          className="mt-4 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md transition-colors inline-flex items-center gap-2"
        >
          <ArrowRightIcon className="w-4 h-4" />
          العودة للرئيسية
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/60 pb-20 rtl" dir="rtl">
      {/* Cover Image Header */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full bg-gray-900 overflow-hidden">
        <img
          src={getImageUrl(restaurant.cover_image, DEFAULT_RESTAURANT_COVER)}
          alt={restaurant.name}
          className="w-full h-full object-cover opacity-85"
          onError={(e) => handleImageError(e, DEFAULT_RESTAURANT_COVER)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-black/30 to-transparent"></div>

        {/* Back Button */}
        <Link
          to="/"
          className="absolute top-6 right-6 z-10 bg-white/80 hover:bg-white text-gray-800 p-2.5 rounded-full shadow-lg backdrop-blur-md transition-all flex items-center gap-1.5 text-xs font-bold"
        >
          <ArrowRightIcon className="w-4 h-4" />
          <span>الرئيسية</span>
        </Link>
      </div>

      {/* Restaurant Header Info Card */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-24 sm:-mt-28 z-20">
        <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex gap-4 sm:gap-6 items-center">
            {/* Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-white">
              <img
                src={getImageUrl(restaurant.avatar, DEFAULT_RESTAURANT_AVATAR)}
                alt={restaurant.name}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, DEFAULT_RESTAURANT_AVATAR)}
              />
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-gray-900">
                  {restaurant.name}
                </h1>
                {restaurant.is_open ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    مفتوح للطلب
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                    مغلق حالياً
                  </span>
                )}
              </div>

              <p className="text-gray-500 text-xs sm:text-sm mt-1.5 max-w-xl line-clamp-2">
                {restaurant.description}
              </p>

              {/* Badges */}
              <div className="flex items-center gap-4 mt-3 flex-wrap text-xs text-gray-600 font-medium">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg">
                  <StarIcon className="w-4 h-4 text-amber-500" />
                  <span className="font-bold">{Number(restaurant.rating).toFixed(1)}</span>
                  <span className="text-gray-400 font-normal">({restaurant.reviews_count} تقييم)</span>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <ClockIcon className="w-4 h-4 text-gray-500" />
                  <span>التحضير: {restaurant.preparation_time}</span>
                </div>

                <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-lg">
                  <TruckIcon className="w-4 h-4 text-amber-500" />
                  <span>توصيل: {restaurant.delivery_fee} $</span>
                </div>

                {restaurant.address && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />
                    <span>{restaurant.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Cart Indicator if any */}
          {cartRestaurantCount > 0 && (
            <Link
              to="/cart"
              className="w-full md:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <ShoppingBagIcon className="w-5 h-5" />
              <span>لديك {cartRestaurantCount} {itemLabel === 'وجبة' ? 'وجبات' : 'أصناف'} في السلة</span>
              <ChevronLeftIcon className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Menu Sections Navigation */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        {restaurant.menu_sections?.length > 0 && (
          <div className="sticky top-20 z-30 bg-white/90 backdrop-blur-md py-3 px-2 rounded-2xl shadow-sm border border-gray-100 mb-8 overflow-x-auto scrollbar-none flex gap-2">
            {restaurant.menu_sections.map((section, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveCategory(section.category_name)
                  const el = document.getElementById(`section-${idx}`)
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  activeCategory === section.category_name
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {section.category_name} ({section.meals?.length || 0})
              </button>
            ))}
          </div>
        )}

        {/* Menu Items Grouped */}
        {restaurant.menu_sections?.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-500 shadow-sm border border-gray-100">
            <SparklesIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-base font-semibold">لم يقم {placeLabel} بإضافة أصناف بعد إلى القائمة.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {restaurant.menu_sections.map((section, sIdx) => (
              <div key={sIdx} id={`section-${sIdx}`} className="space-y-4 scroll-mt-36">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-6 bg-amber-500 rounded-full"></div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {section.category_name}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {section.meals.map((meal) => (
                    <FoodCard
                      key={meal.id}
                      meal={meal}
                      restaurant={restaurant}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RestaurantDetail
