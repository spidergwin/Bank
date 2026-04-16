# Create payment session

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ""
  description: ""
  version: 1.0.0
paths:
  /api/v1/payments/sessions:
    post:
      summary: Create payment session
      deprecated: false
      description: >
        **Creates a new payment session for an order and returns a hosted
        checkout URL where the customer can complete the crypto payment.**


        **The merchant must provide order details, amount, currency, and
        redirect URLs. Once the payment is completed or fails, the customer is
        redirected to the respective URL, and a webhook notification is sent to
        the provided callback URL.**
      tags:
        - ⚒️ Developer/🔑 API Documentation/Payments
      parameters:
        - name: X-API-KEY
          in: header
          description: ""
          required: true
          example: pk_test_uaXc175J7j8fT3Zgptx197h5GCTtqpZM
          schema:
            type: string
        - name: Content-Type
          in: header
          description: ""
          required: true
          example: application/json
          schema:
            type: string
      requestBody:
        content:
          application/json:
            schema:
              type: object
              properties:
                orderId:
                  type: string
                amount:
                  type: number
                currency:
                  type: string
                description:
                  type: string
                successUrl:
                  type: string
                cancelUrl:
                  type: string
                callbackUrl:
                  type: string
              required:
                - orderId
                - amount
                - currency
                - description
                - successUrl
                - cancelUrl
                - callbackUrl
              x-apidog-orders:
                - orderId
                - amount
                - currency
                - description
                - successUrl
                - cancelUrl
                - callbackUrl
            example:
              orderId: order_123
              amount: 99.99
              currency: USD
              description: "Order #123 - Premium Package"
              successUrl: https://yoursite.com/success
              cancelUrl: https://yoursite.com/cancel
              callbackUrl: https://yoursite.com/webhook
      responses:
        "200":
          description: ""
          content:
            application/json:
              schema:
                type: object
                properties: {}
                x-apidog-orders: []
          headers: {}
          x-apidog-name: ""
      security: []
      x-apidog-folder: ⚒️ Developer/🔑 API Documentation/Payments
      x-apidog-status: released
      x-run-in-apidog: https://app.apidog.com/web/project/1208322/apis/api-28690453-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://api.maxelpay.com
    description: Prod Env
security: []
```

<!-- This is a js code example -->

```js
var myHeaders = new Headers()
myHeaders.append("X-API-KEY", "pk_test_uaXc175J7j8fT3Zgptx197h5GCTtqpZM")
myHeaders.append("Content-Type", "application/json")

var raw = JSON.stringify({
  orderId: "order_123",
  amount: 99.99,
  currency: "USD",
  description: "Order #123 - Premium Package",
  successUrl: "https://yoursite.com/success",
  cancelUrl: "https://yoursite.com/cancel",
  callbackUrl: "https://yoursite.com/webhook",
})

var requestOptions = {
  method: "POST",
  headers: myHeaders,
  body: raw,
  redirect: "follow",
}

fetch("https://api.maxelpay.com/api/v1/payments/sessions", requestOptions)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log("error", error))
```
