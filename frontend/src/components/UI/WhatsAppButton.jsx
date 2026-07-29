import React from 'react'
import { useSelector } from 'react-redux'
import WhatsAppIcon from './WhatsAppIcon'
import { selectWhatsAppUrl } from '../../store/slices/settingsSlice'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from '../../config/whatsapp'

const WhatsAppButton = ({ message = WHATSAPP_MESSAGES.default }) => {
  const whatsappUrlFromSettings = useSelector(selectWhatsAppUrl)
  const settings = useSelector((state) => state.settings.data)
  
  console.log('WhatsAppButton - Full settings data:', settings)
  console.log('WhatsAppButton - URL from settings:', whatsappUrlFromSettings)
  console.log('WhatsAppButton - Default WHATSAPP_NUMBER:', WHATSAPP_NUMBER)
  
  // Extract phone number from settings URL if it's a full URL
  let phoneNumber
  if (whatsappUrlFromSettings) {
    // If the URL contains https://wa.me/, extract the phone number
    if (whatsappUrlFromSettings.includes('wa.me/')) {
      phoneNumber = whatsappUrlFromSettings.split('wa.me/')[1].split('?')[0]
    } else {
      // Otherwise, use it as is (assuming it's just the phone number)
      phoneNumber = whatsappUrlFromSettings
    }
  } else {
    phoneNumber = WHATSAPP_NUMBER
  }
  
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  console.log('WhatsAppButton - Final phone number:', phoneNumber)
  console.log('WhatsAppButton - Final WhatsApp URL:', whatsappUrl)

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
