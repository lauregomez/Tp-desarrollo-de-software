import { MercadoPagoConfig, Order } from 'mercadopago';
import { randomUUID } from 'node:crypto';
import { env } from '../../config/env';


const client = new MercadoPagoConfig({
    accessToken: env.mpAccessToken,
});

const orderClient = new Order(client);

const FRONTEND_URL = env.frontendUrl;
const BACKEND_PUBLIC_URL = env.backendPublicUrl;

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
            callback_url: `${BACKEND_PUBLIC_URL}/api/payments/webhook`,
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
};