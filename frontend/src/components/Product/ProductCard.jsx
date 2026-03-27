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
    
    // If it's a relative path starting with /images/, convert to full URL
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8000${imagePath}`
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
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
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
      dispatch(showSuccessNotification(`${product.name} removed from wishlist!`))
    } else {
      dispatch(addToWishlist(product))
      dispatch(showSuccessNotification(`${product.name} added to wishlist!`))
    }
  }

  const handleQuickView = () => {
    // TODO: Implement quick view functionality
    console.log('Quick view:', product.id)
  }

  const discountPercentage = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group w-full">
      {/* Product Image */}
      <div className="relative overflow-hidden">
        <Link to={`/products/${product.id}`}>
          <img
            src={getImageUrl(product.image_url || product.main_image_url)}
            alt={product.name}
            className="w-full h-48 sm:h-56 md:h-60 lg:h-64 object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://picsum.photos/seed/${product.name?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
            }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 flex flex-col gap-1">
          {product.is_featured && (
            <span className="bg-purple-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full">
              Featured
            </span>
          )}
          {discountPercentage > 0 && (
            <span className="bg-red-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full">
              -{discountPercentage}%
            </span>
          )}
          {product.stock <= 0 && (
            <span className="bg-gray-800 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 text-xs rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-1 sm:top-2 right-1 sm:right-2 flex flex-col gap-1.5 sm:gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button
            onClick={handleToggleWishlist}
            className={`p-1.5 sm:p-2 bg-white rounded-full shadow-md transition-colors ${
              isWishlisted ? 'hover:bg-red-50' : 'hover:bg-gray-100'
            }`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {isWishlisted ? (
              <HeartIconSolid className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            ) : (
              <HeartIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600 hover:text-red-500 transition-colors" />
            )}
          </button>
          <button
            onClick={handleQuickView}
            className="p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
            title="Quick View"
          >
            <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-3 sm:p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs sm:text-sm text-primary-600 font-medium mb-1">
            {product.category.name}
          </p>
        )}

        {/* Product Name */}
        <Link
          to={`/products/${product.id}`}
          className="block mb-1.5 sm:mb-2"
        >
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center mb-1.5 sm:mb-2">
          <div className="flex text-yellow-400">
            {[...Array(5)].map((_, i) => (
              <StarIcon
                key={i}
                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                  i < Math.floor(product.average_rating || 0)
                    ? 'text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs sm:text-sm text-gray-500 ml-1.5 sm:ml-2">
            ({product.total_reviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="flex items-center flex-wrap">
            <span className="text-lg sm:text-2xl font-bold text-primary-600">
              {product.currency || 'USD'} {product.price}
            </span>
            {product.sale_price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through ml-1.5 sm:ml-2">
                {product.currency || 'USD'} {product.price}
              </span>
            )}
            {product.sale_price && (
              <span className="text-sm sm:text-lg font-bold text-green-600 ml-1.5 sm:ml-2">
                {product.currency || 'USD'} {product.sale_price}
              </span>
            )}
            {product.compare_price && !product.sale_price && (
              <span className="text-xs sm:text-sm text-gray-500 line-through ml-1.5 sm:ml-2">
                {product.currency || 'USD'} {product.compare_price}
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1.5 sm:gap-2">
          <Link
            to={`/products/${product.id}`}
            className="w-full btn btn-primary btn-xs sm:btn-sm"
          >
            <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
            <span className="text-xs sm:text-sm">View Details</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
