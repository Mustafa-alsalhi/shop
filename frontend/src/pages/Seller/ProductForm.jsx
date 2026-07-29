import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeftIcon, PhotoIcon, PlusIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline'
import axios from 'axios'

const SellerProductForm = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    detailed_description: '',
    price: '',
    sale_price: '',
    stock: '',
    sku: '',
    category_id: '',
    seller_category_id: '',
    currency: 'SAR',
    tax_id: '',
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
  const [sellerCategories, setSellerCategories] = useState([])
  const [taxes, setTaxes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [galleryPreviews, setGalleryPreviews] = useState([])

  useEffect(() => {
    fetchCategories()
    fetchSellerCategories()
    fetchTaxes()
    if (isEditing && id) {
      fetchProduct()
    }
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories')
      setCategories(response.data || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchSellerCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('/api/seller/categories', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSellerCategories(response.data || [])
    } catch (error) {
      console.error('Error fetching seller categories:', error)
    }
  }

  const fetchTaxes = async () => {
    try {
      const response = await axios.get('/api/taxes')
      const taxesData = response.data
      setTaxes(Array.isArray(taxesData) ? taxesData : [])
    } catch (error) {
      console.error('Error fetching taxes:', error)
      setTaxes([])
    }
  }

  const fetchProduct = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`/api/seller/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const product = response.data
      setFormData({
        name: product.name || '',
        description: product.description || '',
        detailed_description: product.detailed_description || '',
        price: product.price || '',
        sale_price: product.sale_price || '',
        stock: product.stock || '',
        sku: product.sku || '',
        category_id: product.category_id || '',
        seller_category_id: product.seller_category_id || '',
        currency: product.currency || 'SAR',
        tax_id: product.tax_id || '',
        is_active: product.is_active ?? true,
        is_featured: product.is_featured ?? false,
        condition: product.condition || 'new',
        sale_start_date: product.sale_start_date || '',
        sale_end_date: product.sale_end_date || '',
        image_url: product.image_url || '',
        image_file: null,
        gallery_images: product.gallery_images || [],
        variants: product.variants || []
      })
      setPreviewImage(product.image_url ? `http://localhost:8000${product.image_url}` : '')
      if (product.gallery_images && Array.isArray(product.gallery_images)) {
        setGalleryPreviews(product.gallery_images.map(img => 
          img.startsWith('http') ? img : `http://localhost:8000${img}`
        ))
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      setError('فشل في تحميل بيانات المنتج')
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
      setFormData(prev => ({ ...prev, image_file: file }))
      setPreviewImage(URL.createObjectURL(file))
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
      const token = localStorage.getItem('token')
      const submitData = new FormData()
      
      submitData.append('name', formData.name)
      submitData.append('description', formData.description)
      submitData.append('detailed_description', formData.detailed_description)
      submitData.append('price', formData.price)
      if (formData.sale_price) submitData.append('sale_price', formData.sale_price)
      submitData.append('stock', formData.stock)
      if (formData.sku) submitData.append('sku', formData.sku)
      submitData.append('category_id', formData.category_id)
      if (formData.seller_category_id) submitData.append('seller_category_id', formData.seller_category_id)
      submitData.append('currency', formData.currency)
      if (formData.tax_id) submitData.append('tax_id', formData.tax_id)
      submitData.append('is_active', formData.is_active ? '1' : '0')
      submitData.append('is_featured', formData.is_featured ? '1' : '0')
      submitData.append('condition', formData.condition)
      if (formData.sale_start_date) submitData.append('sale_start_date', formData.sale_start_date)
      if (formData.sale_end_date) submitData.append('sale_end_date', formData.sale_end_date)
      if (formData.image_file) {
        submitData.append('image', formData.image_file)
      }
      
      formData.gallery_images.forEach((file, index) => {
        if (file instanceof File) {
          submitData.append(`gallery_images[${index}]`, file)
        }
      })
      
      submitData.append('variants', JSON.stringify(formData.variants))

      if (isEditing) {
        submitData.append('_method', 'PUT')
        await axios.post(`/api/seller/products/${id}`, submitData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        await axios.post('/api/seller/products', submitData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        })
      }

      navigate('/seller/products')
    } catch (error) {
      console.error('Error saving product:', error)
      console.error('Error response:', error.response?.data)
      console.error('Error status:', error.response?.status)
      
      if (error.response?.data?.error) {
        if (typeof error.response.data.error === 'object') {
          setError(Object.values(error.response.data.error).join(', '))
        } else {
          setError(error.response.data.error)
        }
      } else if (error.response?.data?.message) {
        setError(error.response.data.message)
      } else {
        setError('فشل في حفظ المنتج')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/seller/products')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeftIcon className="w-6 h-6 text-gray-600" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {isEditing ? 'تعديل المنتج' : 'إضافة منتج جديد'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing ? 'تعديل بيانات المنتج' : 'أضف منتج جديد لمتجرك'}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">المعلومات الأساسية</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="أدخل اسم المنتج"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="SKU-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف القصير *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="وصف مختصر للمنتج"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوصف التفصيلي</label>
                <textarea
                  name="detailed_description"
                  value={formData.detailed_description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="وصف تفصيلي للمنتج"
                />
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">التسعير</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السعر العادي *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سعر الترويجي</label>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    السعر المخفض (اترك فارغ إذا لم يوجد خصم)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="USD">دولار أمريكي ($)</option>
                  <option value="EUR">يورو (€)</option>
                  <option value="GBP">جنيه إسترليني (£)</option>
                  <option value="SAR">ريال سعودي (ر.س)</option>
                  <option value="AED">درهم إماراتي (د.إ)</option>
                  <option value="YER">ريال يمني (ر.ي)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكمية المتاحة *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">الفئات</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">فئة المنتج *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {sellerCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">فئة المتجر الداخلية</label>
                  <select
                    name="seller_category_id"
                    value={formData.seller_category_id}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">اختر الفئة الداخلية</option>
                    {sellerCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Tax */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">الضريبة</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الضريبة</label>
                <select
                  name="tax_id"
                  value={formData.tax_id}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">بدون ضريبة</option>
                  {taxes.filter(t => t.is_active).map((tax) => (
                    <option key={tax.id} value={tax.id}>
                      {tax.name} ({tax.rate}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-800">الإعدادات</h2>
              
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
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
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="mr-2 block text-sm text-gray-900">
                    مميز (سيظهر في المنتجات المميزة)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="new">جديد</option>
                  <option value="used">مستعمل</option>
                  <option value="refurbished">مجدد</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ بدء العرض</label>
                  <input
                    type="datetime-local"
                    name="sale_start_date"
                    value={formData.sale_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ انتهاء العرض</label>
                  <input
                    type="datetime-local"
                    name="sale_end_date"
                    value={formData.sale_end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">المتغيرات</h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 text-amber-600 hover:text-amber-700"
                >
                  <PlusIcon className="w-5 h-5" />
                  <span>إضافة متغير</span>
                </button>
              </div>
              
              {formData.variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="مثل: اللون"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">القيمة</label>
                    <input
                      type="text"
                      value={variant.value}
                      onChange={(e) => updateVariant(index, 'value', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="مثل: أحمر"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                    <input
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', e.target.value)}
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">المخزون</label>
                      <input
                        type="number"
                        value={variant.stock}
                        onChange={(e) => updateVariant(index, 'stock', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">صورة المنتج الرئيسية</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-500 transition-colors">
                {previewImage ? (
                  <div className="space-y-4">
                    <img
                      src={previewImage}
                      alt="معاينة المنتج"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-2 text-amber-600 hover:text-amber-700">
                      <PhotoIcon className="w-5 h-5" />
                      <span>تغيير الصورة</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">انقر لرفع صورة</p>
                    <p className="text-gray-400 text-sm">PNG, JPG حتى 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery Images */}
            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">معرض الصور</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-amber-500 transition-colors mb-4">
                <label className="cursor-pointer">
                  <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">انقر لرفع صور إضافية</p>
                  <p className="text-gray-400 text-sm">يمكنك رفع صور متعددة</p>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryImagesChange}
                    className="hidden"
                  />
                </label>
              </div>
              
              {galleryPreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={typeof preview === 'string' ? preview : URL.createObjectURL(preview)}
                        alt={`Gallery ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/seller/products')}
            className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'جاري الحفظ...' : isEditing ? 'حفظ التغييرات' : 'إضافة المنتج'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default SellerProductForm
