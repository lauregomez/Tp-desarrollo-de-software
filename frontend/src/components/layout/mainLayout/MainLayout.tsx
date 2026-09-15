import { Outlet } from 'react-router'
import Header from '../header/Header'
import Footer from '../footer/Footer'

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <Header />
      <main className="mx-auto w-full max-w-app flex-1 px-4 py-6 md:px-6 md:py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}