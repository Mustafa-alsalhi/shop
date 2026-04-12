import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon, 
  ClockIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline'
import { Helmet } from 'react-helmet-async'

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    } catch (error) {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>اتصل بنا - متجر أصالة</title>
        <meta name="description" content="تواصل مع متجر أصالة عبر الهاتف أو البريد الإلكتروني أو زيارتنا في الرياض" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12" dir="rtl">
        <div className="container-custom">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              اتصل بنا
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              نحن هنا لمساعدتك. تواصل معنا عبر أي من الطرق التالية وسنرد عليك في أقرب وقت ممكن.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-amber-200/30 h-full">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center space-x-reverse space-x-2">
                  <PhoneIcon className="h-6 w-6 text-amber-600" />
                  معلومات الاتصال
                </h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-reverse space-x-3">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <PhoneIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">الهاتف</h3>
                      <p className="text-gray-600">+966 77 678 0551</p>
                      <p className="text-sm text-amber-700">السبت - الخميس: 9 ص - 9 م</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-reverse space-x-3">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <EnvelopeIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">البريد الإلكتروني</h3>
                      <p className="text-gray-600">support@asalah.store</p>
                      <p className="text-sm text-amber-700">رد خلال 24 ساعة</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-reverse space-x-3">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <MapPinIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">العنوان</h3>
                      <p className="text-gray-600">
                        شارع الملك فهد<br />
                        الرياض، المملكة العربية السعودية<br />
                        الرمز البريدي 12345
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-reverse space-x-3">
                    <div className="p-3 bg-amber-100 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900 mb-1">ساعات العمل</h3>
                      <p className="text-gray-600">
                        السبت - الخميس: 9 ص - 9 م<br />
                        الجمعة: 2 م - 9 م
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-2"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-8 border border-amber-200/30">
                <h2 className="text-2xl font-bold text-amber-900 mb-6 flex items-center space-x-reverse space-x-2">
                  <PaperAirplaneIcon className="h-6 w-6 text-amber-600" />
                  أرسل لنا رسالة
                </h2>

                {submitStatus === 'success' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <p className="text-green-700 font-semibold">
                      ✅ تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.
                    </p>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <p className="text-red-700 font-semibold">
                      ❌ حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى.
                    </p>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-amber-700 mb-2">
                        الاسم الكامل *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                        placeholder="أدخل اسمك الكامل"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-amber-700 mb-2">
                        البريد الإلكتروني *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                        placeholder="أدخل بريدك الإلكتروني"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-amber-700 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                      placeholder="أدخل رقم هاتفك"
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-amber-700 mb-2">
                      الموضوع *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm"
                      placeholder="موضوع رسالتك"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-amber-700 mb-2">
                      الرسالة *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white/80 backdrop-blur-sm resize-none"
                      placeholder="اكتب رسالتك هنا..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      type="submit"
                      disabled={isSubmitting}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:from-amber-700 hover:to-amber-800 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-reverse space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full border-2 border-amber-200 border-t-amber-600 h-5 w-5"></div>
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="h-5 w-5" />
                          إرسال الرسالة
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-4">
                الأسئلة الشائعة
              </h2>
              <p className="text-gray-600">
                قد تجد إجابة لسؤالك في قسم الأسئلة الشائعة
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  question: "كيف يمكنني تتبع طلبي؟",
                  answer: "يمكنك تتبع طلبك من خلال حسابك في موقعنا أو عبر رابط التتبع المرسل إلى بريدك الإلكتروني."
                },
                {
                  question: "ما هي سياسة الإرجاع؟",
                  answer: "نوفر سياسة إرجاع لمدة 30 يوماً من تاريخ الاستلام للمنتجات غير المستخدمة."
                },
                {
                  question: "هل توفرن الشحن المجاني؟",
                  answer: "نعم، نوفر الشحن المجاني للطلبات التي تتجاوز 50 ريال سعودي."
                },
                {
                  question: "كم يستغرق التوصيل؟",
                  answer: "يستغرق التوصيل عادةً 2-3 أيام عمل داخل المدن الرئيسية و 5-7 أيام للمناطق الأخرى."
                },
                {
                  question: "كيف يمكنني الدفع؟",
                  answer: "نقبل جميع بطاقات الائتمان الرئيسية، الدفع عند الاستلام، والدفع عبر البنوك الإلكترونية."
                },
                {
                  question: "هل المنتجات أصلية؟",
                  answer: "نعم، نضمن أصالة جميع منتجاتنا ونوفر شهادات ضمان لكل منتج."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-amber-200/30 hover:shadow-lg transition-all duration-300"
                >
                  <h3 className="font-semibold text-amber-900 mb-3">
                    {faq.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  )
}

export default ContactUs
