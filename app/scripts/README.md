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
