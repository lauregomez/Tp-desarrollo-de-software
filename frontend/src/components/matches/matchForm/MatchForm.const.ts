const FIRST_HOUR = 8
const LAST_HOUR = 23
const STEP_MINUTES = 30

function buildTimeOptions(): string[] {
  const options: string[] = []

  for (let hour = FIRST_HOUR; hour <= LAST_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += STEP_MINUTES) {
      const hh = String(hour).padStart(2, '0')
      const mm = String(minute).padStart(2, '0')
      options.push(`${hh}:${mm}`)
    }
  }

  return options
}

export const TIME_OPTIONS = buildTimeOptions()