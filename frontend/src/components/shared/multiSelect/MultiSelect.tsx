interface Option<T> {
  value: T
  label: string
}

interface MultiSelectProps<T extends string | number> {
  label: string
  options: Option<T>[]
  selected: T[]
  onChange: (selected: T[]) => void
}

// Genérico en T: sirve para ids (number) y para estados (string)
// sin duplicar el componente.
export default function MultiSelect<T extends string | number>({
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps<T>) {
  // Si ya estaba marcado lo saca, y si no, lo agrega. No toca los demás:
  // por eso las opciones se acumulan.
  const toggle = (value: T) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    )
  }

  return (
    // <details> abre y cierra la lista al tocar el <summary>
    // sin necesidad de un estado propio.
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm [&::-webkit-details-marker]:hidden">
        <span className="font-medium">{label}</span>
        {selected.length > 0 && (
          <span className="rounded-full bg-primary px-2 text-xs font-semibold text-white">
            {selected.length}
          </span>
        )}
        <span aria-hidden="true" className="text-muted">
          ▾
        </span>
      </summary>

      <div className="absolute z-10 mt-1 max-h-72 w-80 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-canvas"
          >
            {/* Checkbox nativo dibujado como círculo: vacío = no filtra,
                lleno = filtra por esta opción. */}
            <input
              type="checkbox"
              checked={selected.includes(option.value)}
              onChange={() => toggle(option.value)}
              className="h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-full border-2 border-slate-400 transition-colors checked:border-primary checked:bg-primary"
            />
            {option.label}
          </label>
        ))}

        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="mt-1 w-full rounded px-2 py-1 text-left text-xs text-muted hover:text-navy"
          >
            Limpiar selección
          </button>
        )}
      </div>
    </details>
  )
}