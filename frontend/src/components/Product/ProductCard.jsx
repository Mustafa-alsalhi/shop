import React from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  HeartIcon,
  StarIcon,
  EyeIcon,
} from '@heroicons/react/24/outline'
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid'
import {
  addToWishlist,
  removeFromWishlist,
  selectWishlistItems,
  selectIsInWishlist
} from '../../store/slices/wishlistSlice'
import { showSuccessNotification } from '../../store/slices/uiSlice'

const ProductCard = ({ product }) => {
  const dispatch = useDispatch()
  const wishlistItems = useSelector(selectWishlistItems)

  // Check if product is in wishlist
  const isWishlisted = wishlistItems.some(item => item.id === product.id)

  // Helper function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://picsum.photos/seed/product/300x300.jpg'

    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-8385.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')

    // If it's a relative path starting with /images/, convert to full URL
    if (imagePath.startsWith('/images/')) {
      return `${publicUrl}${imagePath}`
    }

    // If it's already a full URL, use it as is
    if (imagePath.startsWith('http')) {
      return imagePath
    }

    // If it's a placeholder URL, use fallback
    if (imagePath.includes('via.placeholder.com')) {
      return `https://picsum.photos/seed/${product.name?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
    }

    // Otherwise, treat as relative path
    return `${publicUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  const handleAddToCart = () => {
    console.log('View product details:', product.id, product.name)

    // Just navigate to product details page
    window.location.href = `/products/${product.id}`
  }

  const handleToggleWishlist = () => {
    console.log('Toggling wishlist:', product.id, product.name, 'isWishlisted:', isWishlisted)
    if (isWishlisted) {
      dispatch(removeFromWishlist(product.id))
      dispatch(showSuccessNotification(`${product.name} تمت إزالته من قائمة الرغبات!`))
    } else {
      dispatch(addToWishlist(product))
      dispatch(showSuccessNotification(`${product.name} تمت إضافته إلى قائمة الرغبات!`))
    }
  }

  const handleQuickView = () => {
    // TODO: Implement quick view functionality
    console.log('Quick view:', product.id)
  }

  // Safely parse prices to numbers
  const p1 = Number(product.price) || 0;
  const p2 = Number(product.sale_price) || 0;
  const p3 = Number(product.compare_at_price) || Number(product.compare_price) || 0;
  
  // Find the highest and lowest prices to mathematically determine original vs discounted
  // This makes it foolproof no matter which field the seller used for the discount!
  const prices = [p1, p2, p3].filter(p => p > 0);
  const currentPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const originalPrice = prices.length > 1 ? Math.max(...prices) : (prices[0] || 0);

  // Calculate percentage based on the largest vs smallest price
  let discountPercentage = 0;
  if (originalPrice > currentPrice && currentPrice > 0) {
    discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden hover:shadow-amber-200/50 transition-all duration-300 group w-full h-full border border-amber-200/30 hover:border-amber-300/60 flex flex-col">
      {/* Product Image */}
      <div className="relative overflow-hidden flex-shrink-0 h-48">
        <Link to={`/products/${product.id}`}>
          <img
            src={getImageUrl(product.image_url || product.main_image_url)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${product.name?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex flex-col gap-1">
          {product.is_featured && (
            <span className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full shadow-md">
              مميز
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-gradient-to-r from-rose-600 to-rose-700 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full shadow-md">
              -{discountPercentage}%
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full shadow-md">
              غير متوفر
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex flex-col gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleWishlist}
            className={`p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md transition-all duration-300 hover:scale-110 ${isWishlisted ? 'hover:bg-rose-50 border border-rose-200' : 'hover:bg-amber-50 border border-amber-200'
              }`}
            title={isWishlisted ? 'إزالة من قائمة الرغبات' : 'إضافة إلى قائمة الرغبات'}
          >
            {isWishlisted ? (
              <HeartIconSolid className="h-3 w-3 sm:h-4 sm:w-4 text-rose-500" />
            ) : (
              <HeartIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600 hover:text-rose-500 transition-colors" />
            )}
          </button>
          <button
            onClick={handleQuickView}
            className="p-1.5 sm:p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-amber-50 border border-amber-200 transition-all duration-300 hover:scale-110"
            title="عرض سريع"
          >
            <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow">
        {/* Category */}
        {product.category && (
          <p className="text-xs sm:text-sm text-amber-600 font-medium mb-1">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <Link
          to={`/products/${product.id}`}
          className="block mb-1.5 sm:mb-2"
        >
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-1.5 sm:mb-2 text-xs sm:text-sm text-gray-600 gap-1.5">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => {
              const currentRating = product.rating || product.average_rating || 0;
              return i < Math.floor(currentRating) ? (
                <StarIconSolid
                  key={i}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400"
                />
              ) : (
                <StarIcon
                  key={i}
                  className="h-3 w-3 sm:h-4 sm:w-4 text-gray-300"
                />
              );
            })}
          </div>
          <span>
            ({product.reviews_count || product.total_reviews || 0} تقييم)
          </span>
        </div>

        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
            <span className="text-lg sm:text-2xl font-bold text-amber-600">
              {product.currency || 'ر.ي'} {currentPrice}
            </span>
            {originalPrice > currentPrice && (
              <span className="text-xs sm:text-sm text-gray-500 line-through">
                {product.currency || 'ر.ي'} {originalPrice}
              </span>
            )}
          </div>
          {/* Tax */}
          {product.tax && product.tax.is_active && (
            <div className="text-xs text-gray-500">
              +{product.tax.rate}% ضريبة
            </div>
          )}
        </div>

        {/* Spacer to fill empty space */}
        <div className="flex-grow"></div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 sm:gap-2">
          <Link
            to={`/products/${product.id}`}
            className="w-full px-3 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xs sm:text-sm font-semibold rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            عرض التفاصيل
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
