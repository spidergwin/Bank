import { CreatePaymentParams, CreatePaymentResult, PaymentProvider, WebhookResult, PaymentStatus } from "../types";
import crypto from "crypto";

export class PaymentoProvider implements PaymentProvider {
  id = "paymento";
  name = "Paymento";

  private apiKey = process.env.PAYMENTO_API_KEY;
  private apiBase = process.env.PAYMENTO_API_BASE || "https://api.paymento.io";
  private ipnSecret = process.env.PAYMENTO_IPN_SECRET;

  private async call<T>(path: string, init: RequestInit): Promise<T> {
    const response = await fetch(`${this.apiBase}${path}`, {
      ...init,
      headers: {
        "Api-Key": this.apiKey!,
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Paymento API error (${path}): ${response.status} ${errorText}`);
      throw new Error(`PAYMENTO_HTTP_${response.status}`);
    }

    const json = await response.json() as { success: boolean, message?: string, body: T };
    // console.log(`Paymento API response (${path}):`, JSON.stringify(json, null, 2));
    
    if (!json.success) {
      throw new Error(`PAYMENTO_API_ERROR: ${json.message || "Unknown error"}`);
    }

    return json.body;
  }

  async createPayment(params: CreatePaymentParams): Promise<CreatePaymentResult> {
    if (!this.apiKey) {
      console.error("Paymento API Key missing");
      return { success: false, error: "Paymento configuration missing" };
    }

    try {
      // Paymento requires HTTPS for returnUrl
      const returnUrl = params.appUrl.replace("http://", "https://");

      const token = await this.call<string>("/v1/payment/request", {
        method: "POST",
        body: JSON.stringify({
          fiatAmount: params.amount.toString(),
          fiatCurrency: "USD",
          returnUrl: `${returnUrl}/dashboard?status=success`,
          orderId: params.orderId,
          riskSpeed: 0, // High speed - redirect on mempool
          emailAddress: params.user.email,
        }),
      });

      return {
        success: true,
        url: `https://app.paymento.io/gateway?token=${token}`,
        providerReference: token,
      };
    } catch (error) {
      console.error("Paymento Create Payment Error:", error);
      return { success: false, error: "Failed to initiate Paymento payment" };
    }
  }

  async verifyWebhook(req: Request): Promise<WebhookResult> {
    try {
      const signature = req.headers.get("x-hmac-sha256-signature");
      const rawBody = await req.text();
      
      if (!signature) {
        console.error("Paymento signature missing");
        return { isValid: false, status: 'failed' };
      }

      if (!this.ipnSecret) {
        console.error("PAYMENTO_IPN_SECRET not configured");
        return { isValid: false, status: 'failed' };
      }

      // Verify HMAC-SHA256 signature (uppercase hex)
      const expectedSig = crypto
        .createHmac("sha256", this.ipnSecret)
        .update(rawBody)
        .digest("hex")
        .toUpperCase();

      if (signature.toUpperCase() !== expectedSig) {
        console.error("Invalid Paymento signature", { received: signature, expected: expectedSig });
        return { isValid: false, status: 'failed' };
      }

      const body = JSON.parse(rawBody);
      const token = body.Token;

      // The guide says: "Never assume payment complete from the browser redirect; always Verify API."
      // So we call the Verify API here.
      const verification = await this.call<{
        token: string;
        orderId: string;
        orderStatus: number;
      }>("/v1/payment/verify", {
        method: "POST",
        body: JSON.stringify({ token }),
      });

      // Map Paymento statuses to our types
      let status: PaymentStatus = 'pending';
      const orderStatus = verification.orderStatus;

      if (orderStatus === 7 || orderStatus === 8) {
        status = 'completed';
      } else if (orderStatus === 4) {
        status = 'expired';
      } else if (orderStatus === 5 || orderStatus === 9) {
        status = 'failed';
      }

      return {
        isValid: true,
        orderId: verification.orderId,
        status: status,
        providerReference: token,
        // We don't necessarily get the amount back from verification in the same way, 
        // but we can trust our record or use what's in the IPN body if needed.
        amount: body.FiatAmount ? Number(body.FiatAmount) : undefined
      };
    } catch (error) {
      console.error("Paymento Webhook verification error:", error);
      return { isValid: false, status: 'failed' };
    }
  }
}
