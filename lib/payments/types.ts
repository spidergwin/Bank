export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'expired';

export interface CreatePaymentParams {
  amount: number;
  orderId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  appUrl: string;
}

export interface CreatePaymentResult {
  success: boolean;
  url?: string;
  error?: string;
  providerReference?: string;
}

export interface WebhookResult {
  isValid: boolean;
  orderId?: string;
  amount?: number;
  status: PaymentStatus;
  providerReference?: string;
}

export interface PaymentProvider {
  id: string;
  name: string;
  createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult>;
  verifyWebhook(req: Request): Promise<WebhookResult>;
}
