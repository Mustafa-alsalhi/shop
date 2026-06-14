import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, PhotoIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const OfferForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner: '',
    thumbnail: '',
    discount_type: 'percentage',
    discount_value: '',
    start_date: '',
    end_date: '',
    status: 'active',
    show_in_home: false,
    sort_order: 0,
    product_ids: [],
    special_prices: {}
  })

  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewBanner, setPreviewBanner] = useState('')
  const [previewThumbnail, setPreviewThumbnail] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [categories, setCategories] = useState([])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    if (isEditing && id) {
      fetchOffer()
    }
  }, [id])

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products')
      setProducts(response.data.data || response.data)
    } catch (err) {
      console.error('Failed to fetch products:', err)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.data || response.data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchOffer = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await api.get(`/admin/offers/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const offer = response.data

      // Convert image URLs to absolute if needed
      let bannerUrl = offer.banner || ''
      if (bannerUrl && !bannerUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-d82a.up.railway.app'
        bannerUrl = `${baseUrl}/storage/${bannerUrl.startsWith('/') ? bannerUrl.slice(1) : bannerUrl}`
      }

      let thumbnailUrl = offer.thumbnail || ''
      if (thumbnailUrl && !thumbnailUrl.startsWith('http')) {
        const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-d82a.up.railway.app'
        thumbnailUrl = `${baseUrl}/storage/${thumbnailUrl.startsWith('/') ? thumbnailUrl.slice(1) : thumbnailUrl}`
      }

      // Extract product IDs and special prices
      const productIds = offer.products?.map(p => p.id) || []
      const specialPrices = {}
      offer.products?.forEach(p => {
        if (p.pivot?.special_price) {
          specialPrices[p.id] = p.pivot.special_price
        }
      })

      setFormData(prev => ({
        ...prev,
        title: offer.title || '',
        description: offer.description || '',
        banner: bannerUrl,
        thumbnail: thumbnailUrl,
        discount_type: offer.discount_type || 'percentage',
        discount_value: offer.discount_value || '',
        start_date: offer.start_date ? offer.start_date.slice(0, 16) : '',
        end_date: offer.end_date ? offer.end_date.slice(0, 16) : '',
        status: offer.status || 'active',
        show_in_home: offer.show_in_home || false,
        sort_order: offer.sort_order || 0,
        product_ids: productIds,
        special_prices: specialPrices
      }))

      setPreviewBanner(bannerUrl)
      setPreviewThumbnail(thumbnailUrl)
      setSelectedProducts(offer.products || [])

      setLoading(false)
    } catch (err) {
      setError('Failed to fetch offer: ' + err.message)
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleBannerChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewBanner(reader.result)
        setFormData(prev => ({
          ...prev,
          banner: file,
          banner_url: ''
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewThumbnail(reader.result)
        setFormData(prev => ({
          ...prev,
          thumbnail: file,
          thumbnail_url: ''
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const toggleProductSelection = (product) => {
    const isSelected = selectedProducts.some(p => p.id === product.id)
    
    if (isSelected) {
      setSelectedProducts(prev => prev.filter(p => p.id !== product.id))
      setFormData(prev => ({
        ...prev,
        product_ids: prev.product_ids.filter(id => id !== product.id)
      }))
    } else {
      setSelectedProducts(prev => [...prev, product])
      setFormData(prev => ({
        ...prev,
        product_ids: [...prev.product_ids, product.id]
      }))
    }
  }

  const updateSpecialPrice = (productId, value) => {
    setFormData(prev => ({
      ...prev,
      special_prices: {
        ...prev.special_prices,
        [productId]: value
      }
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!formData.title.trim()) {
        throw new Error('عنوان العرض مطلوب')
      }

      const submitData = new FormData()
      submitData.append('title', formData.title.trim())
      submitData.append('description', formData.description?.trim() || '')
      submitData.append('discount_type', formData.discount_type)
      submitData.append('discount_value', formData.discount_value || 0)
      submitData.append('start_date', formData.start_date || '')
      submitData.append('end_date', formData.end_date || '')
      submitData.append('status', formData.status)
      submitData.append('show_in_home', formData.show_in_home ? '1' : '0')
      submitData.append('sort_order', formData.sort_order || 0)

      // Add banner file if selected
      if (formData.banner instanceof File) {
        submitData.append('banner', formData.banner)
      } else if (formData.banner && typeof formData.banner === 'string' && formData.banner.trim() !== '') {
        submitData.append('banner', formData.banner)
      }

      // Add thumbnail file if selected
      if (formData.thumbnail instanceof File) {
        submitData.append('thumbnail', formData.thumbnail)
      } else if (formData.thumbnail && typeof formData.thumbnail === 'string' && formData.thumbnail.trim() !== '') {
        submitData.append('thumbnail', formData.thumbnail)
      }

      // Add product IDs as array
      if (formData.product_ids && Array.isArray(formData.product_ids)) {
        formData.product_ids.forEach((productId, index) => {
          submitData.append(`product_ids[${index}]`, productId)
        })
      }

      // Add special prices as array
      if (formData.special_prices && typeof formData.special_prices === 'object') {
        Object.keys(formData.special_prices).forEach((productId, index) => {
          submitData.append(`special_prices[${productId}]`, formData.special_prices[productId] || '')
        })
      }

      const token = localStorage.getItem('token')

      if (isEditing) {
        await api.post(`/admin/offers/${id}?_method=PUT`, submitData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('تم تحديث العرض بنجاح!')
      } else {
        await api.post('/admin/offers', submitData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('تم إنشاء العرض بنجاح!')
      }

      navigate('/admin/offers')
    } catch (err) {
      console.error('Submission error:', err)
      let errorMessage = err.message
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors
        errorMessage = Object.values(errors).flat().join(', ')
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(`فشل ${isEditing ? 'تحديث' : 'إنشاء'} العرض: ${errorMessage}`)
      setLoading(false)
    }
  }

  // Utility function for image URLs
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/50'

    // If it's already a full URL, return it
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl
    }

    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://shop-production-d82a.up.railway.app'
    const apiUrl = import.meta.env.VITE_API_URL || 'https://shop-production-d82a.up.railway.app/api'

    // Handle various Laravel storage path formats
    if (imageUrl.startsWith('/storage/')) {
      return `${baseUrl}${imageUrl}`
    }
    if (imageUrl.startsWith('storage/')) {
      return `${baseUrl}/${imageUrl}`
    }
    if (imageUrl.startsWith('/public/storage/')) {
      return `${baseUrl}${imageUrl}`
    }
    if (imageUrl.startsWith('public/storage/')) {
      return `${baseUrl}/${imageUrl}`
    }
    // Handle relative paths starting with /images/ or /uploads/
    if (imageUrl.startsWith('/images/') || imageUrl.startsWith('/uploads/')) {
      return `${baseUrl}${imageUrl}`
    }
    if (imageUrl.startsWith('images/') || imageUrl.startsWith('uploads/')) {
      return `${baseUrl}/${imageUrl}`
    }
    // Handle API-relative paths
    if (imageUrl.startsWith('/api/storage/')) {
      return `${apiUrl}${imageUrl.replace('/api', '')}`
    }
    // Handle any other relative path
    return `${baseUrl}${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
  }

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = !selectedCategory || product.category_id === parseInt(selectedCategory)

    return matchesSearch && matchesCategory
  })

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/offers')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 ml-2" />
            العودة للعروض
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'تعديل العرض' : 'إنشاء عرض جديد'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Offer Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">بيانات العرض</h2>
                
                <div className="space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      عنوان العرض *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل عنوان العرض"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      وصف العرض
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="أدخل وصف العرض"
                    />
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة البانر
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {previewBanner ? (
                          <div className="mb-4">
                            <img
                              src={previewBanner}
                              alt="معاينة البانر"
                              className="mx-auto h-32 w-full object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="banner-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>رفع ملف</span>
                            <input
                              id="banner-upload"
                              name="banner"
                              type="file"
                              accept="image/*"
                              onChange={handleBannerChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pr-1">أو أدخل رابط الصورة</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF, WebP حتى 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صورة مصغرة
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        {previewThumbnail ? (
                          <div className="mb-4">
                            <img
                              src={previewThumbnail}
                              alt="معاينة الصورة المصغرة"
                              className="mx-auto h-24 w-24 object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="thumbnail-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>رفع ملف</span>
                            <input
                              id="thumbnail-upload"
                              name="thumbnail"
                              type="file"
                              accept="image/*"
                              onChange={handleThumbnailChange}
                              className="sr-only"
                            />
                          </label>
                          <p className="pr-1">أو أدخل رابط الصورة</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discount Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الخصم *
                      </label>
                      <select
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="percentage">نسبة مئوية (%)</option>
                        <option value="fixed">مبلغ ثابت</option>
                        <option value="free_shipping">شحن مجاني</option>
                      </select>
                    </div>

                    {formData.discount_type !== 'free_shipping' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          قيمة الخصم *
                        </label>
                        <input
                          type="number"
                          name="discount_value"
                          value={formData.discount_value}
                          onChange={handleChange}
                          required
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ البداية
                      </label>
                      <input
                        type="datetime-local"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        تاريخ النهاية
                      </label>
                      <input
                        type="datetime-local"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الحالة *
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">غير نشط</option>
                        <option value="scheduled">مجدول</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ترتيب العرض
                      </label>
                      <input
                        type="number"
                        name="sort_order"
                        value={formData.sort_order}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Show in Home */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="show_in_home"
                      id="show_in_home"
                      checked={formData.show_in_home}
                      onChange={handleChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_in_home" className="mr-2 block text-sm text-gray-900">
                      عرض في الصفحة الرئيسية
                </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Products */}
            <div className="space-y-6">
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">ربط المنتجات</h2>
                
                {/* Search and Filter */}
                <div className="space-y-3 mb-4">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="بحث عن منتجات..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">جميع الفئات</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Products List */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredProducts.map((product) => {
                    const isSelected = selectedProducts.some(p => p.id === product.id)
                    return (
                      <div
                        key={product.id}
                        onClick={() => toggleProductSelection(product)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleProductSelection(product)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <img
                            src={getImageUrl(product.image_url)}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded"
                            onError={(e) => {
                              console.error('❌ Failed to load product image:', product.image_url)
                              console.error('❌ Image URL generated:', getImageUrl(product.image_url))
                              e.target.src = 'https://via.placeholder.com/50'
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <p className="text-xs text-gray-500">{product.price} {product.currency || 'USD'}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Selected Products Count */}
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    المنتجات المختارة: {selectedProducts.length}
                  </p>
                </div>
              </div>

              {/* Selected Products with Special Prices */}
              {selectedProducts.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-4">الأسعار الخاصة</h2>
                  
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 p-2 border rounded-lg">
                        <img
                          src={product.image_url || 'https://via.placeholder.com/40'}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                          <p className="text-xs text-gray-500">السعر الأصلي: {product.price}</p>
                        </div>
                        <input
                          type="number"
                          placeholder="سعر خاص"
                          value={formData.special_prices[product.id] || ''}
                          onChange={(e) => updateSpecialPrice(product.id, e.target.value)}
                          step="0.01"
                          min="0"
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-start space-x-reverse space-x-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث العرض' : 'إنشاء العرض')}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/offers')}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OfferForm
