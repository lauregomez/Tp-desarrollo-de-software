/**
 * Cuerpo de una notificación de MercadoPago.
 *
 * Todos los campos son opcionales porque el body llega de un origen externo:
 * se usa sólo para saber qué tipo de evento es. Los datos reales de la orden
 * se piden después contra la API de MercadoPago.
 */
export type WebhookNotification = {
  type?: string;
  action?: string;
  data?: { id?: string };
};

/**
 * Resultado de verificar la firma de una notificación.
 *
 * Se devuelve un resultado en vez de propagar la excepción del SDK porque
 * una firma inválida no es un error del servidor: es un 401 previsto. Si se
 * dejara escapar, asyncHandler la llevaría al errorHandler y daría 500.
 *
 * `reason` es para el log: nunca se devuelve al cliente.
 */
export type SignatureCheck =
  | { valid: true }
  | { valid: false; reason: string };

/** Antigüedad máxima aceptada para el ts de la firma: 5 minutos. */
export const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;
