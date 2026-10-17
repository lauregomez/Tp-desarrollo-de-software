export interface MatchLog {
  id: number
  description: string
  createdAt: string
  createdBy: { name: string; lastName: string } | null
}