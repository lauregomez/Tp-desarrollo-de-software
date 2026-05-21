export interface Club {
  id: number;
  nombre: string;
}

export interface CreateClubDto {
  nombre: string;
}

export interface UpdateClubDto {
  nombre?: string;
}