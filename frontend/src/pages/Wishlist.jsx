import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  HeartIcon,
  ShoppingBagIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline'
import {
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid'
import {
  fetchWishlist,
  removeFromWishlist,
  clearWishlist,
  selectWishlistItems,
  selectWishlistCount,
  selectWishlistIsLoading,
  selectWishlistError,
} from '../store/slices/wishlistSlice'
import { addToCart } from '../store/slices/cartSlice'
import { showSuccessNotification, showErrorNotification, openCart } from '../store/slices/uiSlice'

const Wishlist = () => {
  const dispatch = useDispatch()
  
  const wishlistItems = useSelector(selectWishlistItems)
  const wishlistCount = useSelector(selectWishlistCount)
  const isLoading = useSelector(selectWishlistIsLoading)
  const error = useSelector(selectWishlistError)

  useEffect(() => {
    dispatch(fetchWishlist())
  }, [dispatch])

  useEffect(() => {
    if (error) {
      dispatch(showErrorNotification(error))
    }
  }, [error, dispatch])

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId))
    dispatch(showSuccessNotification('Item removed from wishlist'))
  }

  const handleAddToCart = (product) => {
    console.log('=== REAL CART - Adding Single Wishlist Item ===')
    console.log('Product from wishlist:', product)
    
    // Create COMPLETE cart item with ALL product data
    const cartItem = {
      product_id: product.id,
      quantity: 1,
      product_name: product.name || `Product ${product.id}`,
      price: parseFloat(product.price) || 0,
      image_url: product.image_url || product.main_image_url || null,
      variant_id: null,
      // Complete product details for database storage
      sku: product.sku || null,
      weight: product.weight || null,
      dimensions: product.dimensions || null,
      category: product.category?.name || null,
      brand: product.brand?.name || null,
      description: product.description || null,
      short_description: product.short_description || null,
      status: product.status || 'active',
      featured: product.featured || false,
      // Additional metadata
      added_at: new Date().toISOString(),
      user_id: null, // Will be set by backend
      source: 'wishlist', // Track that this came from wishlist
    }
    
    console.log('🛒 COMPLETE cart item from wishlist:', cartItem)
    
    try {
      // Add to cart (will try database first)
      dispatch(addToCart(cartItem))
      dispatch(showSuccessNotification(`${product.name} added to cart!`))
      
      // Open cart sidebar to show the added item
      setTimeout(() => {
        dispatch(openCart())
      }, 500)
      
      console.log('✅ Wishlist item added to cart successfully')
      
      // Optionally remove from wishlist after adding to cart
      console.log('🗑️ Removing item from wishlist...')
      dispatch(removeFromWishlist(product.id))
      
    } catch (error) {
      console.error('❌ Failed to add wishlist item to cart:', error)
      dispatch(showErrorNotification('Failed to add to cart. Please try again.'))
    }
  }

  const handleClearWishlist = () => {
    if (window.confirm('Are you sure you want to clear your wishlist?')) {
      dispatch(clearWishlist())
      dispatch(showSuccessNotification('Wishlist cleared'))
    }
  }

  const handleAddAllToCart = () => {
    console.log('=== REAL CART - Adding All Wishlist Items ===')
    console.log('Wishlist items to add:', wishlistItems)
    
    let successCount = 0
    let failCount = 0
    
    wishlistItems.forEach((product, index) => {
      console.log(`Adding item ${index + 1}/${wishlistItems.length}:`, product.name)
      
      // Create COMPLETE cart item with ALL product data
      const cartItem = {
        product_id: product.id,
        quantity: 1,
        product_name: product.name || `Product ${product.id}`,
        price: parseFloat(product.price) || 0,
        image_url: product.image_url || product.main_image_url || null,
        variant_id: null,
        // Complete product details for database storage
        sku: product.sku || null,
        weight: product.weight || null,
        dimensions: product.dimensions || null,
        category: product.category?.name || null,
        brand: product.brand?.name || null,
        description: product.description || null,
        short_description: product.short_description || null,
        status: product.status || 'active',
        featured: product.featured || false,
        // Additional metadata
        added_at: new Date().toISOString(),
        user_id: null, // Will be set by backend
        source: 'wishlist', // Track that this came from wishlist
      }
      
      console.log(`🛒 COMPLETE cart item ${index + 1}:`, cartItem)
      
      try {
        // Add to cart (will try database first)
        dispatch(addToCart(cartItem))
        successCount++
        console.log(`✅ Item ${index + 1} added successfully`)
      } catch (error) {
        failCount++
        console.error(`❌ Failed to add item ${index + 1}:`, error)
      }
    })
    
    // Show appropriate notification
    if (successCount > 0 && failCount === 0) {
      dispatch(showSuccessNotification(`✅ All ${successCount} items added to cart!`))
    } else if (successCount > 0 && failCount > 0) {
      dispatch(showSuccessNotification(`⚠️ ${successCount} items added, ${failCount} failed`))
    } else {
      dispatch(showErrorNotification('❌ Failed to add items to cart'))
    }
    
    // Clear wishlist after adding all to cart
    if (successCount > 0) {
      console.log('🗑️ Clearing wishlist after adding to cart...')
      dispatch(clearWishlist())
    }
    
    // Open cart sidebar to show results
    setTimeout(() => {
      dispatch(openCart())
    }, 500)
    
    console.log(`🎯 Add All to Cart completed: ${successCount} success, ${failCount} failed`)
  }

  // Helper function to get correct image URL
  const getImageUrl = (imagePath, productName) => {
    if (!imagePath) return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
    
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8000${imagePath}`
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    if (imagePath.includes('via.placeholder.com')) {
      return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
    }
    
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  const calculateTotal = () => {
    const total = wishlistItems.reduce((total, item) => {
      const price = parseFloat(item.price || 0)
      return total + price
    }, 0)
    return total
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="spinner h-12 w-12"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            to="/products"
            className="mr-4 p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <HeartIconSolid className="h-8 w-8 text-red-500 mr-3" />
              My Wishlist
            </h1>
            <p className="text-gray-600 mt-1">
              {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
            </p>
          </div>
        </div>
        
        {wishlistItems.length > 0 && (
          <div className="flex gap-3">
            <button
              onClick={handleAddAllToCart}
              className="btn btn-primary flex items-center"
            >
              <ShoppingBagIcon className="h-4 w-4 mr-2" />
              Add All to Cart
            </button>
            <button
              onClick={handleClearWishlist}
              className="btn btn-outline flex items-center text-red-600 border-red-600 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Content */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <HeartIcon className="h-24 w-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            Your wishlist is empty
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start adding items you love! Save products for later and keep track of your favorite items.
          </p>
          <Link
            to="/products"
            className="btn btn-primary inline-flex items-center"
          >
            <ShoppingBagIcon className="h-5 w-5 mr-2" />
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <Link to={`/products/${item.id}`}>
                  <img
                    src={getImageUrl(item.image_url || item.main_image_url, item.name)}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${item.name?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
                    }}
                  />
                </Link>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group"
                  title="Remove from wishlist"
                >
                  <HeartIconSolid className="h-4 w-4 text-red-500 group-hover:scale-110 transition-transform" />
                </button>

                {/* Out of Stock Badge */}
                {!item.in_stock && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-gray-800 text-white px-2 py-1 text-xs rounded-full">
                      Out of Stock
                    </span>
                  </div>
                )}

                {/* Discount Badge */}
                {item.compare_price && item.price < item.compare_price && (
                  <div className="absolute top-2 left-2">
                    <span className="bg-red-600 text-white px-2 py-1 text-xs rounded-full">
                      -{Math.round(((item.compare_price - item.price) / item.compare_price) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                {/* Category */}
                {item.category && (
                  <p className="text-sm text-primary-600 font-medium mb-2">
                    {item.category.name}
                  </p>
                )}

                {/* Product Name */}
                <Link
                  to={`/products/${item.id}`}
                  className="block mb-3"
                >
                  <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
                    {item.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-xl font-bold text-primary-600">
                      ${item.price}
                    </span>
                    {item.compare_price && (
                      <span className="text-sm text-gray-500 line-through ml-2">
                        ${item.compare_price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={!item.in_stock}
                    className={`flex-1 btn btn-sm ${
                      !item.in_stock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    <ShoppingBagIcon className="h-4 w-4 mr-1" />
                    {item.in_stock ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <Link
                    to={`/products/${item.id}`}
                    className="flex-1 btn btn-outline btn-sm"
                  >
                    View
                  </Link>
                </div>

                {/* Added Date */}
                <p className="text-xs text-gray-500 mt-3">
                  Added {new Date(item.added_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Section */}
      {wishlistItems.length > 0 && (
        <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Wishlist Summary
              </h3>
              <p className="text-gray-600">
                {wishlistCount} items with total value of ${calculateTotal().toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={handleAddAllToCart}
                className="btn btn-primary"
              >
                Add All to Cart (${calculateTotal().toFixed(2)})
              </button>
              <button
                onClick={handleClearWishlist}
                className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50"
              >
                Clear Wishlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wishlist
