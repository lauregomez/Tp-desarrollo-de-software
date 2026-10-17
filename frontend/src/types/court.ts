export interface Court {
  id: number
  name: string
  address: string
  capacity: number
  clubId: number
}

export type CreateCourtDto = {
  name: string
  address: string
  capacity: number
  clubId: number
}

export type UpdateCourtDto = Partial<CreateCourtDto>