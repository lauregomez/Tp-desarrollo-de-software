export interface CreateUserDto {
  name: string;
  lastName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserDto {
  name?: string;
  lastName?: string;
  email?: string;
  roleId?: number;
}