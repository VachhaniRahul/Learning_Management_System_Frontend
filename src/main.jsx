import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { CartProvider } from './views/plugin/CartProvider.jsx'
import { ProfileProvider } from './views/plugin/ProfileProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <ProfileProvider>
        <App />
      </ProfileProvider>
    </CartProvider>
  </StrictMode>,
)
