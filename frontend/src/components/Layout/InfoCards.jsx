import React from 'react'
import { Link } from 'react-router-dom'

const InfoCards = () => {
  return (
    <div className="bg-white py-4 sm:py-6 lg:py-8 border-t border-gray-200">
      <div className="w-full mx-auto px-0 sm:px-2 md:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          <Link 
            to="/about-us" 
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 sm:p-4 lg:p-5 text-center hover:shadow-md transition-all hover:scale-105 cursor-pointer group flex-1 w-full sm:w-auto"
          >
            <div className="w-12 h-12 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-3 lg:mb-4 group-hover:bg-blue-600 transition-colors">
              <svg className="w-6 h-6 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-2 lg:mb-3 tracking-tight">من نحن</h3>
            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 leading-relaxed">اعرف المزيد عن شركتنا</p>
          </Link>

          <Link 
            to="/contact-us" 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 sm:p-4 lg:p-5 text-center hover:shadow-md transition-all hover:scale-105 cursor-pointer group flex-1 w-full sm:w-auto"
          >
            <div className="w-12 h-12 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-3 lg:mb-4 group-hover:bg-green-600 transition-colors">
              <svg className="w-6 h-6 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-2 lg:mb-3 tracking-tight">اتصل بنا</h3>
            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 leading-relaxed">نحن هنا للمساعدة</p>
          </Link>

          <Link 
            to="/contact-us#faq" 
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 sm:p-4 lg:p-5 text-center hover:shadow-md transition-all hover:scale-105 cursor-pointer group flex-1 w-full sm:w-auto"
          >
            <div className="w-12 h-12 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-3 lg:mb-4 group-hover:bg-purple-600 transition-colors">
              <svg className="w-6 h-6 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-sm sm:text-base lg:text-lg text-gray-900 mb-2 sm:mb-2 lg:mb-3 tracking-tight">الأسئلة الشائعة</h3>
            <p className="text-xs sm:text-sm lg:text-base font-medium text-gray-600 leading-relaxed">احصل على جميع الإجابات</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default InfoCards
