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
    dispatch(showSuccessNotification('تم إزالة العنصر من قائمة الرغبات'))
  }

  const handleAddToCart = (product) => {
    console.log('=== REAL CART - Adding Single Wishlist Item ===')
    console.log('Product from wishlist:', product)
    
    // Ensure product has in_stock field
    const productWithStock = ensureStockStatus(product)
    
    if (!productWithStock.in_stock) {
      dispatch(showErrorNotification('هذا المنتج غير متوفر حاليا'))
      return
    }
    
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
      dispatch(showSuccessNotification(`${product.name} تمت إضافته إلى السلة!`))
      
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
      dispatch(showErrorNotification('فشل في الإضافة إلى السلة. يرجى المحاولة مرة أخرى.'))
    }
  }

  const handleClearWishlist = () => {
    if (window.confirm('هل أنت متأكد من أنك تريد مسح قائمة الرغبات؟')) {
      dispatch(clearWishlist())
      dispatch(showSuccessNotification('تم مسح قائمة الرغبات'))
    }
  }

  const handleAddAllToCart = () => {
    console.log('=== REAL CART - Adding All Wishlist Items ===')
    console.log('Wishlist items to add:', wishlistItems)
    
    let successCount = 0
    let failCount = 0
    
    wishlistItems.forEach((product, index) => {
      console.log(`Adding item ${index + 1}/${wishlistItems.length}:`, product.name)
      
      // Ensure product has in_stock field
      const productWithStock = ensureStockStatus(product)
      
      // Skip out of stock items
      if (!productWithStock.in_stock) {
        console.log(`⚠️ Skipping out of stock item: ${product.name}`)
        return
      }
      
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
      dispatch(showSuccessNotification(`✅ تمت إضافة جميع ${successCount} عناصر إلى السلة!`))
    } else if (successCount > 0 && failCount > 0) {
      dispatch(showSuccessNotification(`⚠️ تمت إضافة ${successCount} عناصر، ${failCount} عناصر غير متوفرة تم تخطيها`))
    } else if (failCount > 0) {
      dispatch(showErrorNotification(`❌ جميع العناصر غير متوفرة حاليا`))
    } else {
      dispatch(showErrorNotification('❌ فشل في إضافة العناصر إلى السلة'))
    }
    
    // Clear wishlist after adding all to cart
    if (successCount > 0) {
      console.log('🗑️ Clearing wishlist after adding to cart...')
      dispatch(clearWishlist())
    }
    
    // Open cart sidebar to show results
    if (successCount > 0) {
      setTimeout(() => {
        dispatch(openCart())
      }, 500)
    }
    
    console.log(`🎯 Add All to Cart completed: ${successCount} success, ${failCount} failed`)
  }

  // Helper function to get correct image URL
  const getImageUrl = (imagePath, productName) => {
    if (!imagePath) return `https://picsum.photos/seed/${productName?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
    
    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-d82a.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')
    
    if (imagePath.startsWith('/images/')) {
      return `${publicUrl}${imagePath}`
    }
    
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    return `${publicUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  // Helper function to ensure product has in_stock field
  const ensureStockStatus = (product) => {
    return {
      ...product,
      in_stock: product.in_stock !== undefined ? product.in_stock : true
    }
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
      <div className="w-full mx-auto px-2 sm:px-2 md:px-4 lg:px-6 py-6 sm:py-8">
        <div className="flex items-center justify-center h-48 sm:h-56 md:h-64">
          <div className="spinner h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mx-auto px-2 sm:px-2 md:px-4 lg:px-6 py-6 sm:py-8" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0" dir="rtl">
        <div className="flex items-center">
          <Link
            to="/products"
            className="ml-2 sm:ml-4 p-1.5 sm:p-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
              <HeartIconSolid className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-500 ml-2 sm:ml-3" />
              قائمة رغباتي
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {wishlistCount} {wishlistCount === 1 ? 'عنصر' : 'عناصر'} محفوظة
            </p>
          </div>
        </div>
        
        {wishlistItems.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleAddAllToCart}
              className="btn btn-primary flex items-center text-sm sm:text-base"
            >
              <ShoppingBagIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">إضافة الكل إلى السلة</span>
              <span className="sm:hidden">إضافة الكل</span>
            </button>
            <button
              onClick={handleClearWishlist}
              className="btn btn-outline flex items-center text-red-600 border-red-600 hover:bg-red-50 text-sm sm:text-base"
            >
              <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 sm:ml-2" />
              <span className="hidden sm:inline">مسح الكل</span>
              <span className="sm:hidden">مسح</span>
            </button>
          </div>
        )}
      </div>

      {/* Wishlist Content */}
      {wishlistItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8 md:p-12 text-center">
          <HeartIcon className="h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2 sm:mb-3">
            قائمة الرغبات فارغة
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 max-w-sm sm:max-w-md mx-auto">
            ابدأ في إضافة العناصر التي تحبها! احفظ المنتجات لوقت لاحق وتتبع عناصرك المفضلة.
          </p>
          <Link
            to="/products"
            className="btn btn-primary inline-flex items-center text-sm sm:text-base"
          >
            <ShoppingBagIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-1 sm:ml-2" />
            ابدأ التسوق
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          {wishlistItems.map((item) => {
            const itemWithStock = ensureStockStatus(item)
            return (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
              dir="rtl"
            >
              {/* Product Image */}
              <div className="relative overflow-hidden">
                <Link to={`/products/${item.id}`}>
                  <img
                    src={getImageUrl(item.image_url || item.main_image_url, item.name)}
                    alt={item.name}
                    className="w-full h-32 sm:h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/seed/${item.name?.replace(/\s+/g, '') || 'product'}/300x300.jpg`
                    }}
                  />
                </Link>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2 p-1.5 sm:p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors group"
                  title="إزالة من قائمة الرغبات"
                >
                  <HeartIconSolid className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 group-hover:scale-110 transition-transform" />
                </button>

                {/* Out of Stock Badge */}
                {!itemWithStock.in_stock && (
                  <div className="absolute top-1.5 sm:top-2 right-1.5 sm:right-2">
                    <span className="bg-gray-800 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full">
                      غير متوفر
                    </span>
                  </div>
                )}

                {/* Discount Badge */}
                {item.compare_price && item.price < item.compare_price && (
                  <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
                    <span className="bg-red-600 text-white px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full">
                      -{Math.round(((item.compare_price - item.price) / item.compare_price) * 100)}%
                    </span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-3 sm:p-4">
                {/* Category */}
                {item.category && (
                  <p className="text-xs sm:text-sm text-primary-600 font-medium mb-1.5 sm:mb-2 text-right">
                    {item.category.name}
                  </p>
                )}

                {/* Product Name */}
                <Link
                  to={`/products/${item.id}`}
                  className="block mb-2 sm:mb-3"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors text-right">
                    {item.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <div className="flex items-center">
                    <span className="text-base sm:text-lg md:text-xl font-bold text-primary-600">
                      ${item.price}
                    </span>
                    {item.compare_price && (
                      <span className="text-xs sm:text-sm text-gray-500 line-through mr-1 sm:mr-2">
                        ${item.compare_price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1.5 sm:gap-2">
                  <button
                    onClick={() => handleAddToCart(itemWithStock)}
                    disabled={!itemWithStock.in_stock}
                    className={`flex-1 btn btn-xs sm:btn-sm ${
                      !itemWithStock.in_stock
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'btn-primary'
                    }`}
                  >
                    <ShoppingBagIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
                    <span className="hidden sm:inline">{itemWithStock.in_stock ? 'إضافة إلى السلة' : 'غير متوفر'}</span>
                    <span className="sm:hidden">{itemWithStock.in_stock ? 'للسلة' : 'غير متوفر'}</span>
                  </button>
                  <Link
                    to={`/products/${item.id}`}
                    className="flex-1 btn btn-outline btn-xs sm:btn-sm"
                  >
                    عرض
                  </Link>
                </div>

                {/* Added Date */}
                <p className="text-xs text-gray-500 mt-2 sm:mt-3">
                  تمت الإضافة {new Date(item.added_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            )
          })}
        </div>
      )}

      {/* Summary Section */}
      {wishlistItems.length > 0 && (
        <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1.5 sm:mb-2">
                ملخص قائمة الرغبات
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                {wishlistCount} عناصر بقيمة إجمالية ${calculateTotal().toFixed(2)}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-0">
              <button
                onClick={handleAddAllToCart}
                className="btn btn-primary text-sm sm:text-base"
              >
                <span className="hidden sm:inline">إضافة الكل إلى السلة (${calculateTotal().toFixed(2)})</span>
                <span className="sm:hidden">إضافة الكل</span>
              </button>
              <button
                onClick={handleClearWishlist}
                className="btn btn-outline text-red-600 border-red-600 hover:bg-red-50 text-sm sm:text-base"
              >
                <span className="hidden sm:inline">مسح قائمة الرغبات</span>
                <span className="sm:hidden">مسح</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Wishlist
