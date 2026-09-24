// Un registro del historial (GET /api/match-logs). El texto viene armado del
// backend. createdBy puede ser null si el usuario que lo registró se borró.
export interface MatchLog {
  id: number
  description: string
  createdAt: string
  createdBy: { name: string; lastName: string } | null
}