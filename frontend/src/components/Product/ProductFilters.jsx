import React from 'react'
import { useSelector } from 'react-redux'
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline'
import { selectCategories } from '../../store/slices/productsSlice'

const ProductFilters = ({ filters, onFilterChange, onClearFilters }) => {
  const categories = useSelector(selectCategories)
  
  const [priceRange, setPriceRange] = React.useState({
    min: filters.min_price || 0,
    max: filters.max_price || 2000,
  })

  // Update price range when filters change
  React.useEffect(() => {
    setPriceRange({
      min: filters.min_price || 0,
      max: filters.max_price || 2000,
    })
  }, [filters.min_price, filters.max_price])

  const handlePriceChange = (type, value) => {
    const newRange = { ...priceRange, [type]: value }
    setPriceRange(newRange)
    onFilterChange({
      min_price: newRange.min === 0 ? null : newRange.min,
      max_price: newRange.max === 2000 ? null : newRange.max,
    })
  }

  const handleCategoryChange = (categoryId) => {
    console.log('Category clicked:', categoryId)
    console.log('Current category_id:', filters.category_id)
    
    let newCategoryId
    
    if (categoryId === 'all' || categoryId === null) {
      // Clear selection - show all products
      newCategoryId = null
      console.log('Clear category selection - showing all products')
    } else {
      // Toggle category selection
      const currentCategories = Array.isArray(filters.category_id) ? filters.category_id : []
      
      if (currentCategories.includes(categoryId)) {
        // Remove category if already selected
        newCategoryId = currentCategories.filter(id => id !== categoryId)
        console.log('Remove category:', categoryId)
      } else {
        // Add category if not selected
        newCategoryId = [...currentCategories, categoryId]
        console.log('Add category:', categoryId)
      }
      
      // If no categories selected, set to null
      if (newCategoryId.length === 0) {
        newCategoryId = null
      }
    }
    
    console.log('New category_id:', newCategoryId)
    
    // Update filters immediately
    onFilterChange({
      category_id: newCategoryId,
    })
  }

  const handleFeaturedChange = () => {
    const newFeatured = !filters.featured
    console.log('Featured changed:', newFeatured)
    onFilterChange({
      featured: newFeatured,
    })
  }

  const handleInStockChange = () => {
    const newInStock = !filters.in_stock
    console.log('In stock changed:', newInStock)
    onFilterChange({
      in_stock: newInStock,
    })
  }

  const handleRatingChange = (rating) => {
    const newRating = rating === filters.rating ? null : rating
    console.log('Rating changed:', newRating)
    onFilterChange({
      rating: newRating,
    })
  }

  const handleSortChange = (value) => {
    const [sortBy, sortOrder] = value.split('-')
    console.log('Sort changed:', sortBy, sortOrder)
    
    // Update filters immediately
    onFilterChange({
      sortBy,
      sortOrder,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6" dir="rtl">
      <div className="flex items-center justify-between mb-6" dir="rtl">
        <h3 className="text-lg font-semibold flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 ml-2" />
          مميزات
        </h3>
        <button
          onClick={onClearFilters}
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors"
        >
          مسح الكل
        </button>
      </div>

      <div className="space-y-6">
        {/* Sort Options */}
        <div>
          <h4 className="font-medium mb-3">ترتيب حسب</h4>
          <div className="space-y-2">
            <select
              value={`${filters.sortBy || 'created_at'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="created_at-desc">الأحدث أولاً</option>
              <option value="created_at-asc">الأقدم أولاً</option>
              <option value="name-asc">الاسم (أ-ي)</option>
              <option value="name-desc">الاسم (ي-أ)</option>
              <option value="price-asc">السعر (منخفض للمرتفع)</option>
              <option value="price-desc">السعر (مرتفع للمنخفض)</option>
              <option value="rating-desc">الأعلى تقييماً</option>
              <option value="sales-desc">الأكثر مبيعاً</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div>
          <div className="flex items-center justify-between mb-3" dir="rtl">
            <h4 className="font-medium">الفئة</h4>
            <button
              onClick={() => handleCategoryChange('all')}
              className="text-xs text-primary-600 hover:text-primary-700 transition-colors"
            >
              تحديد الكل
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {/* All Categories Option */}
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!filters.category_id || (Array.isArray(filters.category_id) && filters.category_id.length === 0)}
                onChange={() => handleCategoryChange(null)}
                className="ml-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-gray-700 font-medium">جميع الفئات</span>
            </label>
            
            {categories && categories.length > 0 ? (
              categories.map((category) => {
                // Simplified selection logic - just like rating
                const isSelected = Array.isArray(filters.category_id) 
                  ? filters.category_id.includes(category.id)
                  : filters.category_id === category.id
                
                return (
                  <label key={category.id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryChange(category.id)}
                      className="ml-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-gray-700">{category.name}</span>
                  </label>
                )
              })
            ) : (
              <div className="text-gray-500 text-sm">لا توجد فئات متاحة</div>
            )}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="font-medium mb-3">نطاق السعر</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                أقل سعر: ${priceRange.min}
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={priceRange.min}
                onChange={(e) => handlePriceChange('min', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                أعلى سعر: ${priceRange.max}
              </label>
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={priceRange.max}
                onChange={(e) => handlePriceChange('max', parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500" dir="rtl">
              <span>0$</span>
              <span>2000$</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div>
          <h4 className="font-medium mb-3">التقييم</h4>
          <div className="space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label key={rating} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.rating === rating}
                  onChange={() => handleRatingChange(rating)}
                  className="ml-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-gray-700">
                  {rating} نجوم فما فوق
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Stock Status */}
        <div>
          <h4 className="font-medium mb-3">التوفر</h4>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.in_stock === true}
                onChange={handleInStockChange}
                className="ml-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">متوفر فقط</span>
            </label>
          </div>
        </div>

        {/* Featured */}
        <div>
          <h4 className="font-medium mb-3">مميز</h4>
          <div className="space-y-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured === true}
                onChange={handleFeaturedChange}
                className="ml-3 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">المنتجات المميزة</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductFilters
