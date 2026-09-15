// URL base de la API, definida en frontend/.env como VITE_API_URL.
// Vite sólo expone al cliente las variables con prefijo VITE_.
const BASE_URL = import.meta.env.VITE_API_URL

// Error propio que conserva el status HTTP.
// Permite que los componentes distingan casos: 401 => redirigir al login,
// 409 => mostrar el conflicto, etc.
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Firma de callbacks que usan los archivos .server.ts, siguiendo el patrón
// onSuccess/onError del apunte de la cátedra.
export interface Callbacks<T> {
  onSuccess: (data: T) => void
  onError: (error: Error) => void
}

// Se lee de localStorage en cada llamada (y no se cachea en una variable)
// para que login y logout se reflejen sin reinicializar nada.
export function getToken(): string | null {
  return localStorage.getItem('token')
}

// Wrapper único de fetch: arma la URL, adjunta el JWT y normaliza los errores.
// El genérico <T> es el tipo del cuerpo que devuelve el endpoint.
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()

  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let response: Response
  try {
    response = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  } catch {
    // fetch sólo rechaza si falla la red (backend apagado, sin conexión).
    // Usamos status 0 porque no hubo respuesta HTTP.
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  // 204 No Content: el DELETE del backend no devuelve cuerpo.
  // Llamar a .json() acá tiraría un error de parseo.
  if (response.status === 204) {
    return undefined as T
  }

  // Si el servidor devuelve algo que no es JSON (por ej. el HTML de error
  // de Express), el catch evita romper y deja que siga el chequeo de status.
  const data = await response.json().catch(() => null)

  // fetch NO lanza error ante 4xx/5xx: hay que chequear response.ok a mano.
  // El backend responde { message: '...' }; lo aprovechamos para el usuario.
  if (!response.ok) {
    const message =
      data && typeof data.message === 'string'
        ? data.message
        : 'Ocurrió un error inesperado'
    throw new ApiError(response.status, message)
  }

  return data as T
}