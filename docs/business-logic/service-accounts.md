# Service Accounts

Service accounts in the Registry app are designed for machine-to-machine communication with designated API endpoints. There are two types of service accounts: **user-context** and **team-context**. Both are represented as `clients` in the Keycloak realm, configured with hardcoded mappers based on their context.

## User-Context Service Account

Any authenticated user can generate a user-context service account to access available API endpoints. The service account includes a `clientID` and `clientSecret`, which can be used to request a short-lived access token from Keycloak. This token is then included in the `Authorization` header when making API requests.

API handlers verify:

-   `service_account_type: 'user'`
-   `kc-userid: <Keycloak User ID>`

The access token grants the same privileges as the associated user, allowing access to resources permitted for that user.

## Team-Context Service Account

While user-context service accounts are tied to individual users, team-context service accounts are ideal for long-running workflows such as CI/CD pipelines. This prevents pipeline failures due to user offboarding.

Team-context service accounts must be created and assigned by a system administrator and are used to represent global roles. They also include a `clientID` and `clientSecret` to request short-lived access tokens.

API handlers verify:

-   `service_account_type: 'team'`
-   `roles: <comma-separated roles string>`

Access is granted based on the roles assigned to the service account.

## Access Token Generation

```js
// Request an access token
const tokenResponse = await fetch(
    'https://<env>.loginproxy.gov.bc.ca/auth/realms/platform-services/protocol/openid-connect/token',
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: '<client_id>',
            client_secret: '<client_secret>',
        }),
    },
);

const { access_token } = await tokenResponse.json();

// Use the token to access a protected API
const dataResponse = await fetch('https://<env>-pltsvc.apps.silver.devops.gov.bc.ca/api/v1/private-cloud/products', {
    method: 'GET',
    headers: {
        Authorization: 'Bearer ' + access_token,
        'Content-Type': 'application/json',
    },
});

const data = await dataResponse.json();
```
