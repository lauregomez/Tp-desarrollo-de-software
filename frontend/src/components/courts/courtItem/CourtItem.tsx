import type { Court } from '../../../types/court'

interface CourtItemProps {
  court: Court
  clubName: string
}

export default function CourtItem({ court, clubName }: CourtItemProps) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-navy">{court.name}</h2>
        <p className="text-muted">Club: {clubName}</p>
        <p className="text-muted">Capacidad: {court.capacity}</p>
    </article>
  )
}