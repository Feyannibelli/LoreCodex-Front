import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext.tsx'
import Auth0ProviderWithNavigate from './auth/Auth0ProviderWithNavigate.tsx'
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <BrowserRouter>
            <Auth0ProviderWithNavigate>
                <AuthProvider>
                    <App />
                </AuthProvider>
            </Auth0ProviderWithNavigate>
        </BrowserRouter>
    </React.StrictMode>
)
