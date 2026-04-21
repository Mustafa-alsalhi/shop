import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChevronDownIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const AdminProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  })
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchFilteredProducts()
  }, [filters])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/admin/categories')
      setCategories(response.data || [])
    } catch (err) {
      setError('فشل في جلب الفئات: ' + err.message)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products')
      setProducts(response.data)
      setLoading(false)
    } catch (err) {
      setError('فشل في جلب المنتجات: ' + err.message)
      setLoading(false)
    }
  }

  const fetchFilteredProducts = async () => {
    try {
      let url = '/admin/products'
      const params = new URLSearchParams()
      
      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.category) {
        params.append('category', filters.category)
      }
      if (filters.status) {
        params.append('status', filters.status)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await api.get(url)
      setProducts(response.data)
    } catch (err) {
      setError('فشل في جلب المنتجات: ' + err.message)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'جميع الفئات'
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'جميع الفئات'
  }

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا المنتج؟')) {
      try {
        await api.delete(`/admin/products/${id}`)
        setProducts(products.filter(p => p.id !== id))
        alert('تم حذف المنتج بنجاح!')
      } catch (err) {
        setError('فشل في حذف المنتج: ' + err.message)
      }
    }
  }

  const handleAddProduct = () => {
    navigate('/admin/products/new')
  }

  const handleEditProduct = (product) => {
    navigate(`/admin/products/${product.id}/edit`)
  }

  const handleViewProduct = (product) => {
    const saleInfo = product.sale_price ? 
      `\nالسعر الترويجي: ${product.currency || 'USD'} ${product.sale_price}` : 
      '';
    
    const datesInfo = product.sale_start_date || product.sale_end_date ?
      `\nفترة العرض: ${product.sale_start_date ? new Date(product.sale_start_date).toLocaleDateString() : 'بداية'} - ${product.sale_end_date ? new Date(product.sale_end_date).toLocaleDateString() : 'نهاية'}` : 
      '';
    
    const variantsInfo = product.variants && product.variants.length > 0 ?
      `\nالطرازات: ${product.variants.map(v => `${v.name}: ${v.value}`).join(', ')}` : 
      '';
    
    const galleryInfo = product.gallery_images && product.gallery_images.length > 0 ?
      `\nصور المعرض: ${product.gallery_images.length} صورة` : 
      '';

    alert(`تفاصيل المنتج:\n\nالاسم: ${product.name}\nالسعر: ${product.currency || 'USD'} ${product.price}${saleInfo}\nالمخزون: ${product.stock}\nالفئة: ${product.category?.name || 'لا توجد فئة'}\nالحالة: ${product.condition || 'N/A'}\nالحالة: ${product.is_active ? 'نشط' : 'غير نشط'}\nمميز: ${product.is_featured ? 'نعم' : 'لا'}${datesInfo}${variantsInfo}${galleryInfo}`)
  }

  // Fallback image function
  const getFallbackImage = (product) => {
    // Get base URL from environment or fallback to Railway production
    const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-d82a.up.railway.app/api'
    const publicUrl = baseUrl.replace('/api', '')
    
    if (product.image_url) {
      // If it's a relative path starting with /images/, convert to full URL
      if (product.image_url.startsWith('/images/')) {
        return `${publicUrl}${product.image_url}`
      }
      // If it's already a full URL, use it as is
      if (product.image_url.startsWith('http')) {
        return product.image_url
      }
      // If it's a placeholder URL, use fallback
      if (product.image_url.includes('via.placeholder.com')) {
        return `https://picsum.photos/seed/${product.name.replace(/\s+/g, '')}/400/400.jpg`
      }
      // Otherwise, treat as relative path
      return `${publicUrl}${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`
    }
    // Use a reliable image service as fallback
    return `https://picsum.photos/seed/${product.name.replace(/\s+/g, '')}/400/400.jpg`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3" dir="rtl">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg sm:rounded-xl">
                <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                إدارة المنتجات
              </h1>
            </div>
            <button
              onClick={handleAddProduct}
              className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg sm:rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2" />
              <span className="text-xs sm:text-sm">إضافة منتج جديد</span>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-3 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl mb-4 sm:mb-6 shadow-lg">
            <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-red-100 rounded-lg">
                <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <span className="font-medium text-xs sm:text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100 p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex items-center space-x-reverse space-x-2 sm:space-x-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
              <FunnelIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">
              الفلاتر
            </h3>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4" dir="rtl">
            <div className="flex-1 min-w-0 relative">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
              <input
                type="text"
                placeholder="البحث في المنتجات..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full pr-9 sm:pr-10 pl-3 sm:pl-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50 text-xs sm:text-sm"
              />
            </div>
            
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white hover:bg-gray-50 transition-colors text-xs sm:text-sm"
              >
                <span className="ml-2 truncate max-w-24 sm:max-w-none">
                  {getCategoryName(filters.category)}
                </span>
                <ChevronDownIcon className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full right-0 mt-1 w-40 sm:w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      handleFilterChange('category', '')
                      setShowCategoryDropdown(false)
                    }}
                    className="block w-full text-right px-3 sm:px-4 py-2 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm"
                  >
                    جميع الفئات
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleFilterChange('category', category.id)
                        setShowCategoryDropdown(false)
                      }}
                      className="block w-full text-right px-3 sm:px-4 py-2 hover:bg-gray-100 text-gray-700 text-xs sm:text-sm"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <select 
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-xs sm:text-sm"
            >
              <option value="">جميع الحالات</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="draft">مسودة</option>
              <option value="featured">مميز</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white shadow-xl rounded-xl sm:rounded-2xl border border-gray-100" dir="rtl">
          <div className="px-4 py-3 sm:px-6 sm:py-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
                المنتجات ({products.length})
              </h2>
              <div className="flex items-center space-x-reverse space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs sm:text-sm text-gray-600">متصل بقاعدة البيانات</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المخزون
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النشاط
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                          <img 
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover" 
                            src={getFallbackImage(product)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = `https://picsum.photos/seed/default${product.id}/40/40.jpg`
                            }}
                          />
                        </div>
                        <div className="mr-2 sm:mr-4">
                          <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-24 sm:max-w-none">{product.name}</div>
                          <div className="text-xs sm:text-sm text-gray-500 truncate max-w-24 sm:max-w-none">{product.category?.name || 'لا توجد فئة'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">
                      {product.sku}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">
                      <div>
                        <div className="font-medium">{product.currency || 'USD'} {product.price}</div>
                        {product.sale_price && (
                          <div className="text-green-600 font-medium text-xs">{product.currency || 'USD'} {product.sale_price}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 text-right">
                      {product.stock}
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.condition === 'new' 
                          ? 'bg-blue-100 text-blue-800' 
                          : product.condition === 'used'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {product.condition || 'N/A'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex space-x-reverse space-x-1">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                        {product.is_featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            مميز
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-reverse space-x-1 sm:space-x-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="p-1.5 sm:p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                          title="عرض التفاصيل"
                        >
                          <EyeIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="p-1.5 sm:p-2 bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                          title="تعديل المنتج"
                        >
                          <PencilIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(product)}
                          className="p-1.5 sm:p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="حذف المنتج"
                        >
                          <TrashIcon className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProducts
