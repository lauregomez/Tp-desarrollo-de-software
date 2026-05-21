import { Club, CreateClubDto, UpdateClubDto } from './club.types';

let clubs: Club[] = [
  { id: 1, nombre: 'Club Regatas Rosario' },
  { id: 2, nombre: 'Club Nautico Sportivo Avellaneda' },
];
let nextId = 3;

export const clubService = {
  findAll(): Club[] {
    return clubs;
  },

  findById(id: number): Club | undefined {
    return clubs.find((c) => c.id === id);
  },

  create(dto: CreateClubDto): Club {
    const club: Club = { id: nextId++, ...dto };
    clubs.push(club);
    return club;
  },

  update(id: number, dto: UpdateClubDto): Club | null {
    const idx = clubs.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    clubs[idx] = { ...clubs[idx], ...dto };
    return clubs[idx];
  },

  remove(id: number): boolean {
    const before = clubs.length;
    clubs = clubs.filter((c) => c.id !== id);
    return clubs.length < before;
  },
};