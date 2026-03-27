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
      title: "Customer First",
      description: "We put our customers at the heart of everything we do, ensuring exceptional service and satisfaction."
    },
    {
      icon: ShieldCheckIcon,
      title: "Quality Assurance",
      description: "Every product is carefully selected and tested to meet our high standards of quality and reliability."
    },
    {
      icon: RocketLaunchIcon,
      title: "Innovation",
      description: "We constantly innovate and improve to bring you the latest products and cutting-edge solutions."
    },
    {
      icon: GlobeAltIcon,
      title: "Global Reach",
      description: "Connecting Saudi customers with the best products from around the world, delivered to your doorstep."
    }
  ]

  const stats = [
    { number: "50K+", label: "Happy Customers" },
    { number: "1000+", label: "Products Available" },
    { number: "99%", label: "Customer Satisfaction" },
    { number: "24/7", label: "Customer Support" }
  ]

  const team = [
    {
      name: "Ahmed Al-Rashid",
      role: "Founder & CEO",
      image: "/api/placeholder/200/200",
      description: "Visionary leader with 15+ years in e-commerce and retail."
    },
    {
      name: "Fatima Al-Qahtani",
      role: "Chief Operating Officer",
      image: "/api/placeholder/200/200",
      description: "Operations expert ensuring smooth and efficient service delivery."
    },
    {
      name: "Khalid Al-Saud",
      role: "Head of Customer Experience",
      image: "/api/placeholder/200/200",
      description: "Dedicated to providing exceptional customer service and support."
    },
    {
      name: "Nora Al-Hamdan",
      role: "Marketing Director",
      image: "/api/placeholder/200/200",
      description: "Creative mind behind our marketing strategies and brand building."
    }
  ]

  return (
    <>
      <Helmet>
        <title>About Us - My Store</title>
        <meta name="description" content="Learn about My Store's mission, values, and the team behind Saudi Arabia's premier online shopping destination." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20"
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
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About My Store</h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto">
                Your trusted partner in online shopping, bringing quality products and exceptional service to Saudi Arabia since 2020.
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>
                      Founded in 2020, My Store began with a simple mission: to revolutionize the online shopping experience in Saudi Arabia. What started as a small operation has grown into a trusted platform serving thousands of customers across the Kingdom.
                    </p>
                    <p>
                      We noticed a gap in the market for a truly customer-centric online store that combines quality products, competitive pricing, and exceptional service. Our founders, with extensive experience in retail and technology, came together to fill this gap.
                    </p>
                    <p>
                      Today, we're proud to be one of Saudi Arabia's fastest-growing e-commerce platforms, offering a curated selection of products across multiple categories, all backed by our commitment to quality and customer satisfaction.
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center">
                    <SparklesIcon className="h-24 w-24 text-primary-600" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="text-3xl md:text-4xl font-bold text-primary-600 mb-2">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The principles that guide everything we do, from product selection to customer service.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl p-6 text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                    <value.icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Our Mission & Vision */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl p-8">
                <TrophyIcon className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h3>
                <p className="text-gray-700">
                  To provide Saudi customers with a seamless, trustworthy, and enjoyable online shopping experience by offering quality products, competitive prices, and exceptional customer service.
                </p>
              </div>
              <div className="bg-gradient-to-br from-secondary-50 to-secondary-100 rounded-2xl p-8">
                <RocketLaunchIcon className="h-12 w-12 text-secondary-600 mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                <p className="text-gray-700">
                  To become the leading e-commerce platform in Saudi Arabia, setting new standards for customer satisfaction and innovation in online retail.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Our Team */}
          <motion.div variants={itemVariants} className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                The passionate individuals working behind the scenes to make your shopping experience exceptional.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <UserGroupIcon className="h-16 w-16 text-gray-400" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                    <p className="text-primary-600 font-medium mb-2">{member.role}</p>
                    <p className="text-gray-600 text-sm">{member.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div variants={itemVariants}>
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 md:p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                Be part of Saudi Arabia's growing e-commerce revolution. Shop with us and experience the difference.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="px-8 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-50 transition-colors">
                  Start Shopping
                </button>
                <button className="px-8 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors">
                  Contact Us
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
