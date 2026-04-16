import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { HelmetProvider } from 'react-helmet-async'
import { Toaster } from 'react-hot-toast'

import App from './App.jsx'
import { store } from './store/store.js'
import { getCurrentUser } from './store/slices/authSlice'
import './styles/globals.css'
import WhatsAppButton from './components/UI/WhatsAppButton.jsx'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from './config/whatsapp.js'

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Check for existing token and validate user on app load
const initializeAuth = async () => {
  const token = localStorage.getItem('token')
  if (token) {
    try {
      // Dispatch getCurrentUser to validate token and set user data
      await store.dispatch(getCurrentUser())
    } catch (error) {
      console.error('Failed to initialize auth:', error)
      // If token is invalid, clear it
      localStorage.removeItem('token')
      store.dispatch({ type: 'auth/clearAuth' })
    }
  }
}

// Initialize auth before rendering app
initializeAuth()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#22c55e',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </BrowserRouter>
          <WhatsAppButton 
            phoneNumber={WHATSAPP_NUMBER} 
            message={WHATSAPP_MESSAGES.default}
          />
        </QueryClientProvider>
      </Provider>
    </HelmetProvider>
  </React.StrictMode>,
)
