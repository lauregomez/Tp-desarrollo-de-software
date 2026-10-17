import { apiFetch } from '../../../lib/api'
import type { Callbacks } from '../../../lib/api'
import type { MatchLog } from '../../../types/matchLog'

export const getMatchLogs = ({ onSuccess, onError }: Callbacks<MatchLog[]>) => {
  apiFetch<MatchLog[]>('/match-logs')
    .then(onSuccess)
    .catch(onError)
}