import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* BrowserRouter va afuera: AuthProvider no lo necesita ahora,
        pero ProtectedRoute (que sí usa el contexto) va a llamar a
        Navigate y useLocation, y eso requiere estar dentro del router. */}
    <BrowserRouter>
      {/* AuthProvider envuelve toda la app para que cualquier componente
          pueda leer la sesión con useAuth() sin pasar props. */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)