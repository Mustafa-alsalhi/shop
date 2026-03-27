import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
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
      console.error('Failed to fetch categories:', err)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/admin/products')
      setProducts(response.data)
      setLoading(false)
    } catch (err) {
      setError('Failed to fetch products: ' + err.message)
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
      setError('Failed to fetch products: ' + err.message)
    }
  }

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }))
  }

  const getCategoryName = (categoryId) => {
    if (!categoryId) return 'All Categories'
    const category = categories.find(cat => cat.id === categoryId)
    return category ? category.name : 'All Categories'
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/admin/products/${id}`)
        setProducts(products.filter(p => p.id !== id))
        alert('Product deleted successfully!')
      } catch (err) {
        setError('Failed to delete product: ' + err.message)
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
      `\nSale Price: ${product.currency || 'USD'} ${product.sale_price}` : 
      '';
    
    const datesInfo = product.sale_start_date || product.sale_end_date ?
      `\nSale Period: ${product.sale_start_date ? new Date(product.sale_start_date).toLocaleDateString() : 'Start'} - ${product.sale_end_date ? new Date(product.sale_end_date).toLocaleDateString() : 'End'}` : 
      '';
    
    const variantsInfo = product.variants && product.variants.length > 0 ?
      `\nVariants: ${product.variants.map(v => `${v.name}: ${v.value}`).join(', ')}` : 
      '';
    
    const galleryInfo = product.gallery_images && product.gallery_images.length > 0 ?
      `\nGallery Images: ${product.gallery_images.length} images` : 
      '';

    alert(`Product Details:\n\nName: ${product.name}\nPrice: ${product.currency || 'USD'} ${product.price}${saleInfo}\nStock: ${product.stock}\nCategory: ${product.category?.name || 'N/A'}\nCondition: ${product.condition || 'N/A'}\nStatus: ${product.is_active ? 'Active' : 'Inactive'}\nFeatured: ${product.is_featured ? 'Yes' : 'No'}${datesInfo}${variantsInfo}${galleryInfo}`)
  }

  // Fallback image function
  const getFallbackImage = (product) => {
    if (product.image_url) {
      // If it's a relative path starting with /images/, convert to full URL
      if (product.image_url.startsWith('/images/')) {
        return `http://localhost:8000${product.image_url}`
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
      return `http://localhost:8000${product.image_url.startsWith('/') ? '' : '/'}${product.image_url}`
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Manage Products</h1>
          <button
            onClick={handleAddProduct}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add New Product
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            
            {/* Category Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <span className="mr-2">
                  {getCategoryName(filters.category)}
                </span>
                <ChevronDownIcon className="h-4 w-4" />
              </button>
              
              {showCategoryDropdown && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-300 rounded-md shadow-lg z-10">
                  <button
                    onClick={() => {
                      handleFilterChange('category', '')
                      setShowCategoryDropdown(false)
                    }}
                    className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                  >
                    All Categories
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleFilterChange('category', category.id)
                        setShowCategoryDropdown(false)
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
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
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="draft">Draft</option>
              <option value="featured">Featured</option>
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Products ({products.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Condition
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img 
                            className="h-10 w-10 rounded-full object-cover" 
                            src={getFallbackImage(product)}
                            alt={product.name}
                            onError={(e) => {
                              e.target.src = `https://picsum.photos/seed/default${product.id}/40/40.jpg`
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category?.name || 'No category'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{product.currency || 'USD'} {product.price}</div>
                        {product.sale_price && (
                          <div className="text-green-600 font-medium">{product.currency || 'USD'} {product.sale_price}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.stock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          product.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {product.is_featured && (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                            Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleEditProduct(product)}
                          className="text-green-600 hover:text-green-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
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
