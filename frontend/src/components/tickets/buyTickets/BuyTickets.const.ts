// Clave del sessionStorage donde se guardan los ids de la compra en curso.
// La escribe BuyTickets antes de redirigir a MercadoPago y la lee
// PaymentConfirming al volver. sessionStorage sobrevive a la redirección
// (es la misma pestaña) y se borra solo al cerrarla.
export const PENDING_PURCHASE_KEY = 'pendingPurchase'

// Espejo de MAX_TICKETS_PER_USER_PER_MATCH del backend. Limita el
// selector para no ofrecer cantidades que el backend va a rechazar.
// El backend valida igual: esto es sólo para la experiencia de uso.
export const MAX_TICKETS_PER_MATCH = 5