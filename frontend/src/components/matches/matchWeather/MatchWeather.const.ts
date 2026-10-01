import {
  SunIcon,
  CloudIcon,
  RainIcon,
  StormIcon,
  SnowIcon,
} from '../../shared/icons/icons'

/**
 * Traduce un código WMO de Open-Meteo a uno de cinco iconos.
 *
 * Los códigos se agrupan por familia, no uno por uno como las
 * descripciones del backend: acá no hace falta tanto detalle, porque
 * el texto exacto ya se muestra al lado del icono.
 *
 * Referencia de los rangos:
 *   0-1   despejado
 *   2-3   nublado
 *   45-48 niebla       -> se agrupa con nublado
 *   51-67 llovizna y lluvia
 *   71-77 nieve
 *   80-82 chaparrones  -> lluvia
 *   85-86 chaparrones de nieve
 *   95-99 tormenta
 */
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