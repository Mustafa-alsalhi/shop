/**
 * Helper to ensure image URLs from backend (storage, relative paths, filenames)
 * correctly resolve to full accessible URLs with fallback support.
 */
const BACKEND_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api').replace(/\/api\/?$/, '')

export const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300'
export const DEFAULT_RESTAURANT_AVATAR = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300'
export const DEFAULT_RESTAURANT_COVER = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200'
export const DEFAULT_MEAL_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'

export function getImageUrl(path, fallback = DEFAULT_MEAL_IMAGE) {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    return fallback
  }

  const cleanPath = path.trim()

  // Full absolute URL
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath
  }

  // Relative path with leading slash
  if (cleanPath.startsWith('/')) {
    return `${BACKEND_BASE}${cleanPath}`
  }

  // Storage path
  if (cleanPath.startsWith('storage/') || cleanPath.startsWith('images/')) {
    return `${BACKEND_BASE}/${cleanPath}`
  }

  // Bare filename assumed to be in storage/images/categories/
  return `${BACKEND_BASE}/storage/images/categories/${cleanPath}`
}

export function handleImageError(e, fallback = DEFAULT_MEAL_IMAGE) {
  if (e?.target && e.target.src !== fallback) {
    e.target.onerror = null
    e.target.src = fallback
  }
}
