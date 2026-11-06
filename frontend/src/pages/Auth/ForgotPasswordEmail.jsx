import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { forgotPassword, selectIsLoading, selectError, clearError } from '../../store/slices/authSlice'
import { showSuccessNotification, showErrorNotification } from '../../store/slices/uiSlice'

const normalizeYemeniPhoneInput = (rawValue) => {
  if (!rawValue) return ''
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩', '۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  let cleaned = String(rawValue)
  arabicDigits.forEach((d, idx) => {
    cleaned = cleaned.replaceAll(d, englishDigits[idx])
  })
  return cleaned
}

const isValidYemeniPhone = (rawPhone) => {
  const cleaned = normalizeYemeniPhoneInput(rawPhone).replace(/\D+/g, '')
  let digits = cleaned
  if (digits.startsWith('00967')) digits = digits.slice(5)
  else if (digits.startsWith('967') && digits.length >= 12) digits = digits.slice(3)
  if (digits.length === 10 && digits.startsWith('0')) digits = digits.slice(1)
  return /^7[01378]\d{7}$/.test(digits)
}

const ForgotPasswordEmail = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const isLoading = useSelector(selectIsLoading)
  const error = useSelector(selectError)

  const [formData, setFormData] = useState({
    phone: '',
  })
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: normalizeYemeniPhoneInput(value) }))

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}

    if (!formData.phone?.trim()) {
      errors.phone = 'رقم الجوال مطلوب'
    } else if (!isValidYemeniPhone(formData.phone)) {
      errors.phone = 'يرجى إدخال رقم جوال يمني صحيح يبدأ بـ 77 أو 73 أو 71 أو 70 (9 أرقام)'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(forgotPassword({ phone: formData.phone }))
      if (result.meta.requestStatus === 'fulfilled') {
        const targetPhone = result.payload?.phone || formData.phone
        dispatch(showSuccessNotification('تم إرسال رمز استعادة كلمة المرور في رسالة نصية إلى رقم جوالك!'))
        navigate(`/reset-password?phone=${encodeURIComponent(targetPhone)}`)
      }
    } catch (err) {
      dispatch(showErrorNotification('فشل في إرسال رمز إعادة تعيين كلمة المرور'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8" dir="rtl">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            استعادة كلمة المرور
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            أدخل رقم جوالك اليمني وسنرسل لك رمز تحقق (OTP) عبر الواتساب لإعادة تعيين كلمة المرور.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              رقم الجوال اليمني
            </label>
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                dir="ltr"
                autoComplete="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                className={`input pl-16 text-right ${validationErrors.phone ? 'input-error' : ''}`}
                placeholder="771234567"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded" dir="ltr">
                  +967
                </span>
              </div>
            </div>
            {validationErrors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.phone}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn btn-primary"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner h-5 w-5 ml-2"></div>
                  جاري الإرسال...
                </div>
              ) : (
                'إرسال رمز إعادة التعيين (OTP)'
              )}
            </button>
          </div>
        </form>

        <div className="text-center">
          <Link
            to="/forgot-password"
            className="font-medium text-amber-600 hover:text-amber-500"
          >
            العودة للخيارات
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ForgotPasswordEmail
