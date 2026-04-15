import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const AdminProductForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock: '',
    sku: '',
    category_id: '',
    currency: 'USD',
    is_active: true,
    is_featured: false,
    condition: 'new',
    sale_start_date: '',
    sale_end_date: '',
    image_url: '',
    image_file: null,
    gallery_images: [],
    variants: []
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [galleryPreviews, setGalleryPreviews] = useState([])

  useEffect(() => {
    fetchCategories()
    if (isEditing && id) {
      fetchProduct()
    }
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      setCategories(response.data.data || response.data)
    } catch (err) {
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/admin/products/${id}`)
      const product = response.data
      
      // Convert image URL to absolute if needed
      let imageUrl = product.image_url || ''
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `${imageUrl.startsWith('/') ? imageUrl : '/' + imageUrl}`
      }
      
      setFormData(prev => ({
        ...prev,
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        sale_price: product.sale_price || '',
        stock: product.stock || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        currency: product.currency || 'USD',
        is_active: product.is_active !== undefined ? product.is_active : true,
        is_featured: product.is_featured || false,
        condition: product.condition || 'new',
        sale_start_date: product.sale_start_date ? product.sale_start_date.slice(0, 16) : '',
        sale_end_date: product.sale_end_date ? product.sale_end_date.slice(0, 16) : '',
        image_url: imageUrl,
        image_file: null,
        gallery_images: product.gallery_images || [],
        variants: product.variants || []
      }))
      setPreviewImage(imageUrl)
      
      // Handle gallery images
      const galleryImages = product.gallery_images || []
      const processedGalleryImages = galleryImages.map(img => {
        if (typeof img === 'string' && !img.startsWith('http')) {
          return `${img.startsWith('/') ? img : '/' + img}`
        }
        return img
      })
      setGalleryPreviews(processedGalleryImages)
      
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch product: ' + err.message)
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result)
        setFormData(prev => ({
          ...prev,
          image_file: file,
          image_url: '' // Clear URL when file is selected
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGalleryImagesChange = (e) => {
    const files = Array.from(e.target.files)
    const newGalleryImages = []
    const newPreviews = []

    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        newPreviews.push(reader.result)
        newGalleryImages.push(file)
        
        if (newPreviews.length === files.length) {
          setGalleryPreviews(prev => [...prev, ...newPreviews])
          setFormData(prev => ({
            ...prev,
            gallery_images: [...prev.gallery_images, ...newGalleryImages]
          }))
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      gallery_images: prev.gallery_images.filter((_, i) => i !== index)
    }))
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', value: '', price: '', stock: '' }]
    }))
  }

  const updateVariant = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }))
  }

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Basic validation
      if (!formData.name.trim()) {
        throw new Error('Product name is required')
      }
      if (!formData.price || parseFloat(formData.price) < 0) {
        throw new Error('Valid price is required')
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        throw new Error('Valid stock is required')
      }
      if (!formData.category_id) {
        throw new Error('Category is required')
      }

      // Create FormData for file upload
      const submitData = new FormData()
      submitData.append('name', formData.name.trim())
      submitData.append('description', formData.description?.trim() || '')
      submitData.append('price', parseFloat(formData.price))
      submitData.append('sale_price', formData.sale_price ? parseFloat(formData.sale_price) : '')
      submitData.append('stock', parseInt(formData.stock))
      submitData.append('sku', formData.sku?.trim() || '')
      submitData.append('category_id', parseInt(formData.category_id))
      submitData.append('currency', formData.currency)
      submitData.append('is_active', formData.is_active ? '1' : '0')
      submitData.append('is_featured', formData.is_featured ? '1' : '0')
      submitData.append('condition', formData.condition)
      submitData.append('sale_start_date', formData.sale_start_date || '')
      submitData.append('sale_end_date', formData.sale_end_date || '')

      // Add main image file if selected
      if (formData.image_file) {
        submitData.append('image_file', formData.image_file)
      } else if (formData.image_url && formData.image_url.trim() !== '') {
        // Add image URL if provided
        submitData.append('image_url', formData.image_url.trim())
      }

      // Add gallery images
      formData.gallery_images.forEach((file, index) => {
        submitData.append(`gallery_images.${index}`, file)
      })

      // Add variants
      submitData.append('variants', JSON.stringify(formData.variants))

      console.log('Submitting product data:', submitData)
      console.log('FormData contents:')
      for (let [key, value] of submitData.entries()) {
        console.log(key, value)
      }

      if (isEditing) {
        await api.post(`/admin/products/${id}?_method=PUT`, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Product updated successfully!')
      } else {
        await api.post('/admin/products', submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        alert('Product created successfully!')
      }
      
      navigate('/admin/products')
    } catch (err) {
      console.error('Submission error:', err)
      let errorMessage = err.message
      
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors
        errorMessage = Object.values(errors).flat().join(', ')
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      }
      
      setError(`Failed to ${isEditing ? 'update' : 'create'} product: ${errorMessage}`)
      setLoading(false)
    }
  }

  if (loading && isEditing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/admin/products')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 ml-2" />
            العودة للمنتجات
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h1>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6" dir="rtl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المنتج *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل اسم المنتج"
                />
              </div>

              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SKU
                </label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل SKU"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر العادي *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سعر الترويجي
                </label>
                <input
                  type="number"
                  name="sale_price"
                  value={formData.sale_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500">
                  السعر المخفضل (اترك فارغ إذا لم يوجد خصم)
                </p>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العملة
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="USD">دولار أمريكي ($)</option>
                  <option value="EUR">يورو (€)</option>
                  <option value="GBP">جنيه إسترليني (£)</option>
                  <option value="SAR">ريال سعودي (ر.س)</option>
                  <option value="AED">درهم إماراتي (د.إ)</option>
                </select>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الكمية المتاحة *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">اختر فئة</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="new">جديد</option>
                  <option value="used">مستعمل</option>
                  <option value="refurbished">مجدد</option>
                </select>
              </div>

              {/* Sale Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ بدء العرض
                  </label>
                  <input
                    type="datetime-local"
                    name="sale_start_date"
                    value={formData.sale_start_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ انتهاء العرض
                  </label>
                  <input
                    type="datetime-local"
                    name="sale_end_date"
                    value={formData.sale_end_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Active & Featured */}
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="mr-2 block text-sm text-gray-900">
                    نشط (المنتج سيكون ظاهر في المتجر)
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="mr-2 block text-sm text-gray-900">
                    مميز (سيظهر في المنتجات المميزة)
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="أدخل وصف المنتج"
                />
              </div>

              {/* Main Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صورة المنتج الرئيسية
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    {previewImage ? (
                      <div className="mb-4">
                        <img
                          src={previewImage}
                          alt="معاينة المنتج"
                          className="mx-auto h-32 w-32 object-cover rounded-lg"
                        />
                      </div>
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="image-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>رفع ملف</span>
                        <input
                          id="image-upload"
                          name="image_file"
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pr-1">أو اسحب وأفلت</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WebP حتى 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* OR Main Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  أو أدخل رابط الصورة الرئيسية
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={(e) => {
                    setFormData(prev => ({ 
                      ...prev, 
                      image_url: e.target.value,
                      image_file: null // Clear file when URL is entered
                    }))
                    setPreviewImage(e.target.value)
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  استخدم هذا الخيار إذا كنت تفضل ربط صورة خارجية
                </p>
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صور المعرض (صور إضافية)
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                  <div className="space-y-1 text-center">
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="gallery-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                      >
                        <span>رفع صور المعرض</span>
                        <input
                          id="gallery-upload"
                          name="gallery_images"
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleGalleryImagesChange}
                          className="sr-only"
                        />
                      </label>
                      <p className="pr-1">أو اسحب وأفلت</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, GIF, WebP حتى 2MB لكل صورة. مسموح بملفات متعددة.
                    </p>
                  </div>
                </div>
                
                {/* Gallery Previews */}
                {galleryPreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {galleryPreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`صورة المعرض ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          className="absolute top-2 left-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Variants */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    طرازات المنتج (الألوان، المقاسات، إلخ)
                  </label>
                  <button
                    type="button"
                    onClick={addVariant}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    إضافة طراز
                  </button>
                </div>
                
                {formData.variants.map((variant, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          اسم الطراز (مثلاً، اللون، المقاس)
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="اللون"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          قيمة الطراز (مثلاً، أسود، M)
                        </label>
                        <input
                          type="text"
                          value={variant.value}
                          onChange={(e) => updateVariant(index, 'value', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="أسود"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          السعر الإضافي
                        </label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateVariant(index, 'price', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          المخزون
                        </label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="mt-2 text-sm text-red-600 hover:text-red-700"
                    >
                      حذف الطراز
                    </button>
                  </div>
                ))}
                
                {formData.variants.length === 0 && (
                  <p className="text-sm text-gray-500">
                    لم تتم إضافة طرازات. انقر على "إضافة طراز" لإضافة تنوعات المنتج مثل الألوان، المقاسات، إلخ.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="mt-8 flex justify-start space-x-reverse space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'جاري الحفظ...' : (isEditing ? 'تحديث المنتج' : 'إنشاء المنتج')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AdminProductForm
