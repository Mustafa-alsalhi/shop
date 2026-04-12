import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TruckIcon,
  ClockIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { Helmet } from 'react-helmet-async'

const ShippingInfo = () => {
  const [selectedCity, setSelectedCity] = useState('riyadh')
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  }

  const shippingOptions = [
    {
      type: "التوصيل القياسي",
      icon: TruckIcon,
      time: "3-5 أيام عمل",
      price: "مجاني (للطلبات فوق 200 ريال)",
      description: "توصيل موثوق لجميع المدن الرئيسية في السعودية."
    },
    {
      type: "التوصيل السريع",
      icon: ClockIcon,
      time: "1-2 أيام عمل",
      price: "25 ريال",
      description: "توصيل سريع للطلبات العاجلة في الرياض، جدة، والدمام."
    },
    {
      type: "التوصيل في نفس اليوم",
      icon: RocketLaunchIcon,
      time: "نفس اليوم",
      price: "50 ريال",
      description: "متاح لطلبات الرياض المقدمة قبل الساعة 12 ظهراً."
    }
  ]

  const cities = [
    { id: 'riyadh', name: 'الرياض', deliveryTime: '1-3 أيام', expressAvailable: true },
    { id: 'jeddah', name: 'جدة', deliveryTime: '2-4 أيام', expressAvailable: true },
    { id: 'dammam', name: 'الدمام', deliveryTime: '2-4 أيام', expressAvailable: true },
    { id: 'mecca', name: 'مكة', deliveryTime: '3-5 أيام', expressAvailable: false },
    { id: 'medina', name: 'المدينة', deliveryTime: '3-5 أيام', expressAvailable: false },
    { id: 'khobar', name: 'الخبر', deliveryTime: '2-4 أيام', expressAvailable: true }
  ]

  const shippingPolicies = [
    {
      title: "وقت معالجة الطلب",
      icon: ClockIcon,
      content: "يتم معالجة الطلبات خلال 24 ساعة في أيام العمل. الطلبات المقدمة بعد الساعة 2 مساءً تتم معالجتها في يوم العمل التالي."
    },
    {
      title: "تأكيد الشحن",
      icon: CheckCircleIcon,
      content: "ستتلقى بريداً إلكترونياً بتأكيد الشحن ومعلومات التتبع بمجرد شحن طلبك. تتبع طردك في الوقت الفعلي من خلال موقعنا أو نظام التتبع الخاص بالشركة."
    },
    {
      title: "تأمين الشحن",
      icon: ShieldCheckIcon,
      content: "جميع الطلبات مؤمنة تلقائياً ضد الضياع أو التلف أثناء النقل. إذا فقد طردك أو تلف، سنعيد شحنه أو نسترد أموالك."
    },
    {
      title: "الرسوم الجمركية",
      icon: CurrencyDollarIcon,
      content: "للطلبات المحلية داخل السعودية، لا توجد رسوم جمركية إضافية. جميع الأسعار تشمل الضرائب المطبقة."
    }
  ]

  const restrictions = [
    "عناصر الأثاث الكبيرة فوق 50 كجم",
    "المواد الخطرة والمواد الكيميائية",
    "العناصر القابلة للتلف",
    "الحيوانات الحية أو النباتات",
    "العناصر التي تتطلب معاملة خاصة أو تحكم في درجة الحرارة"
  ]

  return (
    <>
      <Helmet>
        <title>معلومات الشحن - متجر أصالة</title>
        <meta name="description" content="معلومات الشحن الكاملة لمتجر أصالة السعودية. خيارات التوصيل، الأسعار، والسياسات." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-16"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6"
              >
                <TruckIcon className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">معلومات الشحن</h1>
              <p className="text-xl text-amber-100 max-w-3xl mx-auto">
                توصيل سريع وموثوق وبأسعار معقولة عبر السعودية. تتبع طلباتك في كل خطوة.
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        >
          
          {/* Shipping Options */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-4">خيارات الشحن</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                اختر طريقة التوصيل التي تناسب احتياجاتك وجدولك الزمني.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" dir="rtl">
              {shippingOptions.map((option, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow border border-amber-200/30">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center ml-4">
                      <option.icon className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-amber-900">{option.type}</h3>
                      <p className="text-sm text-gray-500">{option.time}</p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-amber-600 mb-2">{option.price}</p>
                  <p className="text-gray-600 text-sm">{option.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Delivery Areas */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-200/30">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">مناطق التوصيل والأوقات</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" dir="rtl">
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">اختر مدينتك</h3>
                  <div className="grid grid-cols-2 gap-3" dir="rtl">
                    {cities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => setSelectedCity(city.id)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          selectedCity === city.id
                            ? 'border-amber-500 bg-amber-50 text-amber-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.deliveryTime}</div>
                        {city.expressAvailable && (
                          <div className="text-xs text-amber-600 mt-1">متاح السريع</div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-amber-900 mb-4">معلومات التوصيل</h3>
                  <div className="bg-amber-50 rounded-lg p-4">
                    {(() => {
                      const city = cities.find(c => c.id === selectedCity)
                      return (
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <MapPinIcon className="h-5 w-5 text-amber-600 ml-2" />
                            <span className="font-medium">{city?.name}</span>
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="h-5 w-5 text-amber-600 ml-2" />
                            <span>القياسي: {city?.deliveryTime}</span>
                          </div>
                          {city?.expressAvailable && (
                            <div className="flex items-center">
                              <TruckIcon className="h-5 w-5 text-amber-600 ml-2" />
                              <span>السريع: 1-2 أيام</span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Shipping Policies */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-4">سياسات الشحن</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                كل ما تحتاج لمعرفته عن عملية الشحن وسياساتنا.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" dir="rtl">
              {shippingPolicies.map((policy, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200/30">
                  <div className="flex items-start mb-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                      <policy.icon className="h-5 w-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-amber-900">{policy.title}</h3>
                  </div>
                  <p className="text-gray-600">{policy.content}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Shipping Restrictions */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-8 w-8 text-amber-600 ml-3" />
                <h3 className="text-xl font-bold text-amber-900">قيود الشحن</h3>
              </div>
              <p className="text-gray-700 mb-4">
                العناصر التالية لا يمكن شحنها عبر خدمة التوصيل القياسية:
              </p>
              <ul className="space-y-2">
                {restrictions.map((restriction, index) => (
                  <li key={index} className="flex items-center text-gray-700">
                    <div className="w-2 h-2 bg-amber-500 rounded-full ml-3"></div>
                    {restriction}
                  </li>
                ))}
              </ul>
              <p className="text-gray-600 mt-4 text-sm">
                لمتطلبات المعاملة الخاصة، يرجى التواصل مع فريق خدمة العملاء.
              </p>
            </div>
          </motion.div>

          {/* Tracking Information */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center" dir="rtl">
                <div>
                  <h3 className="text-2xl font-bold mb-4">تتبع طلبك</h3>
                  <p className="text-amber-100 mb-6">
                    ابق على اطلاع على حالة طلبك مع نظام التتبع في الوقت الفعلي. احصل على إشعارات في كل خطوة من رحلة التوصيل.
                  </p>
                  <button className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                    تتبع الطلب
                  </button>
                </div>
                <div className="flex justify-center">
                  <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center">
                    <TruckIcon className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* FAQ Section */}
          <motion.div variants={itemVariants}>
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-amber-200/30">
              <h2 className="text-2xl font-bold text-amber-900 mb-6">الأسئلة المتكررة</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">كم تكلفة الشحن؟</h3>
                  <p className="text-gray-600">الشحن القياسي مجاني للطلبات فوق 200 ريال. للطلبات أقل من هذا المبلغ، تكلفة الشحن 15 ريال. التوصيل السريع وفي نفس اليوم له رسوم إضافية.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">هل يمكنني تغيير عنوان التوصيل بعد تقديم الطلب؟</h3>
                  <p className="text-gray-600">تغيير العنوان ممكن خلال ساعتين من تقديم الطلب. بعد هذا الوقت، يرجى التواصل مع خدمة العملاء فوراً للمساعدة.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">ماذا لو لم أكن في المنزل عند وصول طردتي؟</h3>
                  <p className="text-gray-600">فريق التوصيل سيحاول التسليم مرتين. إذا لم ينجح، ستكون طردتك متاحة للاستلام في أقرب نقطة تجميع.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-amber-900 mb-2">هل تشحنون إلى صناديق البريد؟</h3>
                  <p className="text-gray-600">لا، نسلم فقط إلى عناوين فعلية داخل السعودية. يرجى تقديم عنوان توصيل كامل ودقيق.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default ShippingInfo
