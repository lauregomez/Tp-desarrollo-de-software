import { MercadoPagoConfig, Order, MercadoPagoError } from 'mercadopago';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env';
import { SignatureCheck, WEBHOOK_TOLERANCE_MS } from './payment.types';


const client = new MercadoPagoConfig({
    accessToken: env.mpAccessToken,
});

const orderClient = new Order(client);

const FRONTEND_URL = env.frontendUrl;
const BACKEND_PUBLIC_URL = env.backendPublicUrl;

/**
 * Tipo de la orden tal como la devuelve MercadoPago.
 * Se deriva del cliente porque el SDK no re-exporta OrderResponse desde su
 * entrada pública: importarlo de mercadopago/dist/... ataría el código a la
 * estructura interna del paquete.
 */
type MpOrder = Awaited<ReturnType<typeof orderClient.get>>;

/**
 * Toma el primer valor cuando el header llega repetido y descarta los vacíos.
 */
function firstValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

/**
 * Parsea el header x-signature ("ts=...,v1=...").
 *
 * Los componentes se devuelven como string: el ts se usa tal cual para
 * rearmar el manifiesto, y recién se convierte a número para comparar
 * la antigüedad.
 */
function parseSignatureHeader(xSignature: string): { ts?: string; v1?: string } {
  const parsed: { ts?: string; v1?: string } = {};

  for (const part of xSignature.split(',')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;

    const key = part.slice(0, eq).trim();
    const value = part.slice(eq + 1).trim();
    if (key === 'ts') parsed.ts = value;
    else if (key === 'v1') parsed.v1 = value;
  }

  return parsed;
}

/**
 * Arma el manifiesto que firma MercadoPago.
 *
 * Si dataId o xRequestId no vienen se omite el segmento entero: dejarlo
 * vacío ("id:;") daría un hash distinto al que calculó MercadoPago.
 */
function buildManifest(
  dataId: string | undefined,
  xRequestId: string | undefined,
  ts: string,
): string {
  const parts: string[] = [];
  if (dataId) parts.push(`id:${dataId}`);
  if (xRequestId) parts.push(`request-id:${xRequestId}`);
  parts.push(`ts:${ts}`);
  return parts.join(';') + ';';
}

/**
 * Compara el HMAC del manifiesto contra el hash recibido.
 *
 * timingSafeEqual lanza excepción si los buffers tienen distinto largo, así
 * que el largo se chequea antes. No es una fuga: el largo de un hash hex de
 * SHA-256 es siempre el mismo y no depende del secret.
 */
function manifestMatches(manifest: string, receivedHash: string): boolean {
  const computed = createHmac('sha256', env.mpWebhookSecret)
    .update(manifest)
    .digest('hex');

  const computedBuffer = Buffer.from(computed, 'utf8');
  const receivedBuffer = Buffer.from(receivedHash, 'utf8');

  if (computedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(computedBuffer, receivedBuffer);
}

/**
 * MercadoPago envía el ts en milisegundos, pero algunas notificaciones
 * todavía llegan en segundos. Se distingue por magnitud en vez de por
 * cantidad de dígitos: cualquier fecha real expresada en segundos queda
 * por debajo de 1e12, y una expresada en milisegundos por encima.
 */
function toMilliseconds(ts: number): number {
  return ts < 1e12 ? ts * 1000 : ts;
}

export type CreateOrderInput = {
  ticketIds: number[];
  unitPrice: string;
  matchTitle: string;
  payerEmail: string;
};

export type CreateOrderResult = {
  orderId: string;
  checkoutUrl: string;
};

export const paymentService = {
  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const quantity = input.ticketIds.length;
    const totalAmount = (Number(input.unitPrice) * quantity).toFixed(2);

    const externalReference = input.ticketIds.join('-');

    const response = await orderClient.create({
      body: {
        type: 'online',
        processing_mode: 'manual',
        capture_mode: 'automatic_async',
        total_amount: totalAmount,
        external_reference: externalReference,
        currency: 'ARS',
        description: `Entradas para ${input.matchTitle}`,
        payer: {
          email: input.payerEmail,
        },
        items: [
          {
            title: `Entrada - ${input.matchTitle}`,
            quantity,
            unit_price: input.unitPrice,
          },
        ],
        config: {
          online: {
            success_url: `${FRONTEND_URL}/pago/confirmando`,
            failure_url: `${FRONTEND_URL}/pago/error`,
            pending_url: `${FRONTEND_URL}/pago/confirmando`,
            auto_return: 'approved',
          },
        },
      },
      requestOptions: {
        idempotencyKey: randomUUID(),
      },
    });

    if (!response.id || !response.checkout_url) {
      throw new Error('MercadoPago no devolvió checkout_url');
    }

    return {
      orderId: response.id,
      checkoutUrl: response.checkout_url,
    };
  },

  /**
   * Verifica que la notificación venga realmente de MercadoPago.
   *
   * La verificación es manual y no usa WebhookSignatureValidator del SDK
   * porque ese validador firma el data.id sólo en minúsculas y las
   * notificaciones reales llegan firmadas con el id tal cual.
   */
  verifyWebhookSignature(input: {
    xSignature: string | string[] | undefined;
    xRequestId: string | string[] | undefined;
    dataId: string | string[] | undefined;
  }): SignatureCheck {
    const xSignature = firstValue(input.xSignature);
    if (!xSignature) {
      return { valid: false, reason: 'MissingSignatureHeader' };
    }

    const { ts, v1 } = parseSignatureHeader(xSignature);

    if (!ts || !/^\d+$/.test(ts)) {
      return { valid: false, reason: 'MissingTimestamp' };
    }

    if (!v1) {
      return { valid: false, reason: 'MissingHash' };
    }

    const xRequestId = firstValue(input.xRequestId);
    const dataId = firstValue(input.dataId);

    // La documentación de MercadoPago indica firmar el data.id en minúsculas,
    // pero las notificaciones reales y el simulador del panel lo firman tal
    // cual llega. Se prueban las dos variantes: aceptar ambas no debilita la
    // verificación, porque cualquiera de las dos exige conocer el secret.
    const dataIdVariants =
      dataId && dataId !== dataId.toLowerCase()
        ? [dataId, dataId.toLowerCase()]
        : [dataId];

    const matches = dataIdVariants.some((variant) =>
      manifestMatches(buildManifest(variant, xRequestId, ts), v1),
    );

    if (!matches) {
      return { valid: false, reason: 'SignatureMismatch' };
    }

    // Se compara en valor absoluto: un ts en el futuro tampoco es legítimo.
    if (
      Math.abs(Date.now() - toMilliseconds(Number(ts))) > WEBHOOK_TOLERANCE_MS
    ) {
      return { valid: false, reason: 'TimestampOutOfTolerance' };
    }

    return { valid: true };
  },

  /**
   * Trae la orden desde MercadoPago.
   *
   * Devuelve null sólo si la orden no existe (404): ese caso no mejora
   * reintentando. Cualquier otro error se propaga para que el webhook
   * responda 500 y MercadoPago vuelva a notificar.
   */
  async getOrder(orderId: string): Promise<MpOrder | null> {
    try {
      return await orderClient.get({ id: orderId });
    } catch (error) {
      if (error instanceof MercadoPagoError && error.status === 404) {
        return null;
      }
      throw error;
    }
  },
};