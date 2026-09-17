// Representa una cancha tal como la devuelve la API (GET /api/courts).
// El id lo genera la base, por eso está presente sólo en lectura.
export interface Court {
  id: number
  name: string
  address: string
  capacity: number
  clubId: number // Se refiere al club al que pertenece la cancha.
}

// Datos que se envían al crear (POST /api/courts).
// Sin id: todavía no existe el registro.
export type CreateCourtDto = {
  name: string
  address: string
  capacity: number
  clubId: number
}

// Datos que se envían al editar (PUT /api/courts/:id).
// El backend acepta los tres campos como opcionales, por eso Partial.
export type UpdateCourtDto = Partial<CreateCourtDto>