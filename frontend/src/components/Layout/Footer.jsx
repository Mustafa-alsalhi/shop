import React from 'react'
import { Link } from 'react-router-dom'
import {
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ShareIcon,
  ChatBubbleLeftIcon,
  HeartIcon,
  UserIcon,
  GlobeAltIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  TruckIcon,
  ArrowPathIcon,
  ClockIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-br from-amber-900 via-orange-900 to-amber-950 text-white" dir="rtl">
      {/* Wave Pattern Top Border */}
      <div className="relative">
        <svg className="absolute top-0 left-0 right-0 h-2 w-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
                fill="url(#gradient)"></path>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#92400e" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div className="container-custom py-8 sm:py-10 lg:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8" dir="rtl">
          {/* Company Info */}
          <div className="space-y-4 sm:space-y-5">
            <div className="flex items-center space-x-reverse space-x-4">
              <img 
                src="/images/logo2.png" 
                alt="متجر أصالة" 
                className="w-[105px] h-[105px] object-contain"
              />
              <div className="space-y-1">
                <span className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-amber-400 bg-clip-text text-transparent">متجر أصالة</span>
                <p className="text-xs text-gray-400">متجرك المفضل</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed text-sm mt-6">
              وجهتك الأولى للتسوق الموثوقة للمنتجات عالية الجودة بأسعار تنافسية وخدمة عملاء ممتازة.
            </p>
            
            {/* Social Media Icons */}
            <div className="space-y-2">
              <h4 className="text-lg font-semibold text-amber-300">تابعنا على</h4>
              <div className="flex space-x-reverse space-x-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-amber-600/20 hover:bg-amber-600 rounded-xl transition-all duration-300 hover:scale-110 group"
                  aria-label="Facebook"
                >
                  <svg className="h-5 w-5 text-amber-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-amber-600/20 hover:bg-amber-600 rounded-xl transition-all duration-300 hover:scale-110 group"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5 text-amber-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-amber-600/20 hover:bg-amber-600 rounded-xl transition-all duration-300 hover:scale-110 group"
                  aria-label="Instagram"
                >
                  <svg className="h-5 w-5 text-amber-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-amber-600/20 hover:bg-amber-600 rounded-xl transition-all duration-300 hover:scale-110 group"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5 text-amber-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-amber-600/20 hover:bg-amber-600 rounded-xl transition-all duration-300 hover:scale-110 group"
                  aria-label="YouTube"
                >
                  <svg className="h-5 w-5 text-amber-400 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-3 sm:mb-4 text-amber-300 flex items-center space-x-reverse space-x-2">
              <GlobeAltIcon className="h-5 w-5 text-amber-400" />
              <span>روابط سريعة</span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>الرئيسية</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/categories"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>الفئات</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>من نحن</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>العروض والخصومات</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>اتصل بنا</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-bold mb-3 sm:mb-4 text-amber-300 flex items-center space-x-reverse space-x-2">
              <HeartIcon className="h-5 w-5 text-amber-400" />
              <span>خدمة العملاء</span>
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact-us"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>اتصل بنا</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/about-us"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>من نحن</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping-info"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>معلومات الشحن</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>الإرجاع والاسترداد</span>
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="text-gray-300 hover:text-amber-400 transition-all duration-300 hover:translate-x-1 flex items-center space-x-reverse space-x-2"
                >
                  <ChevronRightIcon className="h-4 w-4" />
                  <span>الأسئلة المتكررة</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info & Features */}
          <div>
            <h3 className="text-lg font-bold mb-3 sm:mb-4 text-amber-300 flex items-center space-x-reverse space-x-2">
              <PhoneIcon className="h-5 w-5 text-amber-400" />
              <span>معلومات الاتصال</span>
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="p-2 bg-amber-600/20 rounded-lg">
                  <PhoneIcon className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-gray-300">+966 77 678 0551</span>
              </div>
              <div className="flex items-center space-x-reverse space-x-3">
                <div className="p-2 bg-amber-600/20 rounded-lg">
                  <EnvelopeIcon className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-gray-300">support@asalah.store</span>
              </div>
              <div className="flex items-start space-x-reverse space-x-3">
                <div className="p-2 bg-amber-600/20 rounded-lg mt-1">
                  <MapPinIcon className="h-5 w-5 text-amber-400" />
                </div>
                <span className="text-gray-300">
                  شارع الملك فهد<br />
                  الرياض، المملكة العربية السعودية<br />
                  الرمز البريدي 12345
                </span>
              </div>
            </div>

            {/* Features */}
            <div className="mt-4 space-y-2">
              <h4 className="font-bold text-amber-300 mb-2">خدماتنا</h4>
              <div className="space-y-1">
                <div className="flex items-center space-x-reverse space-x-3">
                  <TruckIcon className="h-5 w-5 text-amber-400" />
                  <span className="text-gray-300 text-sm">شحن سريع</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-3">
                  <ShieldCheckIcon className="h-5 w-5 text-amber-400" />
                  <span className="text-gray-300 text-sm">دفع آمن</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-3">
                  <ArrowPathIcon className="h-5 w-5 text-amber-400" />
                  <span className="text-gray-300 text-sm">إرجاع سهل</span>
                </div>
                <div className="flex items-center space-x-reverse space-x-3">
                  <ClockIcon className="h-5 w-5 text-amber-400" />
                  <span className="text-gray-300 text-sm">دعم 24/7</span>
                </div>
              </div>
            </div>

            {/* Newsletter */}
            <div className="mt-4">
              <h4 className="font-bold text-amber-300 mb-2">النشرة البريدية</h4>
              <p className="text-gray-300 text-sm mb-2">
                اشترك للحصول على عروض حصرية وتحديثات المنتجات
              </p>
              <div className="flex flex-row-reverse">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-amber-500/30 rounded-r-lg focus:outline-none focus:border-amber-400 text-white placeholder-gray-400 transition-all duration-300"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-l-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-semibold hover:shadow-lg">
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-amber-700/50 mt-6 pt-4">
          <div className="flex flex-col md:flex-row-reverse justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm text-center md:text-right">
              © {currentYear} متجر أصالة. جميع الحقوق محفوظة.
            </div>
            <div className="flex flex-wrap justify-center md:justify-end space-x-reverse space-x-4 text-sm">
              <Link
                to="/privacy"
                className="text-gray-300 hover:text-amber-400 transition-all duration-300 px-2 py-1"
              >
                سياسة الخصوصية
              </Link>
              <Link
                to="/terms"
                className="text-gray-300 hover:text-amber-400 transition-all duration-300 px-2 py-1"
              >
                شروط الخدمة
              </Link>
              <Link
                to="/cookies"
                className="text-gray-300 hover:text-amber-400 transition-all duration-300 px-2 py-1"
              >
                سياسة الكوكيز
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
