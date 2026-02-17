import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './globals.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CartProvider } from './Customer/context/CartContext'
import { Toaster } from 'sonner'

const queryClient = new QueryClient()
document.documentElement.classList.add("dark");

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <CartProvider>
          <Toaster richColors position="top-right" closeButton />
          <App />
        </CartProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
