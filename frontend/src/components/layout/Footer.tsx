export default function Footer() {
  return (
    <footer className="bg-navy">
      <div className="mx-auto flex max-w-app flex-col gap-3 px-4 py-6 text-sm md:flex-row md:items-center md:justify-between md:px-6">
        <div>
          <p className="font-bold text-white">Rosarina Futsal</p>
          <p className="text-white/60">
            © {new Date().getFullYear()} Rosarina Futsal (ARF). Todos los derechos reservados.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 text-white/70">
          <a href="#" className="hover:text-white">Privacidad</a>
          <a href="#" className="hover:text-white">Términos</a>
          <a href="#" className="hover:text-white">Contacto</a>
        </nav>
      </div>
    </footer>
  )
}