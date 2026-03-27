import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {
  selectIsSearchOpen,
  selectSearchQuery,
  closeSearch,
  setSearchQuery,
} from '../../store/slices/uiSlice'
import { searchProducts } from '../../store/slices/productsSlice'

const SearchOverlay = ({ isOpen }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  
  const isSearchOpen = useSelector(selectIsSearchOpen)
  const searchQuery = useSelector(selectSearchQuery)
  const [localQuery, setLocalQuery] = useState('')

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
      setLocalQuery(searchQuery)
    }
  }, [isOpen, searchQuery])

  const handleClose = () => {
    dispatch(closeSearch())
    setLocalQuery('')
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setLocalQuery(value)
    dispatch(setSearchQuery(value))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (localQuery.trim()) {
      dispatch(searchProducts(localQuery.trim()))
      navigate(`/products?search=${encodeURIComponent(localQuery.trim())}`)
      handleClose()
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClose()
    }
  }

  if (!isSearchOpen) return null

  return (
    <div className="fixed inset-0 z-50" onKeyDown={handleKeyDown}>
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={handleClose}
      />

      {/* Search Panel */}
      <div className="absolute top-0 left-0 right-0 bg-white shadow-lg">
        <div className="container-custom">
          <div className="flex items-center justify-between py-4">
            {/* Search Input */}
            <form onSubmit={handleSubmit} className="flex-1 flex items-center space-x-4">
              <div className="relative flex-1 max-w-2xl">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={localQuery}
                  onChange={handleInputChange}
                  placeholder="Search for products..."
                  className="w-full pl-12 pr-4 py-3 text-lg border-b-2 border-gray-300 focus:border-primary-500 focus:outline-none"
                />
              </div>
              
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!localQuery.trim()}
              >
                Search
              </button>
            </form>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors ml-4"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Search Suggestions */}
          {localQuery.trim() && (
            <div className="py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2">
                Popular searches for "{localQuery}"
              </div>
              <div className="flex flex-wrap gap-2">
                {['laptop', 'phone', 'shoes', 'watch'].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setLocalQuery(suggestion)
                      dispatch(setSearchQuery(suggestion))
                    }}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {!localQuery.trim() && (
            <div className="py-4 border-t border-gray-200">
              <div className="text-sm text-gray-500 mb-2">Recent searches</div>
              <div className="space-y-2">
                <div className="text-gray-700">No recent searches</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SearchOverlay
