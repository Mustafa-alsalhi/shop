import React from 'react'
import { Link } from 'react-router-dom'

const InfoCards = () => {
  return (
    <div className="bg-white py-8 border-t border-gray-200">
      <div className="container-custom">
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 xl:gap-8">
          <Link 
            to="/about-us" 
            className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 text-center hover:shadow-md transition-all hover:scale-105 cursor-pointer group flex-1 min-w-[200px] max-w-[280px]"
          >
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-600 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">من نحن</h3>
            <p className="text-sm text-gray-600">اعرف المزيد عن شركتنا</p>
          </Link>

          <Link 
            to="/contact-us" 
            className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 text-center hover:shadow-md transition-all hover:scale-105 cursor-pointer group flex-1 min-w-[200px] max-w-[280px]"
          >
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-600 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">اتصل بنا</h3>
            <p className="text-sm text-gray-600">نحن هنا للمساعدة</p>
          </Link>

          <Link 
            to="/contact-us#faq" 
            className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 text-center hover:shadow-md transition-all hover:scale-105 cursor-pointer group flex-1 min-w-[200px] max-w-[280px]"
          >
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-600 transition-colors">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">الأسئلة الشائعة</h3>
            <p className="text-sm text-gray-600">احصل على جميع الإجابات</p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default InfoCards
