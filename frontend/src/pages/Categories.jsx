import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  selectCategories,
  selectCategoryTree,
  selectIsLoading,
  fetchCategories,
  fetchCategoryTree,
} from '../store/slices/productsSlice'
import {
  TagIcon,
  CubeIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline'

const Categories = () => {
  const dispatch = useDispatch()
  
  // Redux state
  const categories = useSelector(selectCategories)
  const categoryTree = useSelector(selectCategoryTree)
  const isLoading = useSelector(selectIsLoading)
  
  // Local state
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParent, setSelectedParent] = useState(null)

  // Debug logging
  console.log('Categories.jsx: Component mounted')
  console.log('Categories.jsx: Categories from Redux:', categories)
  console.log('Categories.jsx: Is loading:', isLoading)

  // Fetch categories on component mount
  useEffect(() => {
    console.log('Categories.jsx: Fetching categories...')
    dispatch(fetchCategories())
    // Remove fetchCategoryTree as it's causing 404 errors
  }, [dispatch])

  // Debug logging when categories change
  useEffect(() => {
    console.log('Categories.jsx: Categories updated:', categories)
    if (categories && categories.length > 0) {
      console.log('Categories.jsx: Sample category data:', categories[0])
      console.log('Categories.jsx: Category image paths:', categories.map(cat => ({ 
        id: cat.id, 
        name: cat.name, 
        image: cat.image, 
        products_count: cat.products_count,
        full_url: getCategoryImage(cat)
      })))
    }
  }, [categories])

  // Filter categories based on search query
  const filteredCategories = categories?.filter(category =>
    category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []

  // Get categories to display (filtered by parent if selected)
  const categoriesToDisplay = selectedParent
    ? filteredCategories.filter(cat => cat.parent_id === selectedParent.id)
    : filteredCategories.filter(cat => !cat.parent_id) // Root categories only

  // Get child categories for a parent
  const getChildCategories = (parentId) => {
    return filteredCategories.filter(cat => cat.parent_id === parentId)
  }

  // Get product count for category from database
  const getProductCount = (categoryId) => {
    // Return the actual product count from the category data
    const category = categories?.find(cat => cat.id === categoryId)
    return category?.products_count || 0
  }

  // Get category image with proper path
  const getCategoryImage = (category) => {
    if (category.image) {
      // If image starts with http, use as is
      if (category.image.startsWith('http')) {
        return category.image
      }
      // If image starts with /, use as is
      if (category.image.startsWith('/')) {
        return category.image
      }
      // Otherwise, use backend URL with correct path
      return `http://localhost:8000/storage/images/categories/${category.image}`
    }
    return null
  }

  if (isLoading && !categories?.length) {
    console.log('Categories.jsx: Showing loading state')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  console.log('Categories.jsx: Rendering categories page with', categoriesToDisplay.length, 'categories')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
              <p className="mt-2 text-gray-600">
                Browse our complete collection of product categories
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              
              {/* View Mode Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Squares2X2Icon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <ListBulletIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2">
            <li>
              <Link to="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li>
              <span className="text-gray-400">/</span>
            </li>
            <li>
              <span className="text-gray-900 font-medium">Categories</span>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Parent Category Navigation */}
        {selectedParent && (
          <div className="mb-6">
            <button
              onClick={() => setSelectedParent(null)}
              className="flex items-center text-primary-600 hover:text-primary-700 font-medium"
            >
              <ArrowRightIcon className="h-4 w-4 rotate-180 mr-2" />
              Back to all categories
            </button>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {selectedParent.name}
            </h2>
            {selectedParent.description && (
              <p className="mt-1 text-gray-600">{selectedParent.description}</p>
            )}
          </div>
        )}

        {/* Categories Grid/List */}
        {categoriesToDisplay.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {categoriesToDisplay.map((category) => {
              const childCategories = getChildCategories(category.id)
              const productCount = getProductCount(category.id)
              
              return (
                <div
                  key={category.id}
                  className={
                    viewMode === 'grid'
                      ? 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                      : 'bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer'
                  }
                  onClick={() => {
                    if (childCategories.length > 0) {
                      setSelectedParent(category)
                    } else {
                      // Navigate to products page with category filter
                      window.location.href = `/products?category=${category.slug}`
                    }
                  }}
                >
                  {viewMode === 'grid' ? (
                    <div className="p-6">
                      {/* Category Image */}
                      <div className="mb-4">
                        {getCategoryImage(category) ? (
                          <img
                            src={getCategoryImage(category)}
                            alt={category.name}
                            className="w-full h-48 object-cover rounded-lg"
                            onError={(e) => {
                              e.target.onerror = null
                              // Use local placeholder instead of external service
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                            }}
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <TagIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="p-3 bg-primary-100 rounded-lg">
                            <TagIcon className="h-6 w-6 text-primary-600" />
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-sm text-gray-500">
                            {productCount} products
                          </span>
                        </div>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {category.name}
                      </h3>
                      
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      
                      {childCategories.length > 0 && (
                        <div className="flex items-center text-primary-600 hover:text-primary-700">
                          <span className="text-sm font-medium">
                            {childCategories.length} subcategories
                          </span>
                          <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </div>
                      )}
                      
                      {childCategories.length === 0 && (
                        <div className="flex items-center text-primary-600 hover:text-primary-700">
                          <span className="text-sm font-medium">View products</span>
                          <ArrowRightIcon className="h-4 w-4 ml-1" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        {/* Category Image */}
                        <div className="flex-shrink-0">
                          {getCategoryImage(category) ? (
                            <img
                              src={getCategoryImage(category)}
                              alt={category.name}
                              className="w-16 h-16 object-cover rounded-lg"
                              onError={(e) => {
                                e.target.onerror = null
                                // Use local placeholder instead of external service
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjZjdmN2Y3Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW08L3RleHQ+Cjwvc3ZnPg=='
                              }}
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                              <TagIcon className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-gray-600 text-sm">
                              {category.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              {productCount} products
                            </span>
                            {childCategories.length > 0 && (
                              <span className="text-sm text-gray-500">
                                {childCategories.length} subcategories
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center text-primary-600 hover:text-primary-700">
                        <ArrowRightIcon className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <FunnelIcon className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-600">
              {searchQuery 
                ? `No categories found matching "${searchQuery}"`
                : 'No categories available at the moment.'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        )}

        {/* Popular Categories */}
        {!selectedParent && !searchQuery && categories?.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Categories</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.slug}`}
                  className="group"
                >
                  <div className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
                    {/* Category Image */}
                    <div className="mb-3">
                      {getCategoryImage(category) ? (
                        <img
                          src={getCategoryImage(category)}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-full mx-auto"
                          onError={(e) => {
                            e.target.onerror = null
                            // Use local placeholder instead of external service
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CiAgPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjZjdmN2Y3Ii8+CiAgPHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm88L3RleHQ+Cjwvc3ZnPg=='
                          }}
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary-100 rounded-full mx-auto flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                          <TagIcon className="h-6 w-6 text-primary-600" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {getProductCount(category.id)} items
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Categories
