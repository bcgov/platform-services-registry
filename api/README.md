# Platform Services Registry - API

This is the API component for the Platform Services Registry. It is meant to be a central point of access to the data and functionality provided by the registry.

## Build

Building the API image is straight forward; the following instructions will guide you through the process.

### Build Config

To create a basic `BuildConfig` apply the `build.yaml` file to your local tools namespace. You can run this manually or create CI/CD mechanics to automate the process.

```console
oc process -f api/openshift/templates/build.yaml| oc apply -f -
```

### Pipeline / Workflow

The project repository has CI/CD mechanics based on GitHub actions. This workflow is currently configured; To run your own workflow you will need to fork the repo so you can setup your own secrets and edit the namespace in [the workflow manifest](../.github/workflows/api.yml).

Once configured, the workflow will trigger the S2I image build process when the appropriate changes are detected on the `master` branch.

1. Create a restricted service account using [this](../openshift/cicd.yaml) OCP template.
2. Set the `OpenShiftServerURL` to your OpenShift console URL.
3. Set the `OpenShiftToken` to the access token created by Step 1; you'll find a newly minted secret with the relevant token.

### ProTip 🤓

The workflow has CodeClimate integrated. Either setup your own CodeClimate instance or remove the reference in your forked repo.

## Deploying the API

Now that you've successfully minted your very own copy of the API image in your `tools` namespace, we'll deploy it so you can do something useful with it. We'll run through the following steps and the sample commands for each one:

1. Install the ConfigMap used by the API;
2. Install the secrets used by the API;
3. Setup the API components;
4. Build the necessary schema;
5. Deploy.

### Deploy all the things (Step 1-3)

The API uses an OCP4 `ConfigMap` to store necessary configuration such as the location of NATS (and topics), SSO or DB connection parameters. Review [this](./openshift/templates/config.yaml) OCP template and make sure the properties are set correctly. Once updated, create the `ConfigMap` in OCP with the following command:

```console
oc process -f api/openshift/templates/config.yaml | \
oc create -f -
```

Secrets have been separated from the deployment template to prevent them from being regenerated every time you `oc apply` the main deployment template. Create the necessary secrets with the following command:

```console
oc process -f api/openshift/templates/secret.yaml \
  -p CHES_SSO_CLIENT_ID=XXXX
  -p CHES_SSO_CLIENT_SECRET=XXXX \
  -p SSO_CLIENT_SECRET=XXXX | \
  -p GITHUB_APP_ID=XXXX | \
  -p GITHUB_CLIENT_ID=XXXX | \
  -p GITHUB_CLIENT_SECRET=XXXX | \
  -p GITHUB_ORGANIZATION=XXXX | \
  oc create -f -

  | oc apply -f 
```

| Name                   | Description |
| :--------------------- | :-----------|
| CHES_SSO_CLIENT_ID     | The CHES client ID provided from the Web UI; You have one for each of dev / test / prod |
| CHES_SSO_CLIENT_SECRET | The CHES Token (Secret) provided from the Web UI; You have one for each of dev / test / prod |
| SSO_CLIENT_SECRET      | The SSO shared secret for your client provided by the SSO Web UI.
| GITHUB_APP_ID          | Those Github app infor mation is available in github => org => Setting => Developer setting => Github Apps The Github Application ID
| GITHUB_CLIENT_ID       | The Github Application client ID
| GITHUB_CLIENT_SECRET   | The Github Application client secret
| GITHUB_ORGANIZATION    | Organization that Github App invite user into


Next, deploy the newly minted API image with the following command. This will create all the components required to run the API.

```
oc process -f api/openshift/templates/deploy.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p SOURCE_IMAGE_NAMESPACE=<YOUR_TOOLS_NAMESPACE> \
  -p SOURCE_IMAGE_TAG=XXXX \
  -p CHES_BASEURL=https://blarb.example.com \
  -p CHES_SSO_TOKEN_URL=https://sso-dev.example.com \
  -p NATS_HOST_URL=nats://NAME.NAMESPACE.svc | \
  -p APP_DB_NAME=registry \
  -p FLYWAY_IMAGE_NAME=platsrv-registry-flyway \
  -p FLYWAY_IMAGE_TAG=XXXX \
  oc apply -f -

  ```

| Name                   | Description |
| :--------------------- | :-----------|
| NAMESPACE              | The namespace you are deploying to.
| SOURCE_IMAGE_NAMESPACE | The namespace where the source images is located.
| SOURCE_IMAGE_TAG       | The source image tag that will be deployed.
| CHES_BASEURL           | The CHES API URL; ; You have one for each of dev / test / prod.
| CHES_SSO_TOKEN_URL     | The CHES SSO token URL used for authentication; You have one for each of dev / test / prod.
| NATS_HOST_URL          | The URL for the NATS service.
| FLYWAY_IMAGE_NAME          | The URL for the NATS service.
| FLYWAY_IMAGE_TAG          | The Flyway source image tag that will be deployed

| Name                                | Description |
| :------------------------------- | :-----------|
| PRODUCTION_NAMESPACE_GOLD_URL    | The URL to the Production Namespace in the Gold Cluster.
| DEVELOPMENT_NAMESPACE_GOLD_URL   | The URL to the Development Namespace in the Gold Cluster.
| TEST_NAMESPACE_GOLD_URL          | The URL to the Test Namespace in the Gold Cluster.
| TOOLS_NAMESPACE_GOLD_URL         | The URL to the Tools Namespace in the Gold Cluster.
| PRODUCTION_NAMESPACE_SILVER_URL  | The URL to the Production Namespace in the Silver Cluster.
| DEVELOPMENT_NAMESPACE_SILVER_URL | The URL to the Development Namespace in the Silver Cluster.
| TEST_NAMESPACE_SILVER_URL        | The URL to the Test Namespace in the Silver Cluster.
| TOOLS_NAMESPACE_SILVER_URL       | The URL to the Tools Namespace in the Silver Cluster.

### ProTip 🤓
  
The deployment manifest assumes you're using image tags (or config changes) to trigger a deployment. Don't do your initial tag until you have created the database schema. If you have a running API pod, scale it down for now:

How to Scale
```console
oc scale dc/registry-api --replicas=0
```

How to Tag
```console
oc tag platsrv-registry-api:latest platsrv-registry-api:dev
```

### Schema Build-out (Step 4)

We need to build out the database schema before the API can do anything useful with it. Examine your database credentials with the following command and make a note of the `superuser-password` property. This is the application (API Pod) account used to access the database.

```console
oc get secret/registry-patroni-creds -o yaml
```

Find out what your database master Pod name is (`oc get pods` and `oc describe pod/NAME`) and use a variant of the following command to port forward to it:

```console
oc port-forward patroni-0 5432
```

Run a local instance of PostgreSQL. This will give you access to the `psql` command line tool and mount a volume so we can access the SQL scripts. This command assumes you're running it form the root directory of the repo.

```console
docker run -it --rm --name blarb \
-v $(pwd)/db:/opt/src postgres /bin/bash
```

Now set the admin password so that it can be used by `psql`:

```console
export PGPASSWORD=<ADMIN_PASSWORD_HERE>
```

Repeat the following command, once for each of the SQL scripts located in `/opt/src/sql` then onces for each of the SQL scripts located in `/opt/src/seed`. This will build out the database schema and load in the reference data. Replace `ROLLNAME` with the name from the `app-db-username` property in the patroni secret above.

```console
psql -U postgres -d registry -h host.docker.internal \
  -f /opt/src/db/sql/XXX.sql -v ROLLNAME=XXXX
```

## Usage

The API is designed to service different clients. Please reference the OpenAPI 3.0 documentation for API specifications.

### Callbacks

Here is a sample on how a client may use the API. In this sample the client will trigger the API to update the provisioning status of namespaces.

All client access is governed by Single Sign On (SSO) provided by KeyCloak (KC). Clients are created in SSO with a shared secret that can be used to acquire a JWT for API access.

Set the following environment variables with the credentials and URL provided to you.

```console
export SSO_TOKEN=YOUR_TOKEN_HERE
export SSO_CLIENT_ID=YOUR_CLIENT_ID_HERE
export SSO_TOKEN_URL=YOUR_TOKEN_URL_HERE
```

The following cURL command will fetch and print a JWT. Export the JWT to an environment variable called `MY_JWT` so subsequent command can utilize it. 

```console
curl -sX POST -H "Content-Type: application/x-www-form-urlencoded" \
    --data "grant_type=client_credentials&client_id=${SSO_CLIENT_ID}&client_secret=${SSO_TOKEN}" \
    ${SSO_TOKEN_URL} | \
    jq '.access_token' | \
    cut -d "\"" -f 2
```

Use the following command to update namespace provisioning status

```console
curl -vX PUT \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${MYTOKEN}" \
  http://localhost:8100/api/v1/provision/namespace \
  -d @data.json
```

Where `data.json` from above contains the namespace prefix of all the namespaces being updates:

Sample `data.json`:
```json
{
    "prefix": "54eab0"
}
```

### ProTip 🤓

See the OpenAPI 3.0 documentation to understand the structure of the `data.json` payload.
