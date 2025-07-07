# Certificate Setup for Microsoft Graph API Authentication

This guide shows how to generate a **private key** and **self-signed certificate**, and how to configure them in a `.env.local` file to be used for authenticating with Microsoft Graph API via client credentials.

---

## 1. Generate the Certificate and Private Key

Use `openssl` to generate a 2048-bit RSA private key and a self-signed certificate.

```bash
# Generate private key
openssl genrsa -out private-key.pem 2048

# Generate self-signed certificate (valid for <days> days)
openssl req -new -x509 -key private-key.pem -out certificate.pem -days <days> -subj "/CN=pltsvc"
```

> 💡 Replace `<days>` with the number of days the certificate should be valid (e.g., `365` for one year).

---

## 2. Upload Certificate to Azure

1. Go to **Azure Portal > Azure Active Directory > App registrations > \[your app]**
2. Navigate to **Certificates & secrets > Certificates**
3. Click **Upload certificate**
4. Upload the generated `certificate.pem` (⚠️ **do not upload the private key!**)

---

## 3. Configure `.env.local`

Store the **raw PEM content** of both the private key and certificate in your `.env.local` file:

```
MS_GRAPH_API_CLIENT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...actual key contents...\n-----END PRIVATE KEY-----" # pragma: allowlist secret
MS_GRAPH_API_CLIENT_CERTIFICATE="-----BEGIN CERTIFICATE-----\n...actual cert contents...\n-----END CERTIFICATE-----" # pragma: allowlist secret
```

> To convert the multi-line PEM files into single-line strings for `.env.local`, replace actual line breaks with `\n`.

You can do this manually or run a small helper command:

### Helper: Convert PEM to `\n`-escaped string

```bash
awk 'BEGIN {printf "\""} {gsub(/\r/, ""); gsub(/"/, "\\\""); printf "%s\\n", $0} END {printf "\"\n"}' private-key.pem
```

Then paste the output in:

```env
MS_GRAPH_API_CLIENT_PRIVATE_KEY=<output>
```

Repeat the same for `certificate.pem`.

---

## Example `.env.local`

```env
MS_GRAPH_API_CLIENT_ID=your-app-client-id
MS_GRAPH_API_TENANT_ID=your-tenant-id
MS_GRAPH_API_CLIENT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANB...\n-----END PRIVATE KEY-----" # pragma: allowlist secret
MS_GRAPH_API_CLIENT_CERTIFICATE="-----BEGIN CERTIFICATE-----\nMIIDZTCCAk2gAwIBAgI...\n-----END CERTIFICATE-----" # pragma: allowlist secret
```

---

## Tip: Validate Certificate Expiration

To check when your certificate expires:

```bash
openssl x509 -in certificate.pem -noout -dates
```
