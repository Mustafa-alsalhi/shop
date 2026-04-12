import React from 'react'

const LoadingSpinner = ({ size = 'medium' }) => {
  const sizeClasses = {
    small: 'h-4 w-4',
    medium: 'h-8 w-8',
    large: 'h-12 w-12',
  }

  return (
    <div className="flex justify-center items-center">
      <div
        className={`
          ${sizeClasses[size]}
          animate-spin rounded-full border-2 border-amber-200 border-t-amber-600
        `}
      ></div>
    </div>
  )
}

export default LoadingSpinner
