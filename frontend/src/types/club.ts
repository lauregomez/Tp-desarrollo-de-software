export interface Club {
  id: number
  name: string
  logoUrl: string | null
  description: string | null
  foundedYear: number | null
}

export type CreateClubDto = {
  name: string
  logoUrl?: string | null
  description?: string | null
  foundedYear?: number | null
}

export type UpdateClubDto = Partial<CreateClubDto>
