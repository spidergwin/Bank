# Get session status

## OpenAPI Specification

```yaml
openapi: 3.0.1
info:
  title: ""
  description: ""
  version: 1.0.0
paths:
  /api/v1/payments/sessions/{sessionId}/status:
    get:
      summary: Get session status
      deprecated: false
      description: >-
        **Retrieves the current status of a specific payment session using the
        provided sessionId.**


        **This endpoint allows merchants to verify whether a payment is pending,
        successful, failed, or partially completed.**
      tags:
        - ⚒️ Developer/🔑 API Documentation/Payments
      parameters:
        - name: sessionId
          in: path
          description: ""
          required: true
          example: ps_9625f4149dc591b812f3c84bdee3a226486d332b5d6568af
          schema:
            type: string
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
      x-run-in-apidog: https://app.apidog.com/web/project/1208322/apis/api-28690454-run
components:
  schemas: {}
  securitySchemes: {}
servers:
  - url: https://api.maxelpay.com
    description: Prod Env
security: []
```

<!-- example using js fetch -->

```js
var requestOptions = {
  method: "GET",
  redirect: "follow",
}

fetch(
  "https://api.maxelpay.com/api/v1/payments/sessions/ps_9625f4149dc591b812f3c84bdee3a226486d332b5d6568af/status",
  requestOptions
)
  .then((response) => response.text())
  .then((result) => console.log(result))
  .catch((error) => console.log("error", error))
```
