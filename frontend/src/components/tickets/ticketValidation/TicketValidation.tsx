import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'

import Button from '../../shared/button/Button'
import EmptyState from '../../shared/emptyState/EmptyState'
import { ApiError } from '../../../lib/api'
import { clubName, courtName, formatTime } from '../../../lib/format'
import { errorToast } from '../../../shared/notifications'
import type { PublicMatch } from '../../../types/match'
import type { OperatorTicket } from '../../../types/ticket'
import { getTodayMatches, validateTicket } from './TicketValidation.server'
import { CODE_LENGTH } from './TicketValidation.const'

// Último resultado mostrado. Queda fijo hasta el próximo código (no es un
// toast) porque el operador lo lee con la persona parada adelante.
type ValidationResult =
  | { ok: true; ticket: OperatorTicket }
  | { ok: false; message: string }

export default function TicketValidation() {
  const [matches, setMatches] = useState<PublicMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // String y no number: es el value del <select>. Se convierte con Number()
  // recién al enviar, porque el backend rechaza un matchId string con 400.
  const [matchId, setMatchId] = useState('')
  const [code, setCode] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let ignore = false

    getTodayMatches({
      onSuccess: (data) => {
        if (ignore) return
        setMatches(data)
        // Con un solo partido en la jornada no hay nada que elegir.
        if (data.length === 1) setMatchId(String(data[0].id))
        setIsLoading(false)
      },
      onError: (error) => {
        if (ignore) return
        errorToast(error.message)
        setIsLoading(false)
      },
    })

    return () => {
      ignore = true
    }
  }, [])

  // Da foco al input cada vez que queda habilitado: al elegir partido y al
  // terminar cada validación. No se hace en los callbacks porque ahí el
  // input sigue deshabilitado hasta el próximo render, y un input
  // deshabilitado ignora focus().
  useEffect(() => {
    if (matchId && !isSubmitting) {
      codeInputRef.current?.focus()
    }
  }, [matchId, isSubmitting])

  const handleMatchChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setMatchId(event.target.value)
    // Un resultado de otro partido no debe quedar en pantalla.
    setResult(null)
    setCode('')
  }

  const handleCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCode(event.target.value.toUpperCase().slice(0, CODE_LENGTH))
  }

  const finishValidation = (next: ValidationResult) => {
    setResult(next)
    setCode('')
    setIsSubmitting(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // El botón ya está deshabilitado en estos casos; esto cubre el Enter.
    if (!matchId || code.length !== CODE_LENGTH || isSubmitting) return

    setIsSubmitting(true)

    validateTicket(Number(matchId), code, {
      onSuccess: ({ ticket }) => finishValidation({ ok: true, ticket }),
      onError: (error) => {
        // Con el token vencido el backend responde 401: sin esto el
        // operador vería un error técnico y creería que la entrada es mala.
        const message =
          error instanceof ApiError && error.status === 401
            ? 'Tu sesión venció. Volvé a iniciar sesión para seguir validando.'
            : error.message
        finishValidation({ ok: false, message })
      },
    })
  }

  return (
    <section className="mx-auto max-w-xl">
      <h1 className="mb-4 text-2xl font-bold text-navy">Validar entradas</h1>

      {isLoading ? (
        <p className="text-muted">Cargando partidos…</p>
      ) : matches.length === 0 ? (
        <EmptyState
          title="No hay partidos para hoy"
          message="Acá aparecen sólo los partidos publicados que se juegan hoy."
        />
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="match" className="text-sm text-muted">
              Partido
            </label>
            <select
              id="match"
              value={matchId}
              onChange={handleMatchChange}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-3 py-2"
            >
              <option value="" disabled>
                Elegí el partido que estás atendiendo
              </option>
              {matches.map((match) => (
                <option key={match.id} value={match.id}>
                  {`${formatTime(match.startsAt)} · ${clubName(match.homeClub)} vs ${clubName(match.awayClub)} · ${courtName(match.court)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="code" className="text-sm text-muted">
              Código de la entrada
            </label>
            <div className="flex gap-2">
              <input
                ref={codeInputRef}
                id="code"
                value={code}
                onChange={handleCodeChange}
                maxLength={CODE_LENGTH}
                disabled={!matchId || isSubmitting}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="ABCD"
                className="w-32 rounded-lg border border-slate-300 px-3 py-2 text-center text-2xl font-bold tracking-widest"
              />
              <Button
                type="submit"
                variant="primary"
                disabled={!matchId || code.length !== CODE_LENGTH || isSubmitting}
              >
                {isSubmitting ? 'Validando…' : 'Validar'}
              </Button>
            </div>
          </div>
        </form>
      )}

      {result &&
        (result.ok ? (
          <div
            role="status"
            className="mt-6 rounded-lg border-2 border-success bg-success/10 p-4"
          >
            <p className="text-xl font-bold text-success">Entrada válida</p>
            <p className="mt-2 text-lg text-navy">
              {result.ticket.user.name} {result.ticket.user.lastName}
            </p>
            <p className="text-sm text-muted">
              {`Código ${result.ticket.code} · ${clubName(result.ticket.match.homeClub)} vs ${clubName(result.ticket.match.awayClub)}`}
            </p>
          </div>
        ) : (
          <div
            role="alert"
            className="mt-6 rounded-lg border-2 border-brand bg-brand/10 p-4"
          >
            <p className="text-xl font-bold text-brand">No se pudo validar</p>
            <p className="mt-2 text-navy">{result.message}</p>
          </div>
        ))}
    </section>
  )
}