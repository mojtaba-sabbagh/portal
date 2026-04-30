## Portal SSO

This app can act as the organization's central SSO portal. Users sign in with their email address, receive a one-time code, and then the portal issues signed tokens to registered subsystems.

### Environment variables

```bash
NEXT_PUBLIC_PORTAL_URL=https://portal.example.com
SSO_ISSUER=https://portal.example.com
SSO_SECRET=replace-with-a-long-random-secret
SSO_ALLOWED_DOMAINS=example.com,tordilla.ir
SSO_CLIENTS='[{"id":"suggestion","name":"سامانه پیشنهادات","redirectUris":["https://portal.example.com/suggestion"],"secret":"replace-client-secret"}]'

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=no-reply@example.com
SMTP_PASSWORD=replace-smtp-password
SMTP_FROM=no-reply@example.com
```

Without SMTP settings in development, `/api/auth/request-code` returns the code in the JSON response so the flow can be tested locally.

### Subsystem integration

1. Redirect the user to:

```text
https://portal.example.com/sso/authorize?client_id=CLIENT_ID&redirect_uri=ENCODED_CALLBACK_URL&state=OPTIONAL_STATE
```

2. The portal signs the user in if needed and redirects back to the subsystem callback:

```text
https://subsystem.example.com/auth/callback?code=AUTHORIZATION_CODE&state=OPTIONAL_STATE
```

3. The subsystem backend exchanges the code:

```http
POST https://portal.example.com/api/sso/token
Content-Type: application/json

{
  "client_id": "CLIENT_ID",
  "client_secret": "CLIENT_SECRET",
  "redirect_uri": "https://subsystem.example.com/auth/callback",
  "code": "AUTHORIZATION_CODE"
}
```

The response contains `id_token`, `access_token`, and the authenticated user's email.
