// Representa un club tal como lo devuelve la API (GET /api/clubs).
// El id lo genera la base, por eso está presente sólo en lectura.
export interface Club {
  id: number
  name: string
}

// Datos que se envían al crear (POST /api/clubs).
// Sin id: todavía no existe el registro.
export type CreateClubDto = {
  name: string
}

// Datos que se envían al editar (PUT /api/clubs/:id).
// El backend acepta name opcional, por eso Partial.
export type UpdateClubDto = Partial<CreateClubDto>