# Sandbox Environment

The development sandbox serves as an isolated environment for local development and testing, separate from the live system. This setup grants full control over local data and mock interfaces.

## Pre-requisites

Due to BC Government procurement restrictions, Docker Desktop is not permitted. However, the following alternatives are approved:

-   Docker Engine (with Docker CLI)
-   Podman
-   Rancher Desktop

### Docker Setup

=== "Mac"

      1. `brew install docker`
      1. `brew install docker-compose`
      1. `brew install docker-buildx`
      1. Add symlinks in `~/.docker/cli-plugins`
         1. `ln -s $HOMEBREW_PREFIX/lib/docker/cli-plugins/docker-buildx docker-buildx`
         1. `ln -s $HOMEBREW_PREFIX/lib/docker/cli-plugins/docker-compose docker-compose`
      1. Login to docker
         1. `docker login`
      1. Start VM. Example (using podman):
         1. `podman machine init`
         1. `podman machine start`

=== "Windows"

      Refer to these blog posts on how to install Docker without Docker Desktop:

      * [How to install wsl2 ubuntu + docker + docker-compose](https://gist.github.com/martinsam16/4492957e3bbea34046f2c8b49c3e5ac0)
      * [Mastering Docker on WSL2: A Complete Guide Without Docker Desktop](https://medium.com/h7w/mastering-docker-on-wsl2-a-complete-guide-without-docker-desktop-19c4e945590b)
      * [Installing Docker, and Docker-Compose, in WSL2/Ubuntu on Windows](https://codingwithcalvin.net/installing-docker-and-docker-compose-in-wsl2ubuntu-on-windows/)

## Getting Started

1. Switch to sandbox folder

```bash
cd sandbox
```

2. Create three directories to mount volumns for `mongodb`,`postgres` and `mailpit`.

```bash
mkdir -p ./mnt/mongodb
mkdir -p ./mnt/postgres
mkdir -p ./mnt/mailpit
```

If you have data version conflict errors due to existing mount volumes, please delete the directories and recreate them.

3. Set environment variable MACHINE_HOST_IP to your ip address using the command

For WSL/Linux:

```bash
export MACHINE_HOST_IP=$(hostname -I | awk '{print $1}')
```

or
For Mac M1/M2:

```bash
export MACHINE_HOST_IP=$(ipconfig getifaddr en0)
```

4. To create the sandbox environment, utilize local Docker container instances with `docker-compose`:

For WSL/Linux:

```bash
docker-compose up --build [-d]
```

or
For Mac M1/M2:

```bash
docker-compose -f docker-compose.yml -f docker-compose-arm64.yml up --build [-d]
```

You can add the `-d` flag to run the containers in daemon mode.

Ensure that neither `MongoDB` nor `Mongosh` is installed on your local machine, as they may interfere with the database schema managed by Prisma, which connects to the `MongoDB Docker container`. If you have either installed, you can remove them by following the instruction provided in this link: [uninstall mongodb and mongosh](https://www.mongodb.com/resources/products/fundamentals/uninstall-mongodb#:~:text=How%20to%20uninstall%20MongoDB%20from%20Mac%201%20If,the%20below%20command%3A%20brew%20uninstall%20mongodb-community%20%20){target="\_blank" rel="noopener noreferrer"}

## Services

Within the local Docker container environment, **10 services** are available:

1. **Keycloak**
   Handles user authentication for the application via browser-based login.

2. **Keycloak Provision**
   Provisions the local Keycloak realm, clients, and users.

3. **PostgreSQL**
   Serves as the database for Keycloak.

4. **MongoDB**
   Serves as the database for the local application; you can use [MongoDB Compass](https://www.mongodb.com/products/tools/compass){target="\_blank" rel="noopener noreferrer"} to explore the local database.

5. **Microsoft 365 Mock**
   A mock server for Microsoft Graph API endpoints.

6. **CHES Mock**
   Simulates the Common Hosted Email Service (CHES) for local email delivery and testing.

7. **NATS**
   Acts as the message broker for communication with the Provisioner.

8. **NATS Provision**
   A mock Provisioner service for handling provisioning requests.

9. **WeasyPrint Server**
   Converts HTML and CSS content into downloadable PDF documents.

10. **Mailpit**
    A lightweight email testing tool that captures and inspects outgoing emails.
    - See [Mailpit GitHub Repository](https://github.com/axllent/mailpit){target="\_blank" rel="noopener noreferrer"} for more details.

> For complete service definitions, refer to the [docker-compose.yml](https://github.com/bcgov/platform-services-registry/blob/main/sandbox/docker-compose.yml){target="\_blank" rel="noopener noreferrer"} file.

### Access Details

-   **Keycloak (HTTP)**: [http://localhost:8080](http://localhost:8080)
-   **Keycloak (HTTPS)**: [https://localhost:8443](https://localhost:8443)
-   **Keycloak Realm**: `platform-services`
-   **Keycloak Client ID**: `pltsvc`
-   **Keycloak Client Secret**: `testsecret`
-   **MongoDB URL**: `mongodb://localhost:27017`
-   **Microsoft 365 Proxy URL**: [http://localhost:8000](http://localhost:8000)
-   **CHES Mock URL**: [http://localhost:3025](http://localhost:3025)
-   **Mailpit URL**: [http://localhost:8025](http://localhost:8025)

> Mock user details can be found in the [mock-users.json](https://github.com/bcgov/platform-services-registry/blob/main/sandbox/mock-users.json){target="\_blank" rel="noopener noreferrer"} file.
> Passwords are derived by converting user email addresses to lowercase.
