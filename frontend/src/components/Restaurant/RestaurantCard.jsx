import React from 'react'
import { Link } from 'react-router-dom'
import { StarIcon, ClockIcon, MapPinIcon, TruckIcon } from '@heroicons/react/24/solid'
import { SparklesIcon } from '@heroicons/react/24/outline'
import { getImageUrl, handleImageError, DEFAULT_RESTAURANT_AVATAR, DEFAULT_RESTAURANT_COVER } from '../../utils/imageUrl'

const RestaurantCard = ({ restaurant }) => {
  const {
    id,
    name,
    avatar,
    cover_image,
    rating,
    reviews_count,
    is_open,
    preparation_time,
    cuisine_type,
    min_order_amount,
    distance_km,
    delivery_fee,
    meals_count
  } = restaurant

  return (
    <Link
      to={`/restaurant/${id}`}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full transform hover:-translate-y-1"
    >
      {/* Cover Image & Badges */}
      <div className="relative h-44 w-full overflow-hidden bg-gray-100">
        <img
          src={getImageUrl(cover_image, DEFAULT_RESTAURANT_COVER)}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => handleImageError(e, DEFAULT_RESTAURANT_COVER)}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>

        {/* Status Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md shadow-sm transition-all duration-200">
          {is_open ? (
            <span className="bg-emerald-500/90 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              مفتوح الآن
            </span>
          ) : (
            <span className="bg-rose-500/90 text-white px-2.5 py-0.5 rounded-full shadow">
              مغلق حالياً
            </span>
          )}
        </div>

        {/* Preparation Time Badge */}
        {preparation_time && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5 font-medium">
            <ClockIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>{preparation_time}</span>
          </div>
        )}

        {/* Rating Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-gray-900 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold shadow-sm">
          <StarIcon className="w-3.5 h-3.5 text-amber-400" />
          <span>{Number(rating).toFixed(1)}</span>
          <span className="text-gray-400 font-normal">({reviews_count})</span>
        </div>
      </div>

      {/* Restaurant Info */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Logo and Name */}
        <div className="flex items-start gap-3">
          <div className="relative -mt-8 flex-shrink-0">
            <img
              src={getImageUrl(avatar, DEFAULT_RESTAURANT_AVATAR)}
              alt={name}
              className="w-13 h-13 sm:w-14 sm:h-14 rounded-xl object-cover border-2 border-white shadow-md bg-white"
              onError={(e) => handleImageError(e, DEFAULT_RESTAURANT_AVATAR)}
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-amber-600 transition-colors line-clamp-1">
              {name}
            </h3>
            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
              {cuisine_type || 'مأكولات متنوعة'}
            </p>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-1 text-gray-500">
            <TruckIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>توصيل: {delivery_fee ? `${delivery_fee} $` : '15 $'}</span>
          </div>

          {distance_km && (
            <div className="flex items-center gap-1 text-gray-500">
              <MapPinIcon className="w-3.5 h-3.5 text-rose-500" />
              <span>{distance_km} كم</span>
            </div>
          )}

          {min_order_amount > 0 && (
            <span className="text-gray-400">
              حد أدنى: {min_order_amount} $
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default RestaurantCard
