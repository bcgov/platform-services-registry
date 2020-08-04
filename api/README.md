

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

### Pro Tip 🤓

The workflow has CodeClimate integrated. Either setup your own CodeClimate instance or remove the reference in yur forked repo.

## Deploying the API

Now that you've sucesfully minted your very own copy of the API image in your `tools` namespace, we'll deploy it so you can do something useful with it. We'll run through the following steps and the sample commands for each one:

1. Install the ConfigMap used by the API;
2. Install the secrets used by the API;
3. Setup the API components;
4. Build the necessary schema;
5. Deploy.

### Deploy all the things (Step 1-3)

The API uses an OCP4 `ConfigMap` to store necessary configuration such as the location of NATS, SSO or db connection parameters. Review [this](./openshift/templates/config.yaml) OCP template and make sure the properties are set correctly. Once updated, create the `ConfigMap` in OCP with the following command:

```console
oc process -f api/openshift/templates/config.yaml | \
oc create -f -
```

Secrets have been separated from the deployment template to prevent them from being regenerated every time you `oc apply` the main deployment template. Create the necessary secrets with the following command:

```console
oc process -f api/openshift/templates/secret.yaml | \
oc create -f -
```

Next, deploy the newly minted API image with the following command. This will create all the components required to run the API.

```console
  oc process -f api/openshift/templates/deploy.yaml \
    -p NAMESPACE=$(oc project --short) \
    -p SOURCE_IMAGE_NAMESPACE=<YOUR-TOOLS-NAMESPACE> \
    -p SOURCE_IMAGE_TAG=dev | \
    oc create -f -
  ```

### Pro Tip 🤓
  
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

We need to build out the database schema before the API can do anything useful with it.

Examine your database credentials with the following command and make a note of the `user` property. This is the application (API Pod) account used to access the database.

```console
oc get secret/registry-postgres-creds -o yaml
```

Find out what your database Pod name is and use a variant of the following command to port forward to it:

```console
oc port-forward registry-postgres-1-rz6nz 5432
```

Run a local instance of PostgreSQL. This will give you acess to the `psql` command line tool and mount a volume so we can access the SQL scripts. This command assumes you're running it form the `api` subdirectory in the source repo.

```console
docker run -it --rm --name blarb \
-v $(pwd):/opt/src postgres /bin/bash
```
docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
root@d7fc5e936e34:/# psql -U postgres -h host.docker.internal
psql (12.0 (Debian 12.0-1.pgdg100+1), server 12.1)
Type "help" for help.

postgres=# \du
                                   List of roles
 Role name |                         Attributes                         | Member of 
-----------+------------------------------------------------------------+-----------
 6yve3bce  |                                                            | {}
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

postgres=# 

psql -U postgres -d registry -h host.docker.internal -f /opt/src/db/sql/0001.sql -v ROLLNAME=app_api_oksb6iie








## Usage

The API is designed to service different clients. Please reference the OpenAPI 3.0 documentation for API specifications.

### Callbacks

Here is a sample on how a client may use the API. In this sample the client will trigger the API to update the provisioning status of namespaces.

All client access is governed by Single Sign On (SSO) provided by Keycloak. Clients are created in SSO with a shared secret that can be used to acquire a JWT for API access.

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
  -H "Authorization: Bearer ${MY_JWT}" \
  -d @data.json \
  http://localhost:8100/api/v1/provision/1/namespace
```

### Pro Tip 🤓

See the OpenAPI 3.0 documentation to understand the structure of the `data.json` payload.

## Deploy

Edit as needed then do:
oc process -f api/openshift/templates/config.yaml | oc apply -f -

oc process -f api/openshift/templates/deploy.yaml -p NAMESPACE=$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=your-namespace-tools -p SOURCE_IMAGE_TAG=dev | oc apply -f -


➜  platform-services-registry git:(master) ✗ oc tag platsrv-registry-web:latest platsrv-registry-web:dev

Web

➜  platform-services-registry git:(master) ✗ oc process -f web/openshift/templates/config.yaml | oc apply -f -

oc process -f web/openshift/templates/deploy.yaml -p NAMESPACE=$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=platform-registry-tools -p SOURCE_IMAGE_TAG=dev | oc apply -f -

10452  oc process -f web/openshift/templates/deploy.yaml -p NAMESPACE=$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=platform-registry-tools -p SOURCE_IMAGE_TAG=dev -p SSO_BASE_URL="https://sso-dev.pathfinder.gov.bc.ca" -p CLUSTER_DOMAIN=apps.thetis.devops.gov.bc.ca | oc apply -f -

# schema
oc get secret/registry-postgres-creds -o yaml

oc port-forward registry-postgres-1-rz6nz 5432

➜  platform-services-registry git:(master) ✗ docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
root@d7fc5e936e34:/# psql -U postgres -h host.docker.internal
psql (12.0 (Debian 12.0-1.pgdg100+1), server 12.1)
Type "help" for help.

postgres=# \du
                                   List of roles
 Role name |                         Attributes                         | Member of 
-----------+------------------------------------------------------------+-----------
 6yve3bce  |                                                            | {}
 postgres  | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

postgres=# 

psql -U postgres -d registry -h host.docker.internal -f /opt/src/db/sql/0001.sql -v ROLLNAME=app_api_oksb6iie

Seeing an unresolved image or not deploying the API? Remember to tag:
oc tag platsrv-registry-api:latest platsrv-registry-api:dev

ult -n devops-security-aporeto-operator
 4179  history|grep `oc policy`
 4180  history|grep oc policy
 4181  history|grep "oc policy"
 5909  oc policy add-role-to-user system:image-puller system:serviceaccount:$(oc project --short=true):default -n devhub-tools
 9974  oc policy add-role-to-user \\n    system:image-puller system:serviceaccount:$(:default \\n    --namespace=<your_tools_namespace>
 9976  oc policy add-role-to-user \\n    system:image-puller system:serviceaccount:platform-registry-dev:default \\n    --namespace=platform-registry-tools
 9977  oc policy add-role-to-group \\n    system:image-puller system:serviceaccounts:platform-registry-dev \\n    --namespace=platform-registry-tools
10653  history|grep 'oc policy"
10654  history|grep 'oc policy'
➜  platform-services-registry git:(feature/prov-cb) ✗ !9976
➜  platform-services-registry git:(feature/prov-cb) ✗ oc policy add-role-to-user \
    system:image-puller system:serviceaccount:platform-registry-dev:default \
    --namespace=platform-registry-tools
clusterrole.rbac.authorization.k8s.io/system:image-puller added: "system:serviceaccount:platform-registry-dev:default"
➜  platform-services-registry git:(feature/prov-cb) ✗ !9977
➜  platform-services-registry git:(feature/prov-cb) ✗ oc policy add-role-to-group \
    system:image-puller system:serviceaccounts:platform-registry-dev \
    --namespace=platform-registry-tools
clusterrole.rbac.authorization.k8s.io/system:image-puller added: "system:serviceaccounts:platform-registry-dev"
➜  platform-services-registry git:(feature/prov-cb) ✗ oc process -f api/openshift/templates/deploy.yaml -p NAMESPACE=$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=platform-registry-tools -p SOURCE_IMAGE_TAG=dev | oc apply -f -

route.route.openshift.io/registry-api configured
persistentvolumeclaim/registry-pgdata unchanged
service/registry-postgres unchanged
service/registry-api unchanged
deploymentconfig.apps.openshift.io/registry-postgres unchanged
deploymentconfig.apps.openshift.io/registry-api configured
➜  platform-services-registry git:(feature/prov-cb) ✗ oc get pods
NAME                         READY   STATUS      RESTARTS   AGE
registry-api-1-deploy        1/1     Running     0          18s
registry-api-1-z2n4x         0/1     Running     0          15s
registry-postgres-1-deploy   0/1     Completed   0          7m20s
registry-postgres-1-ltv9z    1/1     Running     0          7m18s
➜  platform-services-registry git:(feature/prov-cb) ✗ oc logs pod/registry-api-1-z2n4x -f
Environment: 
        DEV_MODE=false
        NODE_ENV=production
        DEBUG_PORT=5858
Launching via npm...
npm info it worked if it ends with ok
npm info using npm@6.13.4
npm info using node@v10.19.0
npm info lifecycle platform-services-registry@0.0.1~prestart: platform-services-registry@0.0.1
npm info lifecycle platform-services-registry@0.0.1~start: platform-services-registry@0.0.1

> platform-services-registry@0.0.1 start /opt/app-root/src
> node build/server.js

2020-07-28T19:41:45.105Z info: Production server running on port: 8080
2020-07-28T19:41:45.108Z error: Unable to fetch JWT, err = The grant type must be provided
2020-07-28T19:41:45.110Z warn: API documentation does not exist
2020-07-28T19:41:45.110Z warn: Static assets location does not exist
2020-07-28T19:41:45.304Z info: nats connect to nats.pye-sandbox.svc:4222
^C
➜  platform-services-registry git:(feature/prov-cb) ✗ oc get pods
NAME                         READY   STATUS      RESTARTS   AGE
registry-api-1-deploy        0/1     Completed   0          66s
registry-api-1-z2n4x         1/1     Running     0          63s
registry-postgres-1-deploy   0/1     Completed   0          8m8s
registry-postgres-1-ltv9z    1/1     Running     0          8m6s
➜  platform-services-registry git:(feature/prov-cb) ✗ history|grep run|grep postg
 8936  docker run --it -rm --name blarb postgres
 8937  docker run -it --rm --name blarb postgres
 9264  docker run -it --rm --name blarb postgres -v $(pwd):/opt/src
 9360  history|grep run|grep postg
 9361  docker run -it --rm --name blarb -v $(pwd):/opt/src postgres
 9646  history|grep docker|grep run| grep postgr
 9702  docker run -it --rm --name blarb postgres /bin/bash
 9843  docker run -it --rm --name blarb postgres -v $(pwd):/opt/src /bin/bash
 9991  docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
10046  docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
➜  platform-services-registry git:(feature/prov-cb) ✗ !10046
➜  platform-services-registry git:(feature/prov-cb) ✗ docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
root@afa1e9a07da4:/# cd /opt/src/db/s
scripts/ seed/    sql/     
root@afa1e9a07da4:/# cd /opt/src/db/sql/
root@afa1e9a07da4:/opt/src/db/sql# psql -U postgres -d registry -h host.docker.internal
psql (12.0 (Debian 12.0-1.pgdg100+1), server 12.1)
Type "help" for help.

registry=# \du
                                       List of roles
    Role name     |                         Attributes                         | Membe
r of 
------------------+------------------------------------------------------------+------
-----
 app_api_x1feiv1x |                                                            | {}
 postgres         | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

registry=# \q
root@afa1e9a07da4:/opt/src/db/sql# app_api_x1feiv1x
bash: app_api_x1feiv1x: command not found
root@afa1e9a07da4:/opt/src/db/sql# ls
0001.sql
root@afa1e9a07da4:/opt/src/db/sql# psql -U postgres -d registry -h host.docker.internal -v ROLLNAME=app_api_x1feiv1x -f 0001.sql 
BEGIN
CREATE FUNCTION
CREATE TABLE
GRANT
psql:0001.sql:27: NOTICE:  trigger "update_ref_cluster_changetimestamp" for relation "ref_cluster" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
psql:0001.sql:41: NOTICE:  trigger "update_ref_bus_org_changetimestamp" for relation "ref_bus_org" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:60: NOTICE:  trigger "update_user_profile_changetimestamp" for relation "user_profile" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
CREATE INDEX
GRANT
GRANT
psql:0001.sql:87: NOTICE:  trigger "update_profile_changetimestamp" for relation "profile" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:107: NOTICE:  trigger "update_namespace_changetimestamp" for relation "namespace" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:126: NOTICE:  trigger "update_cluster_namespace_changetimestamp" for relation "cluster_namespace" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
psql:0001.sql:141: NOTICE:  trigger "update_ref_role_changetimestamp" for relation "ref_role" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:163: NOTICE:  trigger "update_contact_changetimestamp" for relation "contact" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:181: NOTICE:  trigger "update_profile_contact_changetimestamp" for relation "profile_contact" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
COMMIT
root@afa1e9a07da4:/opt/src/db/sql# cd ..
root@afa1e9a07da4:/opt/src/db# ls
Dockerfile  scripts  seed  sql
root@afa1e9a07da4:/opt/src/db# cd seed/
root@afa1e9a07da4:/opt/src/db/seed# ls
ref_bus_org.sql  ref_cluster.sql  ref_role.sql
root@afa1e9a07da4:/opt/src/db/seed# psql -U postgres -d registry -h host.docker.internal -v ROLLNAME=app_api_x1feiv1x -f ref_bus_org.sql 
BEGIN
INSERT 0 26
COMMIT
root@afa1e9a07da4:/opt/src/db/seed# psql -U postgres -d registry -h host.docker.internal -v ROLLNAME=app_api_x1feiv1x -f ref_cluster.sql 
BEGIN
INSERT 0 6
COMMIT
root@afa1e9a07da4:/opt/src/db/seed# psql -U postgres -d registry -h host.docker.internal -v ROLLNAME=app_api_x1feiv1x -f ref_role.sql 
BEGIN
INSERT 0 2
COMMIT
root@afa1e9a07da4:/opt/src/db/seed# 