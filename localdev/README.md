# Development Sandbox

The development sandbox serves as an isolated environment for local development and testing, separate from the live system. This setup grants full control over local data and mock interfaces.

## Getting Started

To create the sandbox environment, utilize local Docker container instances with `docker-compose`:

```bash
docker-compose up --build
```

## Services

Within the local Docker container context, `five services` are established:

1. `Keycloak`: Facilitates user authentication for the application via Browser Login.
2. `Keycloak Provision`: Provisions the local Keycloak's realm, clients, and users.
3. `Postgres`: Serves as the database for Keycloak.
4. `MongoDB`: Serves as the database for the local application.
5. `Microsoft 365 Developer Proxy`: Serves as a proxy server for Microsoft Graph APIs.

- Please refer to [docker-compose.yml](./docker-compose.yml) for more detailed information.

### Important Information

- `Keycloak HTTP`: http://localhost:8080
- `Keycloak HTTPS`: https://localhost:8443
- `Keycloak Realm`: platform-services
- `Keycloak Client ID`: registry-web
- `Keyclaok Client Secret`: testsecret
- `MongoDB URL`: mongodb@localhost:27017
- `Microsoft 365 Proxy Url`: http://localhost:8000
- please refer to [.env.localdev](../.env.localdev) for comprehensive local environment values.
- please refer to [m365proxy/responses.json](./m365proxy/responses.json) for local mock user list.
