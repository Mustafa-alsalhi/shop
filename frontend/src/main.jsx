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
import './styles/globals.css'
import WhatsAppButton from './components/UI/WhatsAppButton.jsx'
import { WHATSAPP_NUMBER, WHATSAPP_MESSAGES } from './config/whatsapp.js'

// Security: Disable console in production to prevent data leakage
if (process.env.NODE_ENV === 'production') {
  const noop = () => {}
  const consoleMethods = ['log', 'info', 'warn', 'error', 'debug', 'trace']
  
  consoleMethods.forEach(method => {
    console[method] = noop
  })
  
  // Also disable console.table, console.group, etc.
  console.table = noop
  console.group = noop
  console.groupEnd = noop
  console.groupCollapsed = noop
  console.time = noop
  console.timeEnd = noop
  console.timeLog = noop
  console.count = noop
  console.countReset = noop
  console.assert = noop
  console.clear = noop
  console.dir = noop
  console.dirxml = noop
  console.profile = noop
  console.profileEnd = noop
  console.timeStamp = noop
}

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
