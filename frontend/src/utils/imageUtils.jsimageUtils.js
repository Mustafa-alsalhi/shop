// Utility function to get correct image URL for different environments
export const getImageUrl = (imagePath, productName = null) => {
  if (!imagePath) {
    // Use product name for placeholder if available
    const seed = productName?.replace(/\s+/g, '') || 'product'
    return `https://picsum.photos/seed/${seed}/300x300.jpg`
  }
  
  // Get the base URL from environment
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
  const apiBaseUrl = baseUrl.replace('/api', '')
  
  // If it's a relative path starting with /images/, convert to full URL
  if (imagePath.startsWith('/images/')) {
    return `${apiBaseUrl}${imagePath}`
  }
  
  // If it's already a full URL, use it as is
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // If it's a placeholder URL, use fallback
  if (imagePath.includes('via.placeholder.com')) {
    const seed = productName?.replace(/\s+/g, '') || 'product'
    return `https://picsum.photos/seed/${seed}/300x300.jpg`
  }
  
  // Otherwise, treat as relative path
  return `${apiBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}

export const getImageUrlWithSize = (imagePath, productName = null, size = 300) => {
  if (!imagePath) {
    const seed = productName?.replace(/\s+/g, '') || 'product'
    return `https://picsum.photos/seed/${seed}/${size}x${size}.jpg`
  }
  
  const baseUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
  const apiBaseUrl = baseUrl.replace('/api', '')
  
  if (imagePath.startsWith('/images/')) {
    return `${apiBaseUrl}${imagePath}`
  }
  
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  if (imagePath.includes('via.placeholder.com')) {
    const seed = productName?.replace(/\s+/g, '') || 'product'
    return `https://picsum.photos/seed/${seed}/${size}x${size}.jpg`
  }
  
  return `${apiBaseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`
}
