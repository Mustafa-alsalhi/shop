import React from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import WhatsAppIcon from '../UI/WhatsAppIcon'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from '../../config/whatsapp'
import { closeMobileMenu } from '../../store/slices/uiSlice'
import { selectWhatsAppUrl } from '../../store/slices/settingsSlice'

const WhatsAppHeaderButton = ({ isMobile = false, message = WHATSAPP_MESSAGES.default }) => {
  const dispatch = useDispatch()
  const whatsappUrlFromSettings = useSelector(selectWhatsAppUrl)
  
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

  const handleClick = () => {
    if (isMobile) {
      dispatch(closeMobileMenu())
    }
  }

  if (isMobile) {
    return (
      <a
        href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="flex flex-col items-center p-3 text-gray-600 hover:bg-gradient-to-r hover:from-green-50 hover:to-green-500 hover:text-white transition-all duration-200 rounded-lg"
        aria-label="تواصل معنا عبر واتساب"
      >
        <WhatsAppIcon className="h-5 w-5 mb-1" />
        <span className="text-xs">واتساب</span>
      </a>
    )
  }

  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="p-2 text-white/80 hover:text-green-200 hover:bg-white/20 rounded-lg transition-all duration-300 hover:scale-110"
      aria-label="تواصل معنا عبر واتساب"
    >
      <WhatsAppIcon className="h-5 w-5" />
    </a>
  )
}

export default WhatsAppHeaderButton
