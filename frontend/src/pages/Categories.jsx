import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
  selectCategories,
  selectIsLoading,
  fetchCategories,
} from '../store/slices/productsSlice'
import {
  TagIcon,
  CubeIcon,
  ShoppingBagIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FolderIcon,
  StarIcon,
  SparklesIcon,
  ArrowLongRightIcon,
  XMarkIcon,
  HomeIcon,
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { Helmet } from 'react-helmet-async'
import { useSettings } from '../contexts/SettingsContext'

const Categories = () => {
  const { storeName } = useSettings()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const categories = useSelector(selectCategories)
  const isLoading = useSelector(selectIsLoading)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParent, setSelectedParent] = useState(null)
  const [hoveredCategory, setHoveredCategory] = useState(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.5, staggerChildren: 0.06 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: 'easeOut' } }
  }

  // Get category image with proper path
  const getCategoryImage = (category) => {
    if (category.image) {
      if (category.image.startsWith('http')) return category.image
      if (category.image.startsWith('/')) return category.image
      const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-8385.up.railway.app/api'
      const publicUrl = baseUrl.replace('/api', '')
      return `${publicUrl}/storage/images/categories/${category.image}`
    }
    if (category.image_url) {
      if (category.image_url.startsWith('http')) return category.image_url
      const baseUrl = import.meta.env.VITE_API_URL || 'https://shop-production-8385.up.railway.app/api'
      const publicUrl = baseUrl.replace('/api', '')
      return `${publicUrl}${category.image_url}`
    }
    return null
  }

  useEffect(() => {
    dispatch(fetchCategories())
  }, [dispatch])

  // Derived data
  const rootCategories = categories?.filter(cat => !cat.parent_id) || []
  const getChildren = (parentId) => categories?.filter(cat => cat.parent_id === parentId) || []
  
  // Filter root categories by search
  const filteredRootCategories = rootCategories.filter(cat =>
    cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Count total products including children
  const getTotalProductCount = (category) => {
    let count = category.products_count || 0
    const children = getChildren(category.id)
    children.forEach(child => { count += child.products_count || 0 })
    return count
  }

  // Category icons based on name patterns
  const getCategoryEmoji = (name) => {
    const n = (name || '').toLowerCase()
    if (n.includes('إلكترونيات') || n.includes('electron')) return '💻'
    if (n.includes('ملابس') || n.includes('أزياء') || n.includes('cloth') || n.includes('fashion')) return '👗'
    if (n.includes('أحذية') || n.includes('shoe')) return '👟'
    if (n.includes('ساعات') || n.includes('watch')) return '⌚'
    if (n.includes('هواتف') || n.includes('phone') || n.includes('جوال')) return '📱'
    if (n.includes('لابتوب') || n.includes('laptop') || n.includes('كمبيوتر')) return '💻'
    if (n.includes('رياض') || n.includes('sport')) return '⚽'
    if (n.includes('منزل') || n.includes('home') || n.includes('مطبخ')) return '🏠'
    if (n.includes('كتب') || n.includes('book')) return '📚'
    if (n.includes('أطفال') || n.includes('kid') || n.includes('طفل')) return '🧸'
    if (n.includes('سيارات') || n.includes('car') || n.includes('مركبات')) return '🚗'
    if (n.includes('جمال') || n.includes('beauty') || n.includes('عناية')) return '💄'
    if (n.includes('طعام') || n.includes('food') || n.includes('غذاء')) return '🍽️'
    if (n.includes('حقائب') || n.includes('bag')) return '👜'
    if (n.includes('نظارات') || n.includes('glass')) return '🕶️'
    if (n.includes('عطور') || n.includes('perfume')) return '🌸'
    if (n.includes('إكسسوار') || n.includes('accessor')) return '💎'
    if (n.includes('أداة') || n.includes('tool')) return '🔧'
    if (n.includes('ألعاب') || n.includes('game')) return '🎮'
    return '📦'
  }

  // Color palette for categories
  const getCategoryColor = (index) => {
    const colors = [
      { bg: 'from-blue-500 to-indigo-600', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-800' },
      { bg: 'from-emerald-500 to-teal-600', light: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-800' },
      { bg: 'from-purple-500 to-violet-600', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-800' },
      { bg: 'from-rose-500 to-pink-600', light: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-700', badge: 'bg-rose-100 text-rose-800' },
      { bg: 'from-amber-500 to-orange-600', light: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-800' },
      { bg: 'from-cyan-500 to-sky-600', light: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-700', badge: 'bg-cyan-100 text-cyan-800' },
      { bg: 'from-fuchsia-500 to-pink-600', light: 'bg-fuchsia-50', border: 'border-fuchsia-200', text: 'text-fuchsia-700', badge: 'bg-fuchsia-100 text-fuchsia-800' },
      { bg: 'from-lime-500 to-green-600', light: 'bg-lime-50', border: 'border-lime-200', text: 'text-lime-700', badge: 'bg-lime-100 text-lime-800' },
    ]
    return colors[index % colors.length]
  }

  // Loading
  if (isLoading && !categories?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-amber-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <ShoppingBagIcon className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="mt-4 text-gray-500 font-medium">جارٍ تحميل الأقسام...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Helmet>
        <title>الأقسام - {storeName}</title>
        <meta name="description" content={`تصفح جميع أقسام المنتجات في ${storeName}`} />
      </Helmet>
      
      <div className="min-h-screen bg-gray-50" dir="rtl">
        
        {/* ===== Hero Section ===== */}
        <div className="relative bg-gradient-to-bl from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.15) 2px, transparent 0)`,
              backgroundSize: '50px 50px'
            }}></div>
          </div>
          <div className="absolute top-0 left-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="text-center"
            >
              {/* Breadcrumb */}
              <div className="flex items-center justify-center gap-2 text-gray-400 text-sm mb-6">
                <Link to="/" className="hover:text-white transition-colors flex items-center gap-1">
                  <HomeIcon className="h-4 w-4" />
                  الرئيسية
                </Link>
                <ChevronLeftIcon className="h-3 w-3" />
                <span className="text-amber-400">الأقسام</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                تصفّح <span className="text-transparent bg-clip-text bg-gradient-to-l from-amber-400 to-orange-400">جميع الأقسام</span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto mb-8">
                اكتشف مجموعتنا الواسعة من المنتجات المصنفة بعناية لتسهيل تجربة تسوّقك
              </p>

              {/* Search */}
              <div className="max-w-xl mx-auto relative">
                <MagnifyingGlassIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن قسم معين..."
                  className="w-full pr-12 pl-4 py-3.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white">{rootCategories.length}</div>
                  <div className="text-xs sm:text-sm text-gray-400">قسم رئيسي</div>
                </div>
                <div className="w-px h-10 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white">{(categories?.length || 0) - rootCategories.length}</div>
                  <div className="text-xs sm:text-sm text-gray-400">قسم فرعي</div>
                </div>
                <div className="w-px h-10 bg-gray-600"></div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-black text-white">
                    {categories?.reduce((sum, cat) => sum + (cat.products_count || 0), 0) || 0}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-400">منتج</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== Main Content ===== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

          {/* Selected Parent Breadcrumb */}
          <AnimatePresence>
            {selectedParent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedParent(null)}
                      className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <ArrowRightIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <button onClick={() => setSelectedParent(null)} className="hover:text-amber-600 transition-colors">
                        جميع الأقسام
                      </button>
                      <ChevronLeftIcon className="h-3 w-3" />
                      <span className="text-gray-900 font-bold">{selectedParent.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedParent(null)}
                    className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    عودة
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub-categories view when a parent is selected */}
          <AnimatePresence mode="wait">
            {selectedParent ? (
              <motion.div
                key="subcategories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Parent Category Hero Card */}
                <div className="mb-8 bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 h-48 md:h-auto relative">
                      {getCategoryImage(selectedParent) ? (
                        <img
                          src={getCategoryImage(selectedParent)}
                          alt={selectedParent.name}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                          <span className="text-6xl">{getCategoryEmoji(selectedParent.name)}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r"></div>
                    </div>
                    <div className="md:w-2/3 p-6 sm:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{getCategoryEmoji(selectedParent.name)}</span>
                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900">{selectedParent.name}</h2>
                      </div>
                      {selectedParent.description && (
                        <p className="text-gray-500 text-sm sm:text-base mb-4 leading-relaxed">{selectedParent.description}</p>
                      )}
                      <div className="flex items-center gap-4 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                          <CubeIcon className="h-3.5 w-3.5" />
                          {getTotalProductCount(selectedParent)} منتج
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-xs font-bold">
                          <FolderIcon className="h-3.5 w-3.5" />
                          {getChildren(selectedParent.id).length} قسم فرعي
                        </span>
                        <Link
                          to={`/products?category=${selectedParent.slug || selectedParent.id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold hover:shadow-lg transition-all"
                        >
                          تصفح الكل
                          <ArrowLeftIcon className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-categories Grid */}
                {getChildren(selectedParent.id).length > 0 ? (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6"
                  >
                    {getChildren(selectedParent.id).map((subCat, index) => {
                      const color = getCategoryColor(index)
                      return (
                        <motion.div key={subCat.id} variants={itemVariants}>
                          <Link
                            to={`/products?category=${subCat.slug || subCat.id}`}
                            className="group block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                          >
                            {/* Image */}
                            <div className="relative h-36 sm:h-44 overflow-hidden">
                              {getCategoryImage(subCat) ? (
                                <img
                                  src={getCategoryImage(subCat)}
                                  alt={subCat.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }}
                                />
                              ) : null}
                              <div className={`absolute inset-0 bg-gradient-to-br ${color.bg} flex items-center justify-center`} style={{ display: getCategoryImage(subCat) ? 'none' : 'flex' }}>
                                <span className="text-5xl opacity-80">{getCategoryEmoji(subCat.name)}</span>
                              </div>
                              {/* Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
                              {/* Product count badge */}
                              <div className="absolute top-3 left-3">
                                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-800 shadow-sm">
                                  {subCat.products_count || 0} منتج
                                </span>
                              </div>
                              {/* Category name on image */}
                              <div className="absolute bottom-3 right-3 left-3">
                                <h3 className="text-white font-bold text-sm sm:text-base leading-tight drop-shadow-lg">
                                  {subCat.name}
                                </h3>
                              </div>
                            </div>

                            {/* Bottom action */}
                            <div className="px-4 py-3 flex items-center justify-between">
                              <span className="text-xs text-gray-500">تصفح المنتجات</span>
                              <ArrowLeftIcon className="h-4 w-4 text-amber-500 group-hover:-translate-x-1 transition-transform" />
                            </div>
                          </Link>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                ) : (
                  <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                    <FolderIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">لا توجد أقسام فرعية لهذا القسم بعد</p>
                    <Link
                      to={`/products?category=${selectedParent.slug || selectedParent.id}`}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-amber-500 to-orange-500 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      تصفح منتجات {selectedParent.name}
                      <ArrowLeftIcon className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : (
              /* ===== Root Categories Grid ===== */
              <motion.div
                key="rootcategories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                {/* Section Title */}
                {!searchQuery && (
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                      <h2 className="text-xl sm:text-2xl font-black text-gray-900">الأقسام الرئيسية</h2>
                    </div>
                    <span className="text-sm text-gray-400">{filteredRootCategories.length} قسم</span>
                  </div>
                )}

                {searchQuery && (
                  <div className="mb-6">
                    <p className="text-gray-500 text-sm">
                      نتائج البحث عن "<span className="font-bold text-gray-900">{searchQuery}</span>" — {filteredRootCategories.length} نتيجة
                    </p>
                  </div>
                )}

                {filteredRootCategories.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <MagnifyingGlassIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">لم يتم العثور على أقسام</p>
                    <p className="text-gray-400 text-sm">جرّب كلمات بحث أخرى</p>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
                  >
                    {filteredRootCategories.map((category, index) => {
                      const children = getChildren(category.id)
                      const color = getCategoryColor(index)
                      const totalProducts = getTotalProductCount(category)
                      const isHovered = hoveredCategory === category.id

                      return (
                        <motion.div key={category.id} variants={itemVariants}>
                          <div
                            className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                            onMouseEnter={() => setHoveredCategory(category.id)}
                            onMouseLeave={() => setHoveredCategory(null)}
                            onClick={() => {
                              if (children.length > 0) {
                                setSelectedParent(category)
                                window.scrollTo({ top: 0, behavior: 'smooth' })
                              } else {
                                navigate(`/products?category=${category.slug || category.id}`)
                              }
                            }}
                          >
                            {/* Image Header */}
                            <div className="relative h-44 sm:h-52 overflow-hidden">
                              {getCategoryImage(category) ? (
                                <img
                                  src={getCategoryImage(category)}
                                  alt={category.name}
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                  onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex' }}
                                />
                              ) : null}
                              <div
                                className={`absolute inset-0 bg-gradient-to-br ${color.bg} flex items-center justify-center`}
                                style={{ display: getCategoryImage(category) ? 'none' : 'flex' }}
                              >
                                <span className="text-7xl opacity-60 group-hover:scale-125 transition-transform duration-500">{getCategoryEmoji(category.name)}</span>
                              </div>

                              {/* Dark overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                              {/* Top badges */}
                              <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
                                <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-800 shadow-sm">
                                  {totalProducts} منتج
                                </span>
                                {children.length > 0 && (
                                  <span className="px-2.5 py-1 rounded-full bg-amber-500/90 backdrop-blur-sm text-xs font-bold text-white shadow-sm">
                                    {children.length} أقسام فرعية
                                  </span>
                                )}
                              </div>

                              {/* Bottom content on image */}
                              <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-2xl">{getCategoryEmoji(category.name)}</span>
                                  <h3 className="text-lg sm:text-xl font-black text-white drop-shadow-lg leading-tight">
                                    {category.name}
                                  </h3>
                                </div>
                                {category.description && (
                                  <p className="text-white/70 text-xs line-clamp-1 mt-1">{category.description}</p>
                                )}
                              </div>
                            </div>

                            {/* Sub-categories Preview */}
                            {children.length > 0 && (
                              <div className="px-4 py-3 border-t border-gray-50">
                                <div className="flex flex-wrap gap-1.5">
                                  {children.slice(0, 4).map(child => (
                                    <span
                                      key={child.id}
                                      className="px-2.5 py-1 rounded-lg bg-gray-50 text-xs text-gray-600 font-medium hover:bg-amber-50 hover:text-amber-700 transition-colors"
                                    >
                                      {child.name}
                                    </span>
                                  ))}
                                  {children.length > 4 && (
                                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-xs text-amber-600 font-bold">
                                      +{children.length - 4} أقسام
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Bottom Action */}
                            <div className="px-4 py-3 border-t border-gray-50 flex items-center justify-between">
                              <span className="text-xs text-gray-400 font-medium">
                                {children.length > 0 ? 'عرض الأقسام الفرعية' : 'تصفح المنتجات'}
                              </span>
                              <div className={`flex items-center gap-1 text-amber-500 transition-transform duration-300 ${isHovered ? '-translate-x-1' : ''}`}>
                                <ArrowLeftIcon className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ===== CTA Section ===== */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <div className="relative bg-gradient-to-bl from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 20px 20px, rgba(255,255,255,0.2) 1px, transparent 0)`,
                  backgroundSize: '40px 40px'
                }}></div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative px-6 sm:px-10 py-10 sm:py-14 text-center">
                <SparklesIcon className="h-10 w-10 text-amber-400 mx-auto mb-4" />
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-3">
                  لم تجد ما تبحث عنه؟
                </h2>
                <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm sm:text-base">
                  تواصل معنا وسنساعدك في العثور على المنتج المناسب لك
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    to="/products"
                    className="px-6 py-3 bg-white text-gray-900 rounded-xl font-bold hover:bg-gray-100 transition-all text-sm shadow-lg hover:shadow-xl"
                  >
                    تصفح جميع المنتجات
                  </Link>
                  <Link
                    to="/contact-us"
                    className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all text-sm shadow-lg hover:shadow-xl"
                  >
                    تواصل معنا
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </>
  )
}

export default Categories
