import { CreatePaymentParams, CreatePaymentResult, PaymentProvider, WebhookResult, PaymentStatus } from "../types";
import crypto from "crypto";

export class NexaPayProvider implements PaymentProvider {
  id = "nexapay";
  name = "NexaPay";

  private apiKey = process.env.NEXAPAY_API_KEY;
  private apiUrl = process.env.NEXAPAY_API_URL || "https://nexapay.one/api/v1";
  private webhookSecret = process.env.NEXAPAY_WEBHOOK_SECRET;

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    if (!this.apiKey) {
      console.error("NexaPay API Key missing");
      return { success: false, error: "NexaPay configuration missing" };
    }

    const payload = {
      amount: Number(params.amount),
      currency: "USD",
      crypto: "USDC",
      description: `Deposit for ${params.user.name} (Order ${params.orderId})`,
      customer_email: params.user.email,
      success_url: `${params.appUrl}/dashboard?status=success`,
      cancel_url: `${params.appUrl}/deposit?status=cancelled`,
      callback_url: `${params.appUrl}/api/webhooks/nexapay`,
    };

    try {
      const response = await fetch(`${this.apiUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success && result.payment) {
        return {
          success: true,
          url: result.payment.checkout_url,
          providerReference: result.payment.order_id
        };
      } else {
        console.error("NexaPay API Error:", result);
        return { success: false, error: result.message || "Failed to initiate NexaPay payment" };
      }
    } catch (error) {
      console.error("NexaPay Network Error:", error);
      return { success: false, error: "Failed to connect to NexaPay" };
    }
  }

  async verifyWebhook(req: Request): Promise<WebhookResult> {
    try {
      const signature = req.headers.get("x-nexapay-signature");
      const timestamp = req.headers.get("x-nexapay-timestamp");
      const rawBody = await req.text();
      const payload = JSON.parse(rawBody);

      if (!signature || !timestamp) {
        return { isValid: false, status: 'failed' };
      }

      if (!this.webhookSecret) {
        console.error("NEXAPAY_WEBHOOK_SECRET not configured");
        return { isValid: false, status: 'failed' };
      }

      const expectedSig = 'sha256=' + crypto
        .createHmac('sha256', this.webhookSecret)
        .update(timestamp + '.' + rawBody)
        .digest('hex');

      if (signature !== expectedSig) {
        console.error("Invalid NexaPay signature");
        return { isValid: false, status: 'failed' };
      }

      const maxAge = 5 * 60 * 1000;
      if (Math.abs(Date.now() - parseInt(timestamp)) > maxAge) {
        console.error("NexaPay webhook expired");
        return { isValid: false, status: 'failed' };
      }

      return {
        isValid: true,
        orderId: payload.order_id,
        amount: Number(payload.amount),
        status: payload.status as PaymentStatus, // NexaPay statuses match our types mostly
        providerReference: payload.order_id
      };
    } catch (error) {
      console.error("NexaPay Webhook verification error:", error);
      return { isValid: false, status: 'failed' };
    }
  }
}
