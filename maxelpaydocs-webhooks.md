# Webhooks

Webhooks allow MaxelPay to notify your server automatically when payment-related events occur.  
This is the recommended and most reliable method for handling payment confirmations and status updates.

---

## Setting Up Webhooks

### Create an Endpoint

Set up a secure HTTPS endpoint on your server to receive webhook event notifications from MaxelPay.

---

### Configure Webhook URL

Provide your webhook URL when generating an API key or include it while creating a payment session.  
This ensures your server receives real-time payment updates.

---

## Webhook Payload

When a payment event occurs, MaxelPay sends a JSON payload to your configured webhook endpoint.

```json
{
  "event": "payment.completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "sessionId": "sess_abc123xyz",
    "orderId": "ORDER-12345",
    "status": "paid",
    "amount": 99.99,
    "currency": "USD",
    "paidAmount": 99.99,
    "totalPaidUsd": 99.99,
    "txHash": "0x123...abc",
    "network": "Ethereum Sepolia",
    "tokenSymbol": "USDT",
    "customerEmail": "customer@example.com",
    "metadata": {
      "userId": "user_123"
    }
  }
}
```

## Verify Signatures

Always verify webhook signatures to confirm that incoming requests are genuinely sent by MaxelPay.  
Signature verification protects your system from unauthorized or malicious requests.

Each webhook request includes a signature in the `X-MaxelPay-Signature` header.

```javascript
const crypto = require("crypto")

function verifyWebhookSignature(payload, signature, secretKey) {
  const expectedSignature = crypto
    .createHmac("sha256", secretKey)
    .update(JSON.stringify(payload))
    .digest("hex")

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

// Express.js example
app.post("/webhooks/maxelpay", async (req, res) => {
  const signature = req.headers["x-maxelpay-signature"]

  const isValid = verifyWebhookSignature(
    req.body,
    signature,
    process.env.MAXELPAY_SECRET_KEY
  )

  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" })
  }

  const { event, data } = req.body

  switch (event) {
    case "payment.completed":
      await fulfillOrder(data.orderId)
      break

    case "payment.failed":
      break
  }

  res.json({ received: true })
})
```

## Webhook Events

### `payment.completed`

Payment has been fully confirmed on the blockchain.

### `payment.partial`

Partial payment received (less than the required amount).

### `payment.overpaid`

Customer paid more than the required amount.

### `payment.expired`

Payment session has expired without receiving payment.
