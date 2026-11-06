import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { setCartData, fetchCart } from '../../store/slices/cartSlice'
import { showSuccessNotification } from '../../store/slices/uiSlice'
import { XMarkIcon, PlusIcon, MinusIcon, CheckIcon, ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import api from '../../services/api'

const FoodOptionsModal = ({ meal, isOpen, onClose, restaurant }) => {
  const dispatch = useDispatch()

  const [selectedSize, setSelectedSize] = useState(null)
  const [selectedExtras, setSelectedExtras] = useState([])
  const [selectedRemovals, setSelectedRemovals] = useState([])
  const [specialInstructions, setSpecialInstructions] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [conflictModal, setConflictModal] = useState(null)

  if (!isOpen || !meal) return null

  const foodOptions = meal.food_options || {}
  const sizes = foodOptions.sizes || []
  const extras = foodOptions.extras || []
  const removals = foodOptions.removals || []

  // السعر الأساسي للوجبة
  const basePrice = meal.sale_price ? Number(meal.sale_price) : Number(meal.price || 0)

  // حساب السعر الإجمالي الفوري (حساب مباشر يلتزم بقواعد React Hooks)
  const sizePrice = selectedSize && selectedSize.price ? Number(selectedSize.price) : basePrice
  const extrasTotal = selectedExtras.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
  const currentTotalPerItem = sizePrice + extrasTotal
  const totalCalculatedPrice = (currentTotalPerItem * quantity).toFixed(2)

  // معالجة اختيار الإضافات
  const toggleExtra = (extra) => {
    if (selectedExtras.some(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name))
    } else {
      setSelectedExtras([...selectedExtras, extra])
    }
  }

  // معالجة المكونات المستبعدة
  const toggleRemoval = (removal) => {
    if (selectedRemovals.includes(removal.name)) {
      setSelectedRemovals(selectedRemovals.filter(r => r !== removal.name))
    } else {
      setSelectedRemovals([...selectedRemovals, removal.name])
    }
  }

  const handleAddToCart = async (forceClear = false) => {
    setIsSubmitting(true)

    const payload = {
      product_id: meal.id,
      product_name: meal.name,
      price: currentTotalPerItem,
      quantity: quantity,
      image_url: meal.image_url,
      selected_options: {
        size: selectedSize,
        extras: selectedExtras,
        removals: selectedRemovals,
      },
      special_instructions: specialInstructions,
      seller_type: 'restaurant',
      force_clear: forceClear,
    }

    try {
      const response = await api.post('/cart', payload)
      // تحديث السلة في ريدكس بالبيانات المرجعة من الخادم مباشرة
      if (response && response.data) {
        dispatch(setCartData(response.data))
      } else {
        dispatch(fetchCart())
      }
      dispatch(showSuccessNotification(`تمت إضافة "${meal.name}" إلى السلة بنجاح!`))
      setIsSubmitting(false)
      onClose()
    } catch (err) {
      setIsSubmitting(false)
      if (err.response && err.response.status === 409 && err.response.data?.conflict) {
        setConflictModal(err.response.data)
      } else {
        alert(err.response?.data?.message || 'تعذر إضافة الوجبة للسلة')
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 rtl" dir="rtl">
      {/* نافذة تنبيه التعارض إن وجدت */}
      {conflictModal && (
        <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto">
              <ExclamationTriangleIcon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">بدء طلب جديد من هذا المطعم؟</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              {conflictModal.message}
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setConflictModal(null)
                  handleAddToCart(true)
                }}
                className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold transition-colors shadow-md shadow-amber-500/20"
              >
                نعم، إفراغ وبدء الطلب
              </button>
              <button
                onClick={() => setConflictModal(null)}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header with image */}
        <div className="relative h-48 sm:h-56 w-full bg-gray-100 overflow-hidden flex-shrink-0">
          <img
            src={meal.image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600'}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 right-4 left-4 text-white">
            <h2 className="text-xl sm:text-2xl font-bold">{meal.name}</h2>
            {meal.preparation_time && (
              <div className="flex items-center gap-1.5 text-xs text-amber-300 font-medium mt-1">
                <ClockIcon className="w-4 h-4" />
                <span>وقت التحضير المتوقع: {meal.preparation_time} دقيقة</span>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-grow">
          {meal.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {meal.description}
            </p>
          )}

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>اختر الحجم</span>
                <span className="text-xs text-amber-600 font-normal">اختياري</span>
              </h3>
              <div className="space-y-2">
                {sizes.map((s, idx) => (
                  <label
                    key={idx}
                    onClick={() => setSelectedSize(s)}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedSize?.name === s.name
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-bold'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedSize?.name === s.name ? 'border-amber-600 bg-amber-600' : 'border-gray-300'
                      }`}>
                        {selectedSize?.name === s.name && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                      <span className="text-sm">{s.name}</span>
                    </div>
                    <span className="text-sm font-semibold">{s.price} $</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Paid Extras */}
          {extras.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900 flex items-center justify-between">
                <span>إضافات مميزة</span>
                <span className="text-xs text-gray-400 font-normal">اختياري</span>
              </h3>
              <div className="space-y-2">
                {extras.map((extra, idx) => {
                  const isChecked = selectedExtras.some(e => e.name === extra.name)
                  return (
                    <label
                      key={idx}
                      onClick={() => toggleExtra(extra)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        isChecked
                          ? 'border-amber-500 bg-amber-50/40 text-gray-900'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                          isChecked ? 'bg-amber-600 border-amber-600 text-white' : 'border-gray-300 bg-white'
                        }`}>
                          {isChecked && <CheckIcon className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="text-sm">{extra.name}</span>
                      </div>
                      <span className="text-sm font-bold text-amber-600">+{extra.price} $</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {/* Removals / Preferences */}
          {removals.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-gray-900">تفضيلات خاصة (بدون مكونات)</h3>
              <div className="flex flex-wrap gap-2">
                {removals.map((item, idx) => {
                  const isSelected = selectedRemovals.includes(item.name)
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => toggleRemoval(item)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        isSelected
                          ? 'border-rose-500 bg-rose-50 text-rose-700 font-bold'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {item.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Special Instructions */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-gray-900">ملاحظات خاصة للطلب</h3>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="مثال: يرجى وضع الصوص في علبة جانبية، زيادة تحميص الخبز..."
              rows={2}
              className="w-full p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-sm resize-none"
            ></textarea>
          </div>
        </div>

        {/* Footer Bar with Quantity & Action */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center gap-4 flex-shrink-0">
          {/* Quantity Stepper */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <span className="w-10 text-center font-bold text-gray-900 text-base">
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-9 h-9 rounded-lg hover:bg-gray-100 text-gray-700 flex items-center justify-center transition-colors"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => handleAddToCart(false)}
            disabled={isSubmitting}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-lg shadow-amber-500/25 flex items-center justify-between transition-all transform active:scale-[0.98] disabled:opacity-50"
          >
            <span>{isSubmitting ? 'جاري الإضافة...' : 'أضف إلى السلة'}</span>
            <span className="text-amber-100 bg-amber-700/40 px-2.5 py-0.5 rounded-lg text-sm font-mono">
              {totalCalculatedPrice} $
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default FoodOptionsModal
