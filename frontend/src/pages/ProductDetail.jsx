import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  StarIcon,
  HeartIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  MinusIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import {
  StarIcon as StarIconSolid,
  HeartIcon as HeartIconSolid,
} from '@heroicons/react/24/solid'
import {
  fetchProduct,
  fetchRelatedProducts,
  selectCurrentProduct,
  selectIsProductLoading,
  selectRelatedProducts,
  selectCartItems,
} from '../store/slices/productsSlice'
import { addToCart } from '../store/slices/cartSlice'
import { showSuccessNotification } from '../store/slices/uiSlice'
import { openCart } from '../store/slices/uiSlice'

const ProductDetail = () => {
  const dispatch = useDispatch()
  const { id } = useParams()
  const product = useSelector(selectCurrentProduct)
  const isLoading = useSelector(selectIsProductLoading)
  const relatedProducts = useSelector(selectRelatedProducts)
  const cartItems = useSelector(selectCartItems)
  
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const [selectedImage, setSelectedImage] = useState(0)

  // Parse images from JSON string if needed and combine all images
  const getAllImages = () => {
    const images = [];
    
    // Add main image if exists and is real
    if (product?.image_url && !product.image_url.includes('placeholder') && !product.image_url.includes('picsum')) {
      images.push(product.image_url);
    }
    
    // Add images array if exists and contains real images
    if (product?.images) {
      const parsedImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(parsedImages)) {
        const realImages = parsedImages.filter(img => 
          img && 
          !img.includes('placeholder') && 
          !img.includes('picsum') && 
          !img.includes('via.placeholder.com')
        );
        images.push(...realImages);
      }
    }
    
    // Add gallery images if exists and contains real images
    if (product?.gallery_images) {
      const galleryImages = Array.isArray(product.gallery_images) ? product.gallery_images : [];
      const realGalleryImages = galleryImages.filter(img => 
        img && 
        !img.includes('placeholder') && 
        !img.includes('picsum') && 
        !img.includes('via.placeholder.com')
      );
      images.push(...realGalleryImages);
    }
    
    // Remove duplicates and return only real images
    return [...new Set(images.filter(img => img && img.trim() !== ''))];
  };
  
  const allImages = getAllImages();

  // Helper function to get correct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null // Return null instead of placeholder
    
    // If it's a relative path starting with /images/, convert to full URL
    if (imagePath.startsWith('/images/')) {
      return `http://localhost:8000${imagePath}`
    }
    
    // If it's already a full URL, use it as is
    if (imagePath.startsWith('http')) {
      return imagePath
    }
    
    // Otherwise, treat as relative path
    return `http://localhost:8000${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
  }

  useEffect(() => {
    dispatch(fetchProduct(id))
    dispatch(fetchRelatedProducts(id))
  }, [dispatch, id])

  const handleAddToCart = () => {
    console.log('=== REAL CART - Adding Product ===')
    console.log('Product:', product)
    console.log('Product ID:', product?.id)
    console.log('Product Name:', product?.name)
    console.log('Quantity:', quantity)
    
    if (!product || !product.id) {
      console.error('❌ Product or product.id is missing!')
      alert('Product information is missing!')
      return
    }
    
    // Create COMPLETE cart item with ALL product data
    const cartItem = {
      product_id: product.id,
      quantity: quantity,
      product_name: product.name || `Product ${product.id}`,
      price: parseFloat(product.price) || 0,
      image_url: product.image_url || product.main_image_url || null,
      variant_id: selectedVariant?.id || null,
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
    }
    
    console.log('🛒 COMPLETE cart item data:', cartItem)
    
    try {
      // Add to cart (will try database first)
      dispatch(addToCart(cartItem))
      dispatch(showSuccessNotification(`${product.name} تمت إضافته للسلة!`))
      
      // Force cart sidebar to open
      setTimeout(() => {
        dispatch(openCart())
      }, 500)
      
      console.log('✅ Cart dispatch successful!')
      
    } catch (error) {
      console.error('❌ Error adding to cart:', error)
      alert('فشل في الإضافة للسلة. يرجى المحاولة مرة أخرى.')
    }
  }

  const handleQuantityChange = (type) => {
    if (type === 'increase') {
      setQuantity(quantity + 1)
    } else if (type === 'decrease' && quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted)
  }

  if (isLoading || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">المنتج غير موجود</h2>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            العودة إلى المنتجات
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
      {/* Breadcrumb */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-amber-200/50">
        <div className="container-custom py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link to="/" className="text-gray-600 hover:text-amber-600 transition-colors">
              الرئيسية
            </Link>
            <span className="text-gray-400">/</span>
            <Link to="/products" className="text-gray-600 hover:text-amber-600 transition-colors">
              المنتجات
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-amber-900 font-medium">{product.name}</span>
          </div>
        </div>
      </nav>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-amber-200/30">
              <div className="grid grid-cols-1 gap-4">
                {allImages.length > 0 ? allImages.map((image, index) => {
                  const imageUrl = getImageUrl(image);
                  if (!imageUrl) return null; // Don't render if no real image
                  
                  return (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-lg cursor-pointer transition-all duration-300 ${
                        selectedImage === index ? 'ring-2 ring-amber-500 shadow-lg' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <img
                        src={imageUrl}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="w-full h-64 object-cover"
                      />
                    </div>
                  );
                }) : (
                  // Show message when no real images available
                  <div className="relative overflow-hidden rounded-lg bg-amber-100 flex items-center justify-center h-64">
                    <div className="text-center text-amber-600">
                      <div className="text-4xl mb-2">📷</div>
                      <p>لا توجد صور حقيقية متاحة</p>
                      <p className="text-sm">لم يتم إضافة صور لهذا المنتج بعد</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-amber-200/30">
              {/* Product Title & Price */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">{product.name}</h1>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <StarIconSolid
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating || 0)
                              ? 'text-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                      <span className="ml-2 text-gray-600">
                        {product.rating || 0} ({product.reviews_count || 0} تقييم)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-amber-600">${product.price}</p>
                    {product.compare_at_price && (
                      <p className="text-sm text-gray-500 line-through">
                        ${product.compare_at_price}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Product Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-amber-900 mb-2">الوصف</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Product Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">الخيارات</h3>
                  <div className="space-y-4">
                    {product.variants.map((variant) => (
                      <div key={variant.id || variant.name} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          {variant.name}
                        </label>
                        <select
                          value={selectedVariant?.option_id || ''}
                          onChange={(e) => {
                            const selectedOptionId = e.target.value;
                            const selectedOption = variant.options?.find(opt => 
                              (opt.id || opt.name) === selectedOptionId
                            );
                            if (selectedOption) {
                              setSelectedVariant({
                                ...variant,
                                selected_option: selectedOption,
                                option_id: selectedOption.id || selectedOption.name
                              });
                            }
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="">اختر خياراً...</option>
                          {variant.options && variant.options.map((option) => (
                            <option key={option.id || option.name} value={option.id || option.name}>
                              {option.name} {option.price && `(+${option.price})`}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity & Actions */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <label className="text-sm font-medium text-gray-700">الكمية:</label>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleQuantityChange('decrease')}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-600 hover:text-amber-600 disabled:opacity-50 transition-colors"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <span className="px-4 py-2 font-medium bg-amber-50 rounded-lg border border-amber-200">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange('increase')}
                      className="p-2 text-gray-600 hover:text-amber-600 transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={handleToggleWishlist}
                    className={`p-3 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isWishlisted
                        ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 shadow-md'
                        : 'bg-amber-100 text-amber-600 hover:bg-amber-200 shadow-md'
                    }`}
                  >
                    <HeartIcon
                      className={`h-6 w-6 ${
                        isWishlisted ? 'text-rose-600' : 'text-amber-600'
                      }`}
                    />
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <ShoppingBagIcon className="h-5 w-5 mr-2" />
                    أضف للسلة
                  </button>
                </div>
              </div>

              {/* Product Features */}
              <div className="border-t border-amber-200/50 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <TruckIcon className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">الشحن المجاني</p>
                      <p className="text-sm text-gray-600">عند الطلبات فوق 50 ريال</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ShieldCheckIcon className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">الدفع الآمن</p>
                      <p className="text-sm text-gray-600">SSL encrypted</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ShoppingBagIcon className="h-6 w-6 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-900">إرجاع سهل</p>
                      <p className="text-sm text-gray-600">سياسة إرجاع 30 يوم</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related Products */}
            <div className="lg:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-amber-200/30">
                <h3 className="text-lg font-semibold text-amber-900 mb-6">منتجات ذات صلة</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedProducts.map((relatedProduct) => {
                    console.log('Rendering related product:', relatedProduct)
                    return (
                      <div key={relatedProduct.id} className="group">
                        <Link to={`/products/${relatedProduct.id}`}>
                          <div className="bg-white/90 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-amber-200/30 hover:border-amber-400/50">
                            <div className="aspect-square">
                              <img
                                src={getImageUrl(relatedProduct.image_url || relatedProduct.main_image_url, relatedProduct.name)}
                                alt={relatedProduct.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <div className="p-4">
                              <h4 className="font-medium text-amber-900 mb-2">{relatedProduct.name}</h4>
                              <div className="flex items-center">
                                <p className="text-lg font-bold text-amber-600">${parseFloat(relatedProduct.price || 0).toFixed(2)}</p>
                                {relatedProduct.compare_at_price && (
                                  <p className="text-sm text-gray-500 line-through">
                                    ${parseFloat(relatedProduct.compare_at_price).toFixed(2)}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center space-x-1">
                                <StarIcon className="h-4 w-4 text-amber-400" />
                                <span className="text-sm text-gray-600">
                        ({relatedProduct.rating || 0})
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
