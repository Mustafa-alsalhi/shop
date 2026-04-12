import React from 'react'
import { CogIcon, BellIcon, GlobeAltIcon, ShieldCheckIcon, CreditCardIcon, UserGroupIcon } from '@heroicons/react/24/outline'

const AdminSettings = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <div className="max-w-7xl mx-auto py-6">
        {/* Header */}
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100 p-6 mb-6">
          <div className="flex items-center space-x-reverse space-x-3">
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl">
              <CogIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              إعدادات النظام
            </h1>
          </div>
        </div>
        
        <div className="bg-white shadow-xl rounded-2xl border border-gray-100">
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center space-x-reverse space-x-3">
              <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                <CogIcon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                الإعدادات العامة
              </h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Store Settings */}
              <div className="space-y-6">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                    <GlobeAltIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">إعدادات المتجر</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
                    <input
                      type="text"
                      defaultValue="ShopHub"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني للمتجر</label>
                    <input
                      type="email"
                      defaultValue="admin@shophub.com"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العملة</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50">
                      <option value="USD">USD - دولار أمريكي</option>
                      <option value="EUR">EUR - يورو</option>
                      <option value="GBP">GBP - جنيه إسترليني</option>
                      <option value="SAR">SAR - ريال سعودي</option>
                      <option value="AED">AED - درهم إماراتي</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                    <input
                      type="tel"
                      defaultValue="+966 50 123 4567"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                    <textarea
                      rows="3"
                      defaultValue=" الرياض، المملكة العربية السعودية"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="space-y-6">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                    <BellIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">إعدادات الإشعارات</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        إشعارات البريد الإلكتروني للطلبات الجديدة
                      </label>
                    </div>
                    <BellIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        إشعارات البريد الإلكتروني للمستخدمين الجدد
                      </label>
                    </div>
                    <UserGroupIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        إشعارات الرسائل النصية
                      </label>
                    </div>
                    <BellIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Payment Settings */}
              <div className="space-y-6">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                    <CreditCardIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">إعدادات الدفع</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        تفعيل مدفوعات بطاقة الائتمان
                      </label>
                    </div>
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        تفعيل مدفوعات PayPal
                      </label>
                    </div>
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        تفعيل الدفع عند الاستلام
                      </label>
                    </div>
                    <CreditCardIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-6">
                <div className="flex items-center space-x-reverse space-x-3">
                  <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                    <ShieldCheckIcon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">إعدادات الأمان</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        تفعيل المصادقة الثنائية
                      </label>
                    </div>
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={true}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        تفعيل تسجيل الدخول التلقائي
                      </label>
                    </div>
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-reverse space-x-3">
                      <input
                        type="checkbox"
                        defaultChecked={false}
                        className="h-5 w-5 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <label className="text-sm font-medium text-gray-900">
                        تفعيل تحقق البريد الإلكتروني
                      </label>
                    </div>
                    <ShieldCheckIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="mt-8 flex justify-end">
              <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 font-medium">
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
