import { PaymentoProvider } from "./providers/paymento";
import { NexaPayProvider } from "./providers/nexapay";
import { PaymentProvider } from "./types";

export const providers: Record<string, PaymentProvider> = {
  nexapay: new NexaPayProvider(),
  paymento: new PaymentoProvider(),
};

export interface ProviderMetadata {
  id: string;
  name: string;
  description: string;
  type: "card" | "crypto";
}

export const providerMetadata: ProviderMetadata[] = [
  {
    id: "nexapay",
    name: "NexaPay",
    description: "Credit / Debit Card",
    type: "card",
  },
  {
    id: "paymento",
    name: "Paymento",
    description: "Crypto Assets",
    type: "crypto",
  },
];

export function getProvider(id: string): PaymentProvider | undefined {
  return providers[id];
}

export * from "./types";
