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