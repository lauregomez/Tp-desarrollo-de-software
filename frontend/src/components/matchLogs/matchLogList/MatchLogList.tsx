import { useEffect, useState } from 'react'
import EmptyState from '../../shared/emptyState/EmptyState'
import { errorToast } from '../../../shared/notifications'
import { formatShortDate, formatTime } from '../../../lib/format'
import { getMatchLogs } from './MatchLogList.server'
import type { MatchLog } from '../../../types/matchLog'

export default function MatchLogList() {
  const [logs, setLogs] = useState<MatchLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getMatchLogs({
      onSuccess: (data) => {
        setLogs(data)
        setIsLoading(false)
      },
      onError: (error) => {
        errorToast(error.message)
        setIsLoading(false)
      },
    })
  }, [])

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-navy md:text-3xl">Historial de partidos</h1>

      {isLoading ? (
        <p className="text-muted">Cargando historial…</p>
      ) : logs.length === 0 ? (
        <EmptyState
          title="Todavía no hay registros"
          message="Cuando se finalice o suspenda un partido, va a aparecer acá."
        />
      ) : (
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {logs.map((log) => (
            <li key={log.id} className="flex flex-col gap-1 px-4 py-3">
              <span className="font-medium text-navy">{log.description}</span>
              <span className="text-sm text-muted">
                {formatShortDate(log.createdAt)} · {formatTime(log.createdAt)} hs
                {/* El usuario puede haberse borrado: el registro queda igual. */}
                {log.createdBy && ` · por ${log.createdBy.name} ${log.createdBy.lastName}`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}