const TZ = 'America/Argentina/Buenos_Aires'

export function formatPrice(value: string | number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(Number(value))
}

export function formatShortDate(iso: string): string {
  const text = new Intl.DateTimeFormat('es-AR', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    timeZone: TZ,
  }).format(new Date(iso))
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatTime(iso: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: TZ,
  }).format(new Date(iso))
}

// Un partido finalizado o suspendido puede quedar sin club o sin cancha si
// después se borraron (la foránea queda en null). Estas funciones dan el
// texto a mostrar en ese caso, en un solo lugar para todas las pantallas.
export function clubName(club: { name: string } | null): string {
  return club?.name ?? 'Club eliminado'
}

export function courtName(court: { name: string } | null): string {
  return court?.name ?? 'Cancha eliminada'
}