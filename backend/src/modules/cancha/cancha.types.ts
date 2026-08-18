export interface Cancha {
  id: number;
  nombre: string;
  capacidad: number;
  clubId: number;
}

export interface CreateCanchaDto {
  nombre: string;
  capacidad: number;
  clubId: number;
}

export interface UpdateCanchaDto {
  nombre?: string;
  capacidad?: number;
  clubId?: number;
}