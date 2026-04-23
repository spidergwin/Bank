import { handleWebhook } from "@/lib/payments/webhook-handler";

export async function POST(req: Request) {
  return handleWebhook("paymento", req);
}
