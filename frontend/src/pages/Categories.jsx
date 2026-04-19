import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
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
  FireIcon,
  GiftIcon,
  SparklesIcon,
  ClockIcon,
  TrophyIcon,
} from '@heroicons/react/24/outline'
import { Helmet } from 'react-helmet-async'

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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
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
      const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-d82a.up.railway.app/api'
      const publicUrl = baseUrl.replace('/api', '')
      return `${publicUrl}/storage/images/categories/${category.image}`
    }
    return null
  }

  // Get featured categories from database (top 4 categories with most products)
  const featuredCategories = categories
    ?.filter(cat => !cat.parent_id) // Root categories only
    ?.sort((a, b) => (b.products_count || 0) - (a.products_count || 0)) // Sort by product count
    ?.slice(0, 4) // Take top 4
    ?.map((category, index) => {
      // Assign different colors for each featured category
      const colorSchemes = [
        {
          color: 'from-blue-500 to-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: FireIcon
        },
        {
          color: 'from-pink-500 to-pink-600',
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-200',
          icon: GiftIcon
        },
        {
          color: 'from-purple-500 to-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          icon: SparklesIcon
        },
        {
          color: 'from-green-500 to-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: CubeIcon
        }
      ]

      const scheme = colorSchemes[index % colorSchemes.length]
      
      return {
        id: category.id,
        name: category.name || 'فئة غير معروفة',
        description: category.description || 'استكشف منتجات هذه الفئة',
        icon: scheme.icon,
        color: scheme.color,
        bgColor: scheme.bgColor,
        borderColor: scheme.borderColor,
        productCount: `${category.products_count || 0}+`,
        image: getCategoryImage(category) || '/images/categories/placeholder.jpg',
        slug: category.slug || `category-${category.id}`
      }
    }) || []

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

  if (isLoading && !categories?.length) {
    console.log('Categories.jsx: Showing loading state')
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading categories...</p>
        </div>
      </div>
    )
  }

  console.log('Categories.jsx: Rendering categories page with', categoriesToDisplay.length, 'categories')

  return (
    <>
      <Helmet>
        <title>الفئات - متجر أصالة</title>
        <meta name="description" content="تصفح جميع فئات المنتجات في متجر أصالة - إلكترونيات، أزياء، إكسسوارات، وأكثر" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 sm:py-12" dir="rtl">
        <div className="w-full mx-auto px-0 sm:px-2 md:px-4 lg:px-6">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              الفئات
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto px-4">
              استكشف عالمنتجات المتنوعة في متجر أصالة - كل ما تحتاجه في مكان واحد
            </p>
          </motion.div>

          {/* Search and Filter Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-6 sm:mb-8 flex flex-col lg:flex-row-reverse gap-4 items-center"
          >
            {/* Search */}
            <div className="relative flex-1 w-full">
              <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-amber-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث في الفئات..."
                className="w-full pr-10 pl-4 py-2 sm:py-3 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
              />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-300'
                }`}
              >
                <Squares2X2Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 sm:p-3 rounded-lg transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-amber-600 text-white' 
                    : 'bg-white text-gray-600 hover:bg-amber-50 border border-amber-300'
                }`}
              >
                <ListBulletIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </motion.div>

          {/* Featured Categories */}
          {featuredCategories.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 sm:mb-12"
            >
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-4 flex items-center justify-center space-x-reverse space-x-2">
                  <FireIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                  الفئات المميزة
                </h2>
                <p className="text-gray-600 text-base sm:text-lg">
                  أكثر الفئات طلباً وشعبية
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                {featuredCategories.map((category, index) => {
                  const Icon = category.icon
                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 * index }}
                      className="group cursor-pointer"
                    >
                      <div className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border ${category.borderColor}/30 overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col`}>
                        {/* Category Image */}
                        <div className="relative h-24 sm:h-32 overflow-hidden">
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              e.target.onerror = null
                              // Use placeholder image if category image fails to load
                              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzIwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPueKlOKWnuWkluW4gOeKlOKWnuW4gPC90ZXh0Pgo8L3N2Zz4='
                            }}
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${category.color}/20 to-transparent`}></div>
                          
                          {/* Product Count Badge */}
                          <div className="absolute top-1.5 sm:top-2 left-1.5 sm:left-2">
                            <div className={`bg-gradient-to-r ${category.color} text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg`}>
                              {category.productCount}
                            </div>
                          </div>
                        </div>

                        {/* Category Content */}
                        <div className="p-2 sm:p-3 flex-1 flex flex-col">
                          <div className="flex items-center mb-1.5 sm:mb-2">
                            <div className={`p-1 sm:p-1.5 ${category.bgColor} rounded-lg flex-shrink-0`}>
                              <Icon className={`h-3 w-3 sm:h-4 sm:w-4 bg-gradient-to-r ${category.color} bg-clip-text text-transparent`} />
                            </div>
                            <h3 className="text-xs sm:text-sm font-bold text-amber-900 mr-1.5 sm:mr-2 line-clamp-1">
                              {category.name}
                            </h3>
                          </div>
                          
                          <p className="text-gray-600 text-xs mb-2 line-clamp-1 flex-1">
                            {category.description}
                          </p>

                          {/* View Products Button */}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full bg-gradient-to-r ${category.color} text-white py-1.5 sm:py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-xs`}
                            onClick={() => window.location.href = `/products?category=${category.slug}`}
                          >
                            عرض المنتجات
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* All Categories */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-amber-900 mb-4">
                جميع الفئات
              </h2>
              <p className="text-gray-600 text-base sm:text-lg">
                تصفح جميع الفئات المتاحة في متجر أصالة
              </p>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full border-4 border-amber-200 border-t-amber-600 h-12 w-12 mx-auto"></div>
              </div>
            ) : (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className={`${
                  viewMode === 'grid' 
                    ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4' 
                    : 'space-y-4'
                }`}
              >
                {categoriesToDisplay.map((category, index) => {
                  const childCategories = getChildCategories(category.id)
                  const productCount = getProductCount(category.id)
                  
                  return (
                    <motion.div
                      key={category.id}
                      variants={itemVariants}
                      className={`bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-amber-200/30 overflow-hidden hover:shadow-xl transition-all duration-300 group ${
                        viewMode === 'list' ? 'flex items-center p-4' : ''
                      }`}
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
                        <>
                          {/* Category Image */}
                          <div className="p-2 sm:p-3">
                            <div className="mb-3">
                              {getCategoryImage(category) ? (
                                <img
                                  src={getCategoryImage(category)}
                                  alt={category.name}
                                  className="w-full h-24 sm:h-32 object-cover rounded-lg"
                                  onError={(e) => {
                                    e.target.onerror = null
                                    // Use local placeholder instead of external service
                                    e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y3ZjdmNyIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4='
                                  }}
                                />
                              ) : (
                                <div className="w-full h-24 sm:h-32 bg-amber-100 rounded-lg flex items-center justify-center">
                                  <TagIcon className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="p-1.5 sm:p-2 bg-amber-100 rounded-lg">
                                  <TagIcon className="h-3 w-3 sm:h-4 sm:w-4 text-amber-600" />
                                </div>
                              </div>
                              <div className="text-right">
                                <span className="text-xs text-gray-500">
                                  {productCount} منتج
                                </span>
                              </div>
                            </div>
                            
                            <h3 className="text-sm font-bold text-amber-900 mb-1.5">
                              {category.name}
                            </h3>
                            
                            {category.description && (
                              <p className="text-gray-600 text-xs mb-3 line-clamp-2">
                                {category.description}
                              </p>
                            )}
                            
                            {childCategories.length > 0 && (
                              <div className="flex items-center text-amber-600 hover:text-amber-700">
                                <span className="text-xs font-medium">
                                  {childCategories.length} فئات فرعية
                                </span>
                                <ArrowRightIcon className="h-3 w-3 mr-1" />
                              </div>
                            )}
                            
                            {childCategories.length === 0 && (
                              <div className="flex items-center text-amber-600 hover:text-amber-700">
                                <span className="text-xs font-medium">عرض المنتجات</span>
                                <ArrowRightIcon className="h-3 w-3 mr-1" />
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex-1">
                            <h3 className="text-sm font-bold text-amber-900 flex items-center">
                              <TagIcon className="h-4 w-4 text-amber-600 ml-2" />
                              {category.name}
                            </h3>
                            <p className="text-gray-600 text-xs">
                              {category.description || 'استكشف المنتجات في هذه الفئة'}
                            </p>
                          </div>
                          <Link
                            to={`/products?category=${category.id}`}
                            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold text-xs"
                          >
                            عرض المنتجات
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </motion.div>

          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-12 sm:mt-16"
          >
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto">
              <div className="text-center">
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
                  لم تجد ما تبحث عنه؟
                </h2>
                <p className="text-amber-100 mb-6 text-base sm:text-lg">
                  تواصل معنا وسنساعدك في العثور على ما تحتاجه
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 sm:px-8 py-3 bg-white text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  onClick={() => window.location.href = '/contact-us'}
                >
                  تواصل معنا
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default Categories
