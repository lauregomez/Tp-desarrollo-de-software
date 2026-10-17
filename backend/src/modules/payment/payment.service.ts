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

type MpOrder = Awaited<ReturnType<typeof orderClient.get>>;

function firstValue(value: string | string[] | undefined): string | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  const trimmed = raw?.trim();
  return trimmed ? trimmed : undefined;
}

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
function manifestMatches(manifest: string, receivedHash: string): boolean {
  const computed = createHmac('sha256', env.mpWebhookSecret)
    .update(manifest)
    .digest('hex');

  const computedBuffer = Buffer.from(computed, 'utf8');
  const receivedBuffer = Buffer.from(receivedHash, 'utf8');

  if (computedBuffer.length !== receivedBuffer.length) return false;

  return timingSafeEqual(computedBuffer, receivedBuffer);
}

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

    if (
      Math.abs(Date.now() - toMilliseconds(Number(ts))) > WEBHOOK_TOLERANCE_MS
    ) {
      return { valid: false, reason: 'TimestampOutOfTolerance' };
    }

    return { valid: true };
  },

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