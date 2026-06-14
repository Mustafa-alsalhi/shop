import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DocumentTextIcon } from '@heroicons/react/24/outline'
import api from '../services/api'

const Policy = () => {
  const { type } = useParams()
  const [policy, setPolicy] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPolicy()
  }, [type])

  const fetchPolicy = async () => {
    try {
      const response = await api.get(`/policies/${type}`)
      setPolicy(response.data.data)
    } catch (err) {
      console.error('Failed to fetch policy:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPolicyTitle = (policyType) => {
    const titles = {
      'return_policy': 'سياسة الاسترجاع',
      'exchange_policy': 'سياسة الاستبدال',
      'cancellation_policy': 'سياسة الإلغاء',
      'shipping_policy': 'سياسة الشحن',
      'privacy_policy': 'سياسة الخصوصية',
      'terms_of_service': 'شروط الخدمة',
      'cookies_policy': 'سياسة الكوكيز'
    }
    return titles[policyType] || 'السياسة'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner h-12 w-12"></div>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">السياسة غير موجودة</h2>
          <p className="text-gray-500">لم يتم العثور على هذه السياسة</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-center mb-4">
            <DocumentTextIcon className="h-12 sm:h-16 w-12 sm:w-16 text-amber-600" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 text-center mb-3 sm:mb-4">
            {policy.title || getPolicyTitle(type)}
          </h1>
          {policy.description && (
            <p className="text-gray-600 text-center text-sm sm:text-base">{policy.description}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div 
            className="prose prose-sm sm:prose-base max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: policy.content }}
          />
        </div>
      </div>
    </div>
  )
}

export default Policy
