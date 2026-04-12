import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  BuildingOfficeIcon,
  UserGroupIcon,
  HeartIcon,
  TrophyIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { Helmet } from 'react-helmet-async'

const AboutUs = () => {
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

  const values = [
    {
      icon: HeartIcon,
      title: "العميل أولاً",
      description: "نضع عملاءنا في قلب كل ما نفعل، لضمان خدمة استثنائية ورضاً تاماً."
    },
    {
      icon: ShieldCheckIcon,
      title: "ضمان الجودة",
      description: "يتم اختيار كل منتج بعناية واختباره للوفاء بمعاييرنا العالية من الجودة والموثوقية."
    },
    {
      icon: RocketLaunchIcon,
      title: "الابتكار",
      description: "نبتكر باستمر ونحسن لنقدم لك أحدث المنتجات والحلول المتطورة."
    },
    {
      icon: GlobeAltIcon,
      title: "الوصول العالمي",
      description: "نربط عملاء السعودية بأفضل المنتجات من جميع أنحاء العالم، توصيل إلى عتبة بابك."
    }
  ]

  const stats = [
    { number: "50K+", label: "عملاء سعداء" },
    { number: "1000+", label: "منتج متاح" },
    { number: "99%", label: "رضا العملاء" },
    { number: "24/7", label: "دعم العملاء" }
  ]

  const team = [
    {
      name: "أحمد الرشيد",
      role: "المؤسس والرئيس التنفيذي",
      image: "/api/placeholder/200/200",
      description: "قائد رؤي بخبرة 15+ عاما في التجارة الإلكترونية والتجزئة."
    },
    {
      name: "فاطمة القحطاني",
      role: "رئيسة العمليات",
      image: "/api/placeholder/200/200",
      description: "خبيرة في العمليات تضمان تقديم خدمة سلسة وفعالة."
    },
    {
      name: "خالد السعود",
      role: "رئيسة تجربة العملاء",
      image: "/api/placeholder/200/200",
      description: "مكرسة لتقديم خدمة عملاء استثنائية ودعم."
    },
    {
      name: "نورا الحمدان",
      role: "مديرة التسويق",
      image: "/api/placeholder/200/200",
      description: "عقل إبداعي وراء استراتيجياتنا التسويقية وبناء العلامة التجارية."
    }
  ]

  return (
    <>
      <Helmet>
        <title>من نحن - متجر أصالة</title>
        <meta name="description" content="تعرف على مهمة متجر أصالة وقيمه وفريقه خلف وجهة السعودية الأولى للتسوق عبر الإنترنت." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50" dir="rtl">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-amber-600 to-orange-600 text-white py-20"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6"
              >
                <BuildingOfficeIcon className="h-10 w-10 text-white" />
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">من نحن متجر أصالة</h1>
              <p className="text-xl text-amber-100 max-w-3xl mx-auto">
                شريككم الموثوق في التسوق عبر الإنترنت، نقدم منتجات عالية الجودة وخدمة استثنائية للمملكة العربية السعودية منذ عام 2020.
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
          
          {/* Our Story */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center" dir="rtl">
                <div>
                  <h2 className="text-3xl font-bold text-amber-900 mb-6">قصتنا</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      تأسست في عام 2020، بدأت متجر أصالة برسالة بسيطة: لإحداث ثورة في تجربة التسوق عبر الإنترنت في المملكة العربية السعودية. ما بدأ كعملية صغيرة نمت لتصبح منصة موثوقة تخدم آلاف العملاء في جميع أنحاء المملكة.
                    </p>
                    <p>
                      لاحظنا فجوة في السوق لوجود متجر إلكتروني يركز حقاً على العملاء يجمع بين المنتجات عالية الجودة والأسعار التنافسية والخدمة الاستثنائية. جاء مؤسسونا، بخبرة واسعة في التجزئة والتكنولوجيا، معاً لسد هذه الفجوة.
                    </p>
                    <p>
                      اليوم، نفخر بأن نكون واحدة من أسرع منصات التجارة الإلكترونية نمواً في المملكة العربية السعودية، ونقدم تشكيلة مختارة من المنتجات عبر فئات متعددة، كل ذلك مدعوم بالتزامنا بالجودة ورضا العملاء.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <img 
                    src="/images/about-story.png" 
                    alt="قصة متجر أصالة"
                    className="aspect-square w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-amber-900/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6" dir="rtl">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-amber-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Our Values */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-4">قيمنا</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                المبادئ التي ترشد كل ما نفعل، من اختيار المنتجات إلى خدمة العملاء.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-amber-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Our Mission & Vision */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" dir="rtl">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8">
                <TrophyIcon className="h-12 w-12 text-amber-600 mb-4" />
                <h3 className="text-2xl font-bold text-amber-900 mb-4">مهمتنا</h3>
                <p className="text-gray-700">
                  توفير تجربة تسوق سلسة وموثوقة وممتعة لعملاء السعودية من خلال تقديم منتجات عالية الجودة وأسعار تنافسية وخدمة عملاء استثنائية.
                </p>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8">
                <RocketLaunchIcon className="h-12 w-12 text-amber-600 mb-4" />
                <h3 className="text-2xl font-bold text-amber-900 mb-4">رؤيتنا</h3>
                <p className="text-gray-700">
                  أن نصبح المنصة الرائدة في التجارة الإلكترونية في المملكة العربية، ونضع معايير جديدة لرضا العملاء والابتكار في التجزئة عبر الإنترنت.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Our Team */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-amber-900 mb-4">تعرف على فريقنا</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                الأفراد الشغوفون وراء الكوال لجعل تجربة التسوق استثنائية.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                    <UserGroupIcon className="h-16 w-16 text-amber-600" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-amber-900 mb-1">{member.name}</h3>
                    <p className="text-amber-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">انضم إلى رحلتنا</h2>
              <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
                كن جزءاً من ثورة التجارة الإلكترونية في المملكة العربية. تسوق معنا واختبر الفرق.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center" dir="rtl">
                <button className="px-8 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-colors">
                  ابدأ التسوق
                </button>
                <button className="px-8 py-3 bg-amber-700 text-white font-semibold rounded-lg hover:bg-amber-800 transition-colors">
                  اتصل بنا
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}

export default AboutUs
