// Palabras genéricas de los nombres oficiales: casi todos los clubes
// empiezan con "Club Atlético" o "Club Social y Deportivo", así que si
// entran en las iniciales todos terminan con las mismas letras.
// En minúscula: la comparación se hace sobre el nombre en minúscula.
export const GENERIC_CLUB_WORDS = new Set([
  'club',
  'atlético',
  'social',
  'deportivo',
  'cultural',
  'fútbol',
  'y',
  'de',
  'del',
])
// Más de 3 letras no entran en el círculo del badge.
export const MAX_INITIALS = 3