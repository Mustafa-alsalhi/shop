import React from 'react'
import WhatsAppIcon from './WhatsAppIcon'

const WhatsAppButton = ({ phoneNumber, message = "مرحباً، أود الاستفسار عن منتجاتكم" }) => {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 left-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
      aria-label="تواصل معنا عبر واتساب"
    >
      <WhatsAppIcon className="h-6 w-6" />
      <span className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        تواصل معنا عبر واتساب
      </span>
    </a>
  )
}

export default WhatsAppButton
