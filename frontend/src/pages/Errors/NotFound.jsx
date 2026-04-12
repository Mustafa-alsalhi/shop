import React from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* 404 Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <span className="text-2xl font-bold text-gray-600">404</span>
            </div>
            
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
              الصفحة غير موجودة
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Link
              to="/"
              className="w-full btn btn-primary inline-flex items-center justify-center"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              العودة إلى الصفحة الرئيسية
            </Link>
            
            <Link
              to="/products"
              className="w-full btn btn-outline inline-flex items-center justify-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              تصفح المنتجات
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              أو حاول البحث عما تحتاجه
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotFound
