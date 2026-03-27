import React from 'react'
import { Link } from 'react-router-dom'
import { HomeIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const ServerError = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm rounded-lg sm:rounded-lg sm:px-10">
          <div className="text-center">
            {/* Error Icon */}
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">
              Server error
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Something went wrong on our end. Please try again later.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full btn btn-primary inline-flex items-center justify-center"
            >
              <ArrowPathIcon className="h-5 w-5 mr-2" />
              Try again
            </button>
            
            <Link
              to="/"
              className="w-full btn btn-outline inline-flex items-center justify-center"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              Go to homepage
            </Link>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              If the problem persists, please contact our support team
            </p>
            <Link
              to="/contact"
              className="mt-2 text-sm text-primary-600 hover:text-primary-500"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServerError
