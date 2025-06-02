## `dangling-namespaces.ts`

This script identifies legacy private cloud products created before the development environment was separated from the live provisioner and OpenShift clusters.

### Steps

1. Ensure VPN is connected to access the Emerald cluster.
2. Use Kubernetes port forwarding to export private cloud products, including the fields `name`, `licencePlate`, and `cluster`, into a file named `pltsvc.PrivateCloudProduct.<env>.json` in the same directory as the script.
3. Run the script from the `/app` directory:

    ```sh
    APP_ENV=script npx ts-node -r dotenv/config -r tsconfig-paths/register scripts/dangling-namespaces.ts dotenv_config_path=.env.local
    ```

4. Check the output file `dangling-namespaces.json` in the same directory as the script.

## `check-m365-client-flow.ts`

This script authenticates with Microsoft 365 using the **client credentials flow** and verifies access to the Microsoft Graph API by listing the first 10 users in the tenant.

### Prerequisites

1. Create a `.env.local` file in the root of your project and set the following environment variables:

    ```env
    AZURE_TENANT_ID=<your-tenant-id>
    AZURE_CLIENT_ID=<your-client-id>
    AZURE_CLIENT_SECRET=<your-client-secret>
    ```

2. Run the script from the `/app` directory using:

    ```sh
    npx ts-node -r dotenv/config -r tsconfig-paths/register scripts/check-m365-client-flow.ts dotenv_config_path=.env.local
    ```
