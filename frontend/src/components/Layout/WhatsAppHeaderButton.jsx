import React from 'react'
import WhatsAppIcon from '../UI/WhatsAppIcon'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from '../../config/whatsapp'
import { useDispatch } from 'react-redux'
import { closeMobileMenu } from '../../store/slices/uiSlice'

const WhatsAppHeaderButton = ({ isMobile = false, message = WHATSAPP_MESSAGES.default }) => {
  const dispatch = useDispatch()

  const handleClick = () => {
    if (isMobile) {
      dispatch(closeMobileMenu())
    }
  }

  if (isMobile) {
    return (
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
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
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`}
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
