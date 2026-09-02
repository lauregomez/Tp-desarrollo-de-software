import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas">
      <header className="bg-navy py-4">
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-full bg-brand" />
          <span className="text-lg font-bold text-white">Rosarina Futsal</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8">
        <Outlet />
      </main>

      <footer className="py-4 text-center text-sm text-muted">
        © {new Date().getFullYear()} Rosarina Futsal
      </footer>
    </div>
  )
}