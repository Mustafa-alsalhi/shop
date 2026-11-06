import React, { useState, useEffect } from 'react'

import { useParams, Link, useNavigate } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux'

import {

  StarIcon,

  HeartIcon,

  ShoppingBagIcon,

  TruckIcon,

  ShieldCheckIcon,

  MinusIcon,

  PlusIcon,

  ShareIcon,

  ChatBubbleLeftIcon,

  UserCircleIcon,

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

import { selectUser } from '../store/slices/authSlice'

import { addToCart } from '../store/slices/cartSlice'

import { showSuccessNotification, showErrorNotification, showWarningNotification } from '../store/slices/uiSlice'

import { openCart } from '../store/slices/uiSlice'

import chatService from '../services/chatService'

import { addToWishlist, removeFromWishlist, selectWishlistItems } from '../store/slices/wishlistSlice'



const ProductDetail = () => {

  const { id } = useParams()

  const dispatch = useDispatch()

  const navigate = useNavigate()

  const product = useSelector(selectCurrentProduct)

  const isLoading = useSelector(selectIsProductLoading)

  const relatedProducts = useSelector(selectRelatedProducts)

  const cartItems = useSelector(selectCartItems)

  const user = useSelector(selectUser)

  const wishlistItems = useSelector(selectWishlistItems)

  const [activeTab, setActiveTab] = useState('overview') // 'overview' or 'reviews'
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(null)

  const [selectedOptions, setSelectedOptions] = useState({})

  const [isWishlisted, setIsWishlisted] = useState(false)

  // Check if product is in wishlist when wishlist items change
  useEffect(() => {
    if (product && wishlistItems) {
      const inWishlist = wishlistItems.some(item => item.product_id === product.id)
      setIsWishlisted(inWishlist)
    }
  }, [product?.id, wishlistItems])

  const [selectedImage, setSelectedImage] = useState(0)

  const [imageLoaded, setImageLoaded] = useState(false)

  const [showChat, setShowChat] = useState(false)

  const [chatMessage, setChatMessage] = useState('')

  const [showAllStoreProducts, setShowAllStoreProducts] = useState(false)

  const [showAllRelatedProducts, setShowAllRelatedProducts] = useState(false)

  const [randomProducts, setRandomProducts] = useState([])



  // Parse images from JSON string if needed and combine all images

  const getAllImages = () => {

    const images = [];



    // Add main image if exists and is real

    if (product?.image_url && !product.image_url.includes('placeholder') && !product.image_url.includes('picsum')) {

      images.push(product.image_url);

    }



    // Add images array if exists and contains real images
    if (product?.images) {
      let parsedImages = [];
      if (typeof product.images === 'string') {
        try { parsedImages = JSON.parse(product.images); } catch(e) {}
      } else if (Array.isArray(product.images)) {
        parsedImages = product.images;
      }

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
      let galleryImages = [];
      if (typeof product.gallery_images === 'string') {
        try { galleryImages = JSON.parse(product.gallery_images); } catch(e) {}
      } else if (Array.isArray(product.gallery_images)) {
        galleryImages = product.gallery_images;
      }

      if (Array.isArray(galleryImages)) {
        const realGalleryImages = galleryImages.filter(img =>
          img &&
          !img.includes('placeholder') &&
          !img.includes('picsum') &&
          !img.includes('via.placeholder.com')
        );
        images.push(...realGalleryImages);
      }
    }



    // Remove duplicates and return only real images

    return [...new Set(images.filter(img => img && img.trim() !== ''))];

  };



  const allImages = getAllImages();



  // Helper function to get correct image URL

  const getImageUrl = (imagePath) => {

    if (!imagePath) return null // Return null instead of placeholder



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



    // Otherwise, treat as relative path

    return `${publicUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`

  }



  useEffect(() => {

    dispatch(fetchProduct(id))

    dispatch(fetchRelatedProducts(id))

  }, [id])

  // Debug logging for seller data
  useEffect(() => {
    if (product) {
      console.log('Product data with seller:', {
        product_id: product.id,
        seller_id: product.seller_id,
        seller_name: product.seller_name,
        seller_avatar: product.seller_avatar,
        seller_rating: product.seller_rating,
        seller_data: product.seller,
        seller_avatar_from_relation: product.seller?.avatar
      })
    }
  }, [product])



  useEffect(() => {

    if (relatedProducts.length > 0) {

      const fetchRandomProducts = async () => {

        try {

          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'}/products?limit=8&random=true`)

          const data = await response.json()

          if (data.data) {

            const filteredProducts = data.data.filter(p =>

              p.id !== parseInt(id) &&

              !relatedProducts.some(rp => rp.id === p.id)

            )

            setRandomProducts(filteredProducts.slice(0, 4))

          }

        } catch (error) {

          console.error('Error fetching random products:', error)

        }

      }

      fetchRandomProducts()

    }

  }, [id])



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

    // Check if user is logged in
    if (!user) {
      dispatch(showWarningNotification('الرجاء تسجيل الدخول أولاً لإضافة منتجات للسلة'))
      setTimeout(() => {
        navigate('/login')
      }, 1500)
      return
    }

    // Check if product is out of stock
    if (product.stock === 0 || product.stock === null || product.stock === undefined) {
      dispatch(showErrorNotification('هذا المنتج غير متوفر حالياً'))
      return
    }

    // Check if quantity exceeds available stock
    if (product.stock && quantity > product.stock) {
      dispatch(showWarningNotification(`الكمية المطلوبة (${quantity}) تتجاوز المخزون المتوفر (${product.stock})`))
      return
    }



    // Create COMPLETE cart item with ALL product data

    const cartItem = {

      product_id: product.id,

      quantity: quantity,

      product_name: product.name || `Product ${product.id}`,

      price: parseFloat(product.price) || 0,

      // Use the selected image from the gallery
      image_url: allImages[selectedImage] || product.image_url || product.main_image_url || null,

      variant_id: selectedVariant?.id || null,

      currency: product.currency || 'USD',

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

      // Variant details (color, size, etc.)
      color: selectedOptions['اللون']?.value || selectedOptions['اللون']?.name || null,
      color_code: selectedOptions['اللون']?.value || selectedOptions['اللون']?.color_code || selectedOptions['اللون']?.hex_code || null,
      size: selectedOptions['المقاس']?.value || selectedOptions['المقاس']?.name || null,
      variant_name: selectedVariant?.name || null,
      variant_value: selectedVariant?.value || selectedVariant?.selected_option?.value || null,

      // Selected image index (for reference)
      selected_image_index: selectedImage,

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

      // Check if new quantity exceeds available stock

      if (product.stock && quantity + 1 > product.stock) {

        dispatch(showWarningNotification(`الكمية المطلوبة (${quantity + 1}) تتجاوز المخزون المتوفر (${product.stock})`))

        return

      }

      setQuantity(quantity + 1)

    } else if (type === 'decrease' && quantity > 1) {

      setQuantity(quantity - 1)

    }

  }



  const handleToggleWishlist = async () => {
    if (!user) {
      dispatch(showErrorNotification('يجب تسجيل الدخول لإضافة المنتج للمفضلة'))
      return
    }

    try {
      if (isWishlisted) {
        // Find the wishlist item ID
        const wishlistItem = wishlistItems.find(item => item.product_id === product.id)
        if (wishlistItem) {
          await dispatch(removeFromWishlist(wishlistItem.id)).unwrap()
          dispatch(showSuccessNotification('تم إزالة المنتج من المفضلة'))
        }
      } else {
        await dispatch(addToWishlist(product)).unwrap()
        dispatch(showSuccessNotification('تم إضافة المنتج للمفضلة'))
      }
    } catch (error) {
      console.error('Wishlist error:', error)
      dispatch(showErrorNotification('فشل في تحديث المفضلة'))
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      dispatch(showErrorNotification('يجب تسجيل الدخول لإضافة تقييم'));
      return;
    }
    if (!reviewRating) {
      dispatch(showErrorNotification('الرجاء اختيار التقييم'));
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        dispatch(showSuccessNotification(data.message));
        setReviewComment('');
        setReviewRating(5);
        // Refresh product data
        dispatch(fetchProduct(id));
      } else {
        dispatch(showErrorNotification(data.message || 'فشل في إضافة التقييم'));
      }
    } catch (error) {
      console.error('Submit review error:', error);
      dispatch(showErrorNotification('حدث خطأ أثناء الاتصال بالخادم'));
    } finally {
      setIsSubmittingReview(false);
    }
  }



  if (!product && !isLoading) {

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

    <div className="min-h-screen bg-gradient-to-br from-white via-amber-50/5 to-orange-50/5" dir="rtl">

      {/* Breadcrumb */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-amber-200/50">

        <div className="container-custom py-3 sm:py-4">

          <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm overflow-x-auto">

            <Link to="/" className="text-gray-600 hover:text-amber-600 transition-colors whitespace-nowrap">

              الرئيسية

            </Link>

            <span className="text-gray-400">/</span>

            <Link to="/products" className="text-gray-600 hover:text-amber-600 transition-colors whitespace-nowrap">

              المنتجات

            </Link>

            <span className="text-gray-400">/</span>

            <span className="text-amber-900 font-medium truncate">{product?.name || 'جاري التحميل...'}</span>

          </div>

        </div>

      </nav>

      {/* Loading State */}
      {isLoading && (
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 rounded-lg h-96 animate-pulse"></div>
            <div className="space-y-4">
              <div className="bg-gray-200 h-8 rounded animate-pulse"></div>
              <div className="bg-gray-200 h-6 rounded animate-pulse w-3/4"></div>
              <div className="bg-gray-200 h-6 rounded animate-pulse w-1/2"></div>
              <div className="bg-gray-200 h-24 rounded animate-pulse"></div>
              <div className="bg-gray-200 h-12 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      )}



      {!isLoading && (
        <>
          <div className="container-custom py-3 sm:py-4 md:py-6 lg:py-8">

            <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 items-start">

              {/* Product Images */}

              <div className="flex-1 xl:max-w-2xl w-full">

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-4 md:p-6 lg:p-8 border border-amber-200/30">

                  {allImages.length > 0 ? (

                    <div className="space-y-4">

                      {/* Main Image with Zoom */}

                      <div
                        className="relative overflow-hidden rounded-xl bg-gray-100 cursor-zoom-in group h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]"
                      >

                        {/* Skeleton Loading */}

                        {!imageLoaded && (

                          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />

                        )}

                        <img

                          src={getImageUrl(allImages[selectedImage])}

                          alt={`${product.name} - Main Image`}

                          className={`w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'

                            }`}

                          onLoad={() => setImageLoaded(true)}

                          onMouseMove={(e) => {

                            const rect = e.currentTarget.getBoundingClientRect();

                            const x = ((e.clientX - rect.left) / rect.width) * 100;

                            const y = ((e.clientY - rect.top) / rect.height) * 100;

                            e.currentTarget.style.transformOrigin = `${x}% ${y}%`;

                          }}

                          onMouseLeave={(e) => {

                            e.currentTarget.style.transformOrigin = 'center center';

                          }}

                        />

                        {/* Image Counter */}

                        <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 bg-black/60 text-white px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm font-medium backdrop-blur-sm">

                          {selectedImage + 1} / {allImages.length}

                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-2 sm:top-3 md:top-4 left-2 sm:left-3 md:left-4 flex flex-col gap-2">

                          {/* Share Button */}

                          <button

                            onClick={() => {

                              if (navigator.share) {

                                navigator.share({

                                  title: product.name,

                                  text: product.description,

                                  url: window.location.href

                                }).catch(console.error)

                              } else {

                                navigator.clipboard.writeText(window.location.href)

                                dispatch(showSuccessNotification('تم نسخ رابط المنتج!'))

                              }

                            }}

                            className="bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg hover:bg-amber-50 transition-all duration-300 hover:scale-110 text-amber-600"

                            title="مشاركة المنتج"

                          >

                            <ShareIcon className="h-4 w-4 sm:h-5 sm:w-5" />

                          </button>

                          {/* Wishlist Button */}
                          <button
                            onClick={handleToggleWishlist}
                            className={`bg-white/90 backdrop-blur-sm p-1.5 sm:p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${isWishlisted
                                ? 'text-rose-600 hover:bg-rose-50'
                                : 'text-gray-600 hover:bg-amber-50 hover:text-amber-600'
                              }`}
                            title={isWishlisted ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
                          >
                            {isWishlisted ? (
                              <HeartIconSolid className="h-4 w-4 sm:h-5 sm:w-5" />
                            ) : (
                              <HeartIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                            )}
                          </button>

                        </div>

                      </div>



                      {/* Thumbnails */}

                      <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-amber-400 scrollbar-track-gray-200">

                        {allImages.map((image, index) => {

                          const imageUrl = getImageUrl(image);

                          if (!imageUrl) return null;



                          return (

                            <button

                              key={index}

                              onClick={() => {

                                setSelectedImage(index)

                                setImageLoaded(false)

                              }}

                              className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-lg overflow-hidden transition-all duration-300 ${selectedImage === index

                                  ? 'ring-2 ring-amber-500 ring-offset-2 shadow-lg scale-105'

                                  : 'ring-1 ring-gray-200 hover:ring-amber-300 hover:shadow-md'

                                }`}

                            >

                              {/* Skeleton Loading for Thumbnail */}

                              <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-300 to-gray-200" />

                              <img

                                src={imageUrl}

                                alt={`${product.name} - Thumbnail ${index + 1}`}

                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"

                                onLoad={(e) => {

                                  e.target.previousElementSibling?.remove()

                                }}

                              />

                              {selectedImage === index && (

                                <div className="absolute inset-0 bg-amber-500/10 pointer-events-none" />

                              )}

                            </button>

                          );

                        })}

                      </div>

                    </div>

                  ) : (

                    // Show message when no real images available

                    <div className="relative overflow-hidden rounded-xl bg-amber-100 flex items-center justify-center h-96">

                      <div className="text-center text-amber-600 px-4">

                        <div className="text-6xl mb-4">📷</div>

                        <p className="text-lg font-semibold mb-2">لا توجد صور حقيقية متاحة</p>

                        <p className="text-sm">لم يتم إضافة صور لهذا المنتج بعد</p>

                      </div>

                    </div>

                  )}

                </div>

                {/* Tabs for Detailed Description & Reviews */}
                <div className="mt-4 sm:mt-6 w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-4 md:p-6 lg:p-8 border border-amber-200/30 min-h-[400px] sm:min-h-[500px] md:min-h-[600px] lg:min-h-[700px]">
                    {/* Tab Buttons */}
                    <div className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6 border-b border-amber-200/30">
                      <button
                        onClick={() => setActiveTab('overview')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 font-medium text-xs sm:text-sm transition-colors ${activeTab === 'overview'
                            ? 'text-amber-900 border-b-2 border-amber-900'
                            : 'text-gray-500 hover:text-amber-700'
                          }`}
                      >
                        نظرة عامة
                      </button>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className={`pb-2 sm:pb-3 px-2 sm:px-4 font-medium text-xs sm:text-sm transition-colors ${activeTab === 'reviews'
                            ? 'text-amber-900 border-b-2 border-amber-900'
                            : 'text-gray-500 hover:text-amber-700'
                          }`}
                      >
                        التقييمات ({product?.reviews_count || 0})
                      </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'overview' ? (
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-2 sm:mb-3">الوصف التفصيلي</h3>
                        <div className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base prose prose-sm prose-xs max-w-none">
                          {product.detailed_description ? (
                            <div dangerouslySetInnerHTML={{ __html: product.detailed_description }} />
                          ) : (
                            <p className="text-gray-500">لا يوجد وصف تفصيلي لهذا المنتج حتى الآن.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Add Review Form */}
                        <div className="bg-amber-50/50 p-4 md:p-6 rounded-xl border border-amber-100 h-fit">
                          <h3 className="text-lg font-semibold text-amber-800 mb-4 border-b border-amber-200/50 pb-2">أضف تقييمك</h3>
                          {user ? (
                            <form onSubmit={handleSubmitReview} className="space-y-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">تقييمك:</label>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setReviewRating(star)}
                                      className="focus:outline-none transition-transform hover:scale-110"
                                    >
                                      {star <= reviewRating ? (
                                        <StarIconSolid className="text-amber-400 h-6 w-6 md:h-8 md:w-8" />
                                      ) : (
                                        <StarIcon className="text-gray-300 h-6 w-6 md:h-8 md:w-8 hover:text-amber-200" />
                                      )}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">تعليقك (اختياري):</label>
                                <textarea
                                  rows={3}
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-shadow resize-none"
                                  placeholder="كيف كانت تجربتك مع هذا المنتج؟"
                                />
                              </div>

                              <button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold py-2.5 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-all shadow hover:shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                              >
                                {isSubmittingReview ? (
                                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                  'إرسال التقييم'
                                )}
                              </button>
                            </form>
                          ) : (
                            <div className="text-center py-6 bg-white rounded-lg p-4 border border-gray-100">
                              <p className="text-gray-600 mb-3 text-sm">لإضافة تقييم يرجى تسجيل الدخول أولاً</p>
                              <Link to="/login" className="inline-block bg-amber-50 text-amber-700 font-medium px-6 py-2 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors text-sm">
                                تسجيل الدخول
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* Reviews List */}
                        <div className="space-y-4">
                          {product?.reviews && product.reviews.length > 0 ? (
                            product.reviews.map((review, idx) => (
                              <div key={review.id || idx} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-3">
                                    {review.user?.avatar ? (
                                      <img src={getImageUrl(review.user.avatar)} alt={review.user?.name} className="w-8 h-8 rounded-full object-cover shadow-sm" />
                                    ) : (
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-bold text-sm shadow-sm">
                                        {review.user?.name?.charAt(0) || 'م'}
                                      </div>
                                    )}
                                    <div>
                                      <span className="font-semibold text-gray-800 block text-sm">{review.user?.name || 'مستخدم مجهول'}</span>
                                      <span className="text-xs text-gray-400 block">{new Date(review.created_at).toLocaleDateString('ar-SA')}</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-0.5 bg-amber-50 px-2 py-1 rounded-full">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <StarIconSolid
                                        key={star}
                                        className={`h-3 w-3 md:h-4 md:w-4 ${star <= review.rating ? 'text-amber-400' : 'text-gray-200'}`}
                                      />
                                    ))}
                                  </div>
                                </div>
                                {review.comment && (
                                  <p className="text-gray-700 text-sm leading-relaxed mt-3 bg-gray-50 p-2.5 rounded-lg border border-gray-100 whitespace-pre-wrap">{review.comment}</p>
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200 h-full">
                              <ChatBubbleLeftIcon className="h-10 w-10 text-gray-300 mb-3" />
                              <p className="text-gray-500 font-medium text-sm">لا توجد تقييمات حتى الآن</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>



              {/* Product Info */}

              <div className="flex-1 w-full">

                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-md p-3 sm:p-4 md:p-6 lg:p-8 border border-amber-200/30">

                  {/* Product Title & Price */}

                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 sm:mb-6">

                    <div className="flex-1">

                      <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 sm:mb-3">{product.name}</h1>

                      <div className="flex items-center space-x-1 sm:space-x-2 mb-3 sm:mb-4">

                        <div className="flex items-center">

                          {[...Array(5)].map((_, i) => (

                            <StarIconSolid

                              key={i}

                              className={`h-4 w-4 sm:h-5 sm:w-5 ${i < Math.floor(product.rating || 0)

                                  ? 'text-amber-400'

                                  : 'text-gray-300'

                                }`}

                            />

                          ))}

                          <span className="ml-1 sm:ml-2 text-[10px] sm:text-xs md:text-sm text-gray-600">

                            {product.rating || 0} ({product.reviews_count || 0} تقييم)

                          </span>

                        </div>

                      </div>

                      <div className="flex items-baseline gap-2 sm:gap-3">

                        <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-amber-600">{product.currency || 'USD'} {product.price}</p>

                        {product.compare_at_price && (

                          <p className="text-sm sm:text-base text-gray-500 line-through">

                            {product.currency || 'USD'} {product.compare_at_price}

                          </p>

                        )}

                      </div>

                      <p className="text-base sm:text-lg font-semibold text-emerald-600 mt-1 sm:mt-2">

                        الإجمالي: {product.currency || 'USD'} {(parseFloat(product.price || 0) * quantity).toFixed(2)}

                      </p>

                    </div>

                  </div>



                  {/* Product Description */}

                  <div className="mb-4 sm:mb-6">

                    <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-2 sm:mb-3">الوصف</h3>

                    <p className="text-gray-700 leading-relaxed text-xs sm:text-sm md:text-base">{product.description}</p>

                  </div>

                  {/* Product Variants */}

                  {product.variants && product.variants.length > 0 && (

                    <div className="mb-4 sm:mb-6">

                      <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-3 sm:mb-4">الخيارات</h3>

                      <div className="space-y-5">

                        {/* Group variants by type */}
                        {(() => {
                          // Check if variants have options array (new format) or are simple variants (old format)
                          const hasOptions = product.variants.some(v => v.options && Array.isArray(v.options) && v.options.length > 0);

                          if (hasOptions) {
                            // New format: variants with options array
                            const colorVariants = product.variants.filter(v =>
                              (v.name?.toLowerCase() || '').includes('color') || (v.name?.toLowerCase() || '').includes('لون')
                            );
                            const sizeVariants = product.variants.filter(v =>
                              (v.name?.toLowerCase() || '').includes('size') || (v.name?.toLowerCase() || '').includes('مقاس')
                            );
                            const otherVariants = product.variants.filter(v =>
                              !((v.name?.toLowerCase() || '').includes('color') || (v.name?.toLowerCase() || '').includes('لون')) &&
                              !((v.name?.toLowerCase() || '').includes('size') || (v.name?.toLowerCase() || '').includes('مقاس'))
                            );

                            // Combine all color options
                            const allColorOptions = colorVariants.flatMap(v => v.options || []);

                            // Combine all size options
                            const allSizeOptions = sizeVariants.flatMap(v => v.options || []);

                            return (
                              <>
                                {/* Colors */}
                                {allColorOptions.length > 0 && (
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      اللون
                                    </label>
                                    <select
                                      value={selectedOptions['اللون']?.id || selectedOptions['اللون']?.name || selectedOptions['Color']?.id || selectedOptions['Color']?.name || ''}
                                      onChange={(e) => {
                                        const selectedOptionId = e.target.value;
                                        const selectedOption = allColorOptions.find(opt =>
                                          (opt.id || opt.name) === selectedOptionId
                                        );
                                        if (selectedOption) {
                                          setSelectedOptions(prev => ({
                                            ...prev,
                                            'اللون': selectedOption,
                                            'Color': selectedOption
                                          }));
                                          setSelectedVariant({
                                            selected_option: selectedOption,
                                            option_id: selectedOption.id || selectedOption.name
                                          });
                                        }
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-base p-3 bg-white"
                                    >
                                      <option value="">اختر لوناً...</option>
                                      {allColorOptions.map((option) => (
                                        <option key={option.id || option.name} value={option.id || option.name}>
                                          {option.name} {option.price && `(+${option.price})`}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Color preview */}
                                    {selectedOptions['اللون'] && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <div
                                          className="w-6 h-6 rounded-full border border-gray-300"
                                          style={{
                                            backgroundColor: selectedOptions['اللون'].value || selectedOptions['اللون'].color_code || selectedOptions['اللون'].hex_code || '#ccc'
                                          }}
                                        />
                                        <span className="text-sm text-gray-600">
                                          اللون المحدد: <span className="font-medium text-amber-700">{selectedOptions['اللون'].name}</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Sizes */}
                                {allSizeOptions.length > 0 && (
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      المقاس
                                    </label>
                                    <select
                                      value={selectedOptions['المقاس']?.id || selectedOptions['المقاس']?.name || selectedOptions['Size']?.id || selectedOptions['Size']?.name || ''}
                                      onChange={(e) => {
                                        const selectedOptionId = e.target.value;
                                        const selectedOption = allSizeOptions.find(opt =>
                                          (opt.id || opt.name) === selectedOptionId
                                        );
                                        if (selectedOption) {
                                          setSelectedOptions(prev => ({
                                            ...prev,
                                            'المقاس': selectedOption,
                                            'Size': selectedOption
                                          }));
                                          setSelectedVariant({
                                            selected_option: selectedOption,
                                            option_id: selectedOption.id || selectedOption.name
                                          });
                                        }
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-base p-3 bg-white"
                                    >
                                      <option value="">اختر مقاساً...</option>
                                      {allSizeOptions.map((option) => (
                                        <option key={option.id || option.name} value={option.id || option.name}>
                                          {option.name} {option.price && `(+${option.price})`}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {/* Other variants */}
                                {otherVariants.map((variant) => (
                                  <div key={variant.id || variant.name} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      {variant.name}
                                    </label>
                                    <select
                                      value={selectedOptions[variant.name]?.id || selectedOptions[variant.name]?.name || ''}
                                      onChange={(e) => {
                                        const selectedOptionId = e.target.value;
                                        const selectedOption = variant.options?.find(opt =>
                                          (opt.id || opt.name) === selectedOptionId
                                        );
                                        if (selectedOption) {
                                          setSelectedOptions(prev => ({
                                            ...prev,
                                            [variant.name]: selectedOption
                                          }));
                                          setSelectedVariant({
                                            ...variant,
                                            selected_option: selectedOption,
                                            option_id: selectedOption.id || selectedOption.name
                                          });
                                        }
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-base p-3 bg-white"
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
                              </>
                            );
                          } else {
                            // Old format: simple variants with name, value, price, stock
                            const colorVariants = product.variants.filter(v =>
                              (v.name?.toLowerCase() || '').includes('color') || (v.name?.toLowerCase() || '').includes('لون')
                            );
                            const sizeVariants = product.variants.filter(v =>
                              (v.name?.toLowerCase() || '').includes('size') || (v.name?.toLowerCase() || '').includes('مقاس')
                            );
                            const otherVariants = product.variants.filter(v =>
                              !((v.name?.toLowerCase() || '').includes('color') || (v.name?.toLowerCase() || '').includes('لون')) &&
                              !((v.name?.toLowerCase() || '').includes('size') || (v.name?.toLowerCase() || '').includes('مقاس'))
                            );

                            return (
                              <>
                                {/* Colors */}
                                {colorVariants.length > 0 && (
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      اللون
                                    </label>
                                    <select
                                      value={selectedOptions['اللون']?.value || selectedOptions['اللون']?.id || ''}
                                      onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        const selectedVariant = colorVariants.find(v =>
                                          (v.value || v.id) === selectedValue
                                        );
                                        if (selectedVariant) {
                                          setSelectedOptions(prev => ({
                                            ...prev,
                                            'اللون': selectedVariant
                                          }));
                                          setSelectedVariant(selectedVariant);
                                        }
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-base p-3 bg-white"
                                    >
                                      <option value="">اختر لوناً...</option>
                                      {colorVariants.map((variant) => (
                                        <option key={variant.id || variant.value} value={variant.value || variant.id}>
                                          {variant.value} {variant.price && `(+${variant.price})`}
                                        </option>
                                      ))}
                                    </select>

                                    {/* Color preview */}
                                    {selectedOptions['اللون'] && (
                                      <div className="flex items-center gap-2 mt-2">
                                        <div
                                          className="w-6 h-6 rounded-full border border-gray-300"
                                          style={{
                                            backgroundColor: selectedOptions['اللون'].value || selectedOptions['اللون'].color_code || selectedOptions['اللون'].hex_code || '#ccc'
                                          }}
                                        />
                                        <span className="text-sm text-gray-600">
                                          اللون المحدد: <span className="font-medium text-amber-700">{selectedOptions['اللون'].value}</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Sizes */}
                                {sizeVariants.length > 0 && (
                                  <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      المقاس
                                    </label>
                                    <select
                                      value={selectedOptions['المقاس']?.value || selectedOptions['المقاس']?.id || ''}
                                      onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        const selectedVariant = sizeVariants.find(v =>
                                          (v.value || v.id) === selectedValue
                                        );
                                        if (selectedVariant) {
                                          setSelectedOptions(prev => ({
                                            ...prev,
                                            'المقاس': selectedVariant
                                          }));
                                          setSelectedVariant(selectedVariant);
                                        }
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-base p-3 bg-white"
                                    >
                                      <option value="">اختر مقاساً...</option>
                                      {sizeVariants.map((variant) => (
                                        <option key={variant.id || variant.value} value={variant.value || variant.id}>
                                          {variant.value} {variant.price && `(+${variant.price})`}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                )}

                                {/* Other variants */}
                                {otherVariants.map((variant) => (
                                  <div key={variant.id || variant.name} className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                      {variant.name}
                                    </label>
                                    <select
                                      value={selectedOptions[variant.name]?.value || selectedOptions[variant.name]?.id || ''}
                                      onChange={(e) => {
                                        const selectedValue = e.target.value;
                                        const selectedVariant = otherVariants.find(v =>
                                          (v.value || v.id) === selectedValue
                                        );
                                        if (selectedVariant) {
                                          setSelectedOptions(prev => ({
                                            ...prev,
                                            [variant.name]: selectedVariant
                                          }));
                                          setSelectedVariant(selectedVariant);
                                        }
                                      }}
                                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 text-base p-3 bg-white"
                                    >
                                      <option value="">اختر خياراً...</option>
                                      {otherVariants.map((v) => (
                                        <option key={v.id || v.value} value={v.value || v.id}>
                                          {v.value} {v.price && `(+${v.price})`}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                ))}
                              </>
                            );
                          }
                        })()}

                      </div>

                    </div>

                  )}



                  {/* Quantity & Actions */}

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">

                    <div className="flex items-center space-x-2 sm:space-x-4">

                      <label className="text-xs sm:text-sm font-medium text-gray-700">الكمية:</label>

                      <div className="flex items-center space-x-1 sm:space-x-2">

                        <button

                          onClick={() => handleQuantityChange('decrease')}

                          disabled={quantity <= 1}

                          className="p-1.5 sm:p-2 text-gray-600 hover:text-amber-600 disabled:opacity-50 transition-colors hover:bg-amber-50 rounded-lg"

                        >

                          <MinusIcon className="h-4 w-4 sm:h-5 sm:w-5" />

                        </button>

                        <span className="px-3 sm:px-4 py-1.5 sm:py-2 font-bold bg-amber-50 rounded-lg border-2 border-amber-200 text-sm sm:text-base md:text-lg min-w-[50px] sm:min-w-[60px] text-center">{quantity}</span>

                        <button

                          onClick={() => handleQuantityChange('increase')}

                          className="p-1.5 sm:p-2 text-gray-600 hover:text-amber-600 transition-colors hover:bg-amber-50 rounded-lg"

                        >

                          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5" />

                        </button>

                      </div>

                    </div>



                    <div className="flex space-x-2 sm:space-x-3">

                      <button

                        onClick={handleToggleWishlist}

                        className={`p-2 sm:p-3 rounded-xl transition-all duration-300 hover:scale-105 ${isWishlisted

                            ? 'bg-rose-100 text-rose-600 hover:bg-rose-200 shadow-md'

                            : 'bg-amber-100 text-amber-600 hover:bg-amber-200 shadow-md'

                          }`}

                      >

                        <HeartIcon className="h-5 w-5 sm:h-6 sm:w-6" />

                      </button>

                      <button

                        onClick={handleAddToCart}

                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-4 sm:px-5 py-2.5 rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-bold shadow-sm hover:shadow-md transform hover:scale-105 text-xs sm:text-sm"

                      >

                        <ShoppingBagIcon className="h-5 w-5" />

                        <span>أضف للسلة</span>

                      </button>

                    </div>

                  </div>



                  {/* Product Features */}

                  <div className="border-t-2 border-amber-200/50 pt-4 sm:pt-6">

                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">

                      <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg">

                        <div className="bg-amber-100 p-1.5 rounded-md">

                          <TruckIcon className="h-4 w-4 text-amber-600" />

                        </div>

                        <div>

                          <p className="text-[10px] sm:text-xs font-bold text-amber-900">الشحن المجاني</p>

                        </div>

                      </div>

                      <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg">

                        <div className="bg-amber-100 p-1.5 rounded-md">

                          <ShieldCheckIcon className="h-4 w-4 text-amber-600" />

                        </div>

                        <div>

                          <p className="text-[10px] sm:text-xs font-bold text-amber-900">الدفع الآمن</p>

                        </div>

                      </div>

                      <div className="flex items-center space-x-2 bg-amber-50 px-3 py-2 rounded-lg">

                        <div className="bg-amber-100 p-1.5 rounded-md">

                          <ShoppingBagIcon className="h-4 w-4 text-amber-600" />

                        </div>

                        <div>

                          <p className="text-[10px] sm:text-xs font-bold text-amber-900">إرجاع سهل</p>

                        </div>

                      </div>

                    </div>

                  </div>

                </div>



                {/* Related Products */}

                <div className="flex-1 mt-4 sm:mt-6 lg:mt-8">

                  <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-2 sm:p-3 md:p-4 lg:p-6 border border-amber-200/30">

                    <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-6">

                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-amber-900">منتجات ذات صلة</h3>

                      <button

                        onClick={() => setShowAllRelatedProducts(!showAllRelatedProducts)}

                        className="text-xs sm:text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"

                      >

                        {showAllRelatedProducts ? 'عرض أقل' : 'عرض الكل'}

                      </button>

                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-2 sm:gap-3 md:gap-4 lg:gap-6">

                      {relatedProducts.slice(0, showAllRelatedProducts ? relatedProducts.length : 6).map((relatedProduct) => {

                        return (

                          <div key={relatedProduct.id} className="group">

                            <Link to={`/products/${relatedProduct.id}`}>

                              <div className="bg-white/90 rounded-lg shadow-xs overflow-hidden hover:shadow-sm transition-all duration-300 border border-amber-200/30 hover:border-amber-400/50">

                                <div className="aspect-square">

                                  <img

                                    src={getImageUrl(relatedProduct.image_url || relatedProduct.main_image_url, relatedProduct.name)}

                                    alt={relatedProduct.name}

                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"

                                  />

                                </div>

                                <div className="p-2 sm:p-3 md:p-4">

                                  <h4 className="text-xs sm:text-sm md:text-base font-medium text-amber-900 mb-1 sm:mb-2 truncate">{relatedProduct.name}</h4>

                                  <div className="flex items-center">

                                    <p className="text-xs sm:text-sm md:text-base lg:text-lg font-bold text-amber-600">{relatedProduct.currency || 'USD'} {parseFloat(relatedProduct.price || 0).toFixed(2)}</p>

                                    {relatedProduct.compare_at_price && (

                                      <p className="text-[10px] sm:text-xs md:text-sm text-gray-500 line-through mr-1 sm:mr-2">

                                        {relatedProduct.currency || 'USD'} {parseFloat(relatedProduct.compare_at_price).toFixed(2)}

                                      </p>

                                    )}

                                  </div>

                                  <div className="flex items-center space-x-1">

                                    <StarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />

                                    <span className="text-[10px] sm:text-xs md:text-sm text-gray-600">

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



              {/* Customer & Seller Info */}

              <div className="w-full xl:w-80">

                {/* Customer Info */}
                {user && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 border border-amber-200/30 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-3 sm:mb-4">معلومات العميل</h3>
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                      {(() => {
                        const userAvatar = user.avatar;
                        console.log('Customer avatar check:', {
                          user_avatar: userAvatar,
                          user_name: user.name,
                          image_url: getImageUrl(userAvatar)
                        });
                        return userAvatar;
                      })() ? (
                        <img
                          src={getImageUrl(user.avatar)}
                          alt={user.name}
                          className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover shadow-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg">
                          <UserCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-blue-900 text-sm sm:text-base">{user.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs sm:text-sm text-blue-600 font-medium">
                          {user.role === 'admin' ? 'مدير النظام' : 'عميل'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Seller Info */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 md:p-6 border border-amber-200/30">

                  <h3 className="text-base sm:text-lg font-bold text-amber-900 mb-3 sm:mb-4">معلومات البائع</h3>

                  <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">

                    {product.seller_avatar || product.seller?.avatar ? (
                      <img
                        src={getImageUrl(product.seller_avatar || product.seller.avatar)}
                        alt={product.seller_name || product.seller?.store_name}
                        className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover shadow-lg"
                        onError={(e) => {
                          console.log('Seller image failed to load, using fallback');
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gray-200 flex items-center justify-center"
                      style={{ display: (product.seller_avatar || product.seller?.avatar) ? 'none' : 'flex' }}
                    >
                      <UserCircleIcon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-400" />
                    </div>

                    <div className="flex-1">

                      <h4 className="font-semibold text-amber-900 text-sm sm:text-base">
                        {product.seller_name || product.seller?.store_name || `متجر ${product.category?.name || 'المنتجات'}`}
                      </h4>

                      <p className="text-xs sm:text-sm text-gray-600">
                        {product.seller?.is_verified ? 'بائع موثوق ✅' : 'بائع'}
                      </p>

                      <div className="flex items-center gap-1 mt-1">

                        <StarIconSolid className="h-3 w-3 sm:h-4 sm:w-4 text-amber-400" />

                        <span className="text-xs sm:text-sm text-gray-700">{product.seller_rating || product.seller?.rating || 4.8}</span>

                        <span className="text-[10px] sm:text-xs text-gray-500">({product.seller_reviews_count || product.seller?.reviews_count || 125} تقييم)</span>

                      </div>

                    </div>

                  </div>

                  <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">

                    {product.seller?.description || 'متجر متخصص في بيع منتجات عالية الجودة مع خدمة عملاء ممتازة وشحن سريع لجميع المناطق.'}

                  </p>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      to={`/chat/${product.seller_id || product.seller?.id}`}
                      state={{ sellerName: product.seller_name || product.seller?.store_name }}
                      className="flex-1 flex items-center justify-center gap-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-3 py-2 rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-semibold shadow-sm hover:shadow-md transform hover:scale-105 text-xs"
                    >
                      <ChatBubbleLeftIcon className="h-4 w-4" />
                      مراسلة البائع
                    </Link>
                    <Link
                      to={`/seller/${product.seller_id || product.seller?.id}`}
                      className="flex-1 flex items-center justify-center gap-1 bg-white border-2 border-amber-600 text-amber-700 px-3 py-2 rounded-lg hover:bg-amber-50 transition-all duration-300 font-semibold shadow-sm hover:shadow-md transform hover:scale-105 text-xs"
                    >
                      <UserCircleIcon className="h-4 w-4" />
                      عرض المتجر
                    </Link>
                  </div>

                </div>



                {/* More from Store */}

                <div className="mt-6">

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-4 sm:p-6 border border-amber-200/30">

                    <div className="flex items-center justify-between mb-4">

                      <h3 className="text-lg font-bold text-amber-900">المزيد من المتجر</h3>

                      <Link

                        to="/products"

                        className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"

                      >

                        عرض الكل

                      </Link>

                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">

                      {randomProducts.map((randomProduct) => (

                        <Link key={randomProduct.id} to={`/products/${randomProduct.id}`}>

                          <div className="group">

                            <div className="bg-white/90 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-amber-200/30 hover:border-amber-400/50">

                              <div className="aspect-square">

                                <img

                                  src={getImageUrl(randomProduct.image_url || randomProduct.main_image_url, randomProduct.name)}

                                  alt={randomProduct.name}

                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"

                                />

                              </div>

                              <div className="p-3">

                                <h4 className="text-sm font-medium text-amber-900 mb-2 truncate">{randomProduct.name}</h4>

                                <div className="flex items-center">

                                  <p className="text-base font-bold text-amber-600">{randomProduct.currency || 'USD'} {parseFloat(randomProduct.price || 0).toFixed(2)}</p>

                                </div>

                              </div>

                            </div>

                          </div>

                        </Link>

                      ))}

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>


        </>

      )}
    </div>

  )

}



export default ProductDetail


