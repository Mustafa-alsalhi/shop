import React, { useState } from 'react'
import { PlusIcon, ClockIcon, StarIcon } from '@heroicons/react/24/solid'
import FoodOptionsModal from './FoodOptionsModal'
import { getImageUrl, handleImageError, DEFAULT_MEAL_IMAGE } from '../../utils/imageUrl'

const FoodCard = ({ meal, restaurant }) => {
  const [modalOpen, setModalOpen] = useState(false)

  const {
    id,
    name,
    description,
    price,
    sale_price,
    image_url,
    preparation_time,
    rating,
    is_available
  } = meal

  const currentPrice = sale_price ? Number(sale_price).toFixed(2) : Number(price).toFixed(2)
  const oldPrice = sale_price ? Number(price).toFixed(2) : null

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 hover:border-amber-200 shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 flex gap-4 items-center group">
        {/* Meal Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-amber-600 transition-colors line-clamp-1">
            {name}
          </h4>

          {description && (
            <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
              {description}
            </p>
          )}

          {/* Pricing and prep time */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-base sm:text-lg font-bold text-gray-900 font-mono">
                {currentPrice} $
              </span>
              {oldPrice && (
                <span className="text-xs text-gray-400 line-through font-mono">
                  {oldPrice} $
                </span>
              )}
            </div>

            {preparation_time && (
              <span className="text-[11px] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                <ClockIcon className="w-3 h-3 text-amber-500" />
                {preparation_time} دقيقة
              </span>
            )}
          </div>
        </div>

        {/* Image & Action */}
        <div className="relative flex-shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-gray-50">
          <img
            src={getImageUrl(image_url, DEFAULT_MEAL_IMAGE)}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => handleImageError(e, DEFAULT_MEAL_IMAGE)}
            loading="lazy"
          />

          {/* Add / Customize Button overlay */}
          <button
            onClick={() => setModalOpen(true)}
            className="absolute bottom-1.5 left-1.5 bg-amber-500 hover:bg-amber-600 text-white p-1.5 sm:px-2.5 sm:py-1 rounded-lg text-xs font-bold shadow-md flex items-center gap-1 transition-transform active:scale-90"
            title="تخصيص وإضافة"
          >
            <PlusIcon className="w-4 h-4" />
            <span className="hidden sm:inline">إضافة</span>
          </button>
        </div>
      </div>

      {/* Options Modal */}
      {modalOpen && (
        <FoodOptionsModal
          meal={meal}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          restaurant={restaurant}
        />
      )}
    </>
  )
}

export default FoodCard
