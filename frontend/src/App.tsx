import { Routes, Route } from 'react-router-dom'
import MainLayout from './components/layout/MainLayout'
import AuthLayout from './components/layout/AuthLayout'
import MatchesPage from './pages/MatchesPage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<MatchesPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>
    </Routes>
  )
}