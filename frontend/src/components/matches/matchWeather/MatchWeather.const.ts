import {
  SunIcon,
  CloudIcon,
  RainIcon,
  StormIcon,
  SnowIcon,
} from '../../shared/icons/icons'

export function weatherIconFor(code: number) {
  if (code <= 1) return SunIcon
  if (code <= 3) return CloudIcon
  if (code <= 48) return CloudIcon
  if (code <= 67) return RainIcon
  if (code <= 77) return SnowIcon
  if (code <= 82) return RainIcon
  if (code <= 86) return SnowIcon
  return StormIcon
}