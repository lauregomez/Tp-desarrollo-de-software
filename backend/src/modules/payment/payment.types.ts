export type WebhookNotification = {
  type?: string;
  action?: string;
  data?: { id?: string };
};

export type SignatureCheck =
  | { valid: true }
  | { valid: false; reason: string };

export const WEBHOOK_TOLERANCE_MS = 5 * 60 * 1000;
