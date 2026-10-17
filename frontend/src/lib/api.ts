const BASE_URL = import.meta.env.VITE_API_URL

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export interface Callbacks<T> {
  onSuccess: (data: T) => void
  onError: (error: Error) => void
}

export function getToken(): string | null {
  return localStorage.getItem('token')
}

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
    throw new ApiError(0, 'No se pudo conectar con el servidor')
  }

  if (response.status === 204) {
    return undefined as T
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message =
      data && typeof data.message === 'string'
        ? data.message
        : 'Ocurrió un error inesperado'
    throw new ApiError(response.status, message)
  }

  return data as T
}