// Horarios posibles de un partido, de 08:00 a 23:30 cada media hora.
// Reemplazan a los minutos libres del datetime-local: los partidos se
// programan en horarios redondos, y una lista es más cómoda que la
// ruedita nativa del navegador.
const FIRST_HOUR = 8
const LAST_HOUR = 23
const STEP_MINUTES = 30

function buildTimeOptions(): string[] {
  const options: string[] = []

  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += STEP_MINUTES) {
      // padStart deja '8' como '08': es el formato que espera el input
      // de tipo date y el que se arma para el backend.
      const hh = String(hour).padStart(2, '0')
      const mm = String(minute).padStart(2, '0')
      options.push(`${hh}:${mm}`)
    }
  }

  return options
}

export const TIME_OPTIONS = buildTimeOptions()