import { useNavigate } from 'react-router'
import Button from '../shared/button/Button'

export default function PageNotFound() {
  const navigate = useNavigate()

  return (
    <section className="flex flex-col items-center gap-4 py-12 text-center">
      <h2 className="text-2xl font-bold">
        ¡Oops! La página solicitada no fue encontrada
      </h2>
      <Button onClick={() => navigate('/')}>Volver al inicio</Button>
    </section>
  )
}
