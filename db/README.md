# Platform Services Registry - Database

This is the Database component for the Platform Services Registry.

## Build

It is recommended to pull the Patroni image from the `bcgov` namespace; if you wish to customize it, a build manifest is located in the platform services repository used to generate the public image. 

## Deploying the API

# Prerequisites

For Patroni to run as a `StatefulSet` it needs to have a Secret, Services Account an RBAC setup prior to deployment. This can be setup by first running the supplied [prerequisite.yaml](./openshift/templates/prerequisite.yaml) template:

```console
oc process -f openshift/prerequisite.yaml \
  oc create -f -
```

Returns something similar to:
```console
➜  db git:(master) ✗ oc process -f openshift/prerequisite.yaml| oc create -f -
secret/registry-patroni-creds created
serviceaccount/registry-patroni created
role.rbac.authorization.k8s.io/registry-patroni created
rolebinding.rbac.authorization.k8s.io/registry-patroni created
```

**ProTim** 🤓

Find the database and admin credential in the newly minted secret `registry-patroni-creds`;

# Patroni StatefulSet

Patroni will run as a `StatefulSet` of three pods, one of which will be deemed the "master"; the remaining two will be replicas. Patroni will use two `ConfigMap` objects to store its internal configuration and record which pod in the set is currently the master.

Review and run the provided [deploy.yaml](./openshift/templates/deploy.yaml) template.

```console
oc process -f openshift/deploy.yaml | \
  oc apply -f -
```

Returns something similar to:
```
➜  db git:(master) ✗ oc process -f openshift/deploy.yaml | oc apply -f -
service/registry-patroni-master created
statefulset.apps/registry-patroni created
```

**ProTim** 🤓
- Seeing an error like `2020-10-27 20:39:48,765 ERROR: ObjectCache.run ProtocolError('Connection broken: IncompleteRead(0 bytes read)', IncompleteRead(0 bytes read))`? Did you apply your NSP?

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
  oc create -f -
```

| Name                   | Description |
| :--------------------- | :-----------|
| CHES_SSO_CLIENT_ID     | The CHES client ID provided from the Web UI; You have one for each of dev / test / prod |
| CHES_SSO_CLIENT_SECRET | The CHES Token (Secret) provided from the Web UI; You have one for each of dev / test / prod |
| SSO_CLIENT_SECRET      | The SSO shared secret for your client provided by the SSO Web UI.


Next, deploy the newly minted API image with the following command. This will create all the components required to run the API.

```console
oc process -f api/openshift/templates/deploy.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p SOURCE_IMAGE_NAMESPACE=<YOUR_TOOLS_NAMESPACE> \
  -p SOURCE_IMAGE_TAG=XXXX \
  -p CHES_BASEURL=https://blarb.example.com \
  -p CHES_SSO_TOKEN_URL=https://sso-dev.example.com \
  -p NATS_HOST_URL=nats://NAME.NAMESPACE.svc | \
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



-----




### Patroni

Build if you need a local image (defaults in this build have been changed to leverage postgres:12). Note the `oc create` instead of `oc apply`, this is to support multiple base image versions.

`oc process -f openshift/templates/patroni-build.yaml | oc -n platform-registry-tools create -f -`

## Deploy


➜  platform-services-registry git:(master) ✗ oc process -f openshift/templates/patroni-pre-req.yaml| oc create -f -
secret/registry-patroni-creds created
serviceaccount/registry-patroni created
role.rbac.authorization.k8s.io/registry-patroni created
rolebinding.rbac.authorization.k8s.io/registry-patroni created

➜  platform-services-registry git:(master) ✗ oc tag platform-registry-tools/patroni:v12-latest platform-registry-test/patroni:v12-latest
Tag platform-registry-test/patroni:v12-latest set to platform-registry-tools/patroni@sha256:b19247085f64b41d6841dc0cbbe3af268910e1cba23766a89195ca1f3f7c1986.

➜  platform-services-registry git:(master) ✗ oc process -f openshift/templates/patroni-deploy.yaml -p IMAGE_STREAM_NAMESPACE=platform-registry-prod -p PVC_SIZE=5Gi | oc apply -f - 
service/registry-patroni-master created
statefulset.apps/registry-patroni created

Some time later...
➜  platform-services-registry git:(master) ✗ oc get pods
NAME                 READY   STATUS    RESTARTS   AGE
registry-patroni-0   1/1     Running   0          4m8s
registry-patroni-1   1/1     Running   0          3m16s
registry-patroni-2   1/1     Running   0          2m11s

➜  platform-services-registry git:(master) ✗ oc process -f api/openshift/templates/config.yaml -p SSO_BASE_URL=oidc.gov.bc.ca | oc create -f -
configmap/registry-api-config created

➜  platform-services-registry git:(master) ✗ oc process -f api/openshift/templates/secret.yaml -p CHES_SSO_CLIENT_ID=PS_REG_SERVICE_CLIENT -p CHES_SSO_CLIENT_SECRET=0ef7b07f-8709-44ed-bc93-803a0b0f6798 -p SSO_CLIENT_SECRET=71899a36-f27d-4d78-ad17-22764caa4fed| oc create -f -
secret/registry-sso-creds created
secret/registry-ches-creds created


Deploy postgres service first (please set context to appropriate project/namespace):

```bash
oc process -f openshift/templates/patroni-pre-req.yaml -p NAME=registry-patroni | oc create -f -

oc process -f openshift/templates/patroni-deploy.yaml \
 -p NAME=registry-patroni \
 -p "IMAGE_STREAM_NAMESPACE=platform-services-registry-tools" \
 -p "IMAGE_STREAM_TAG=patroni:v12-latest" \
 -p REPLICAS=3 \
 -p PVC_SIZE=5Gi | oc apply -f -
```

Edit as needed then do:
oc process -f api/openshift/templates/config.yaml | oc apply -f -

oc process -f api/openshift/templates/deploy.yaml -p NAMESPACE=\$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=your-namespace-tools -p SOURCE_IMAGE_TAG=dev | oc apply -f -

➜ platform-services-registry git:(master) ✗ oc tag platsrv-registry-web:latest platsrv-registry-web:dev

Web

➜ platform-services-registry git:(master) ✗ oc process -f web/openshift/templates/config.yaml | oc apply -f -

oc process -f web/openshift/templates/deploy.yaml -p NAMESPACE=\$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=platform-registry-tools -p SOURCE_IMAGE_TAG=dev | oc apply -f -

10452 oc process -f web/openshift/templates/deploy.yaml -p NAMESPACE=\$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=platform-registry-tools -p SOURCE_IMAGE_TAG=dev -p SSO_BASE_URL="https://sso-dev.pathfinder.gov.bc.ca" -p CLUSTER_DOMAIN=apps.thetis.devops.gov.bc.ca | oc apply -f -

# schema

oc get secret/registry-postgres-creds -o yaml

oc port-forward registry-postgres-1-rz6nz 5432

➜ platform-services-registry git:(master) ✗ docker run -it --rm --name blarb -v \$(pwd):/opt/src postgres /bin/bash
root@d7fc5e936e34:/# psql -U postgres -h host.docker.internal
psql (12.0 (Debian 12.0-1.pgdg100+1), server 12.1)
Type "help" for help.

postgres=# \du
List of roles
Role name | Attributes | Member of
-----------+------------------------------------------------------------+-----------
6yve3bce | | {}
postgres | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

postgres=#

psql -U postgres -d registry -h host.docker.internal -f /opt/src/db/sql/0001.sql -v ROLLNAME=app_api_oksb6iie

Seeing an unresolved image or not deploying the API? Remember to tag:
oc tag platsrv-registry-api:latest platsrv-registry-api:dev

ult -n devops-security-aporeto-operator
4179 history|grep `oc policy`
4180 history|grep oc policy
4181 history|grep "oc policy"
5909 oc policy add-role-to-user system:image-puller system:serviceaccount:$(oc project --short=true):default -n devhub-tools
 9974  oc policy add-role-to-user \\n    system:image-puller system:serviceaccount:$(:default \\n --namespace=<your_tools_namespace>
9976 oc policy add-role-to-user \\n system:image-puller system:serviceaccount:platform-registry-dev:default \\n --namespace=platform-registry-tools
9977 oc policy add-role-to-group \\n system:image-puller system:serviceaccounts:platform-registry-dev \\n --namespace=platform-registry-tools
10653 history|grep 'oc policy"
10654 history|grep 'oc policy'
➜ platform-services-registry git:(feature/prov-cb) ✗ !9976
➜ platform-services-registry git:(feature/prov-cb) ✗ oc policy add-role-to-user \
 system:image-puller system:serviceaccount:platform-registry-dev:default \
 --namespace=platform-registry-tools
clusterrole.rbac.authorization.k8s.io/system:image-puller added: "system:serviceaccount:platform-registry-dev:default"
➜ platform-services-registry git:(feature/prov-cb) ✗ !9977
➜ platform-services-registry git:(feature/prov-cb) ✗ oc policy add-role-to-group \
 system:image-puller system:serviceaccounts:platform-registry-dev \
 --namespace=platform-registry-tools
clusterrole.rbac.authorization.k8s.io/system:image-puller added: "system:serviceaccounts:platform-registry-dev"
➜ platform-services-registry git:(feature/prov-cb) ✗ oc process -f api/openshift/templates/deploy.yaml -p NAMESPACE=\$(oc project --short) -p SOURCE_IMAGE_NAMESPACE=platform-registry-tools -p SOURCE_IMAGE_TAG=dev | oc apply -f -

route.route.openshift.io/registry-api configured
persistentvolumeclaim/registry-pgdata unchanged
service/registry-postgres unchanged
service/registry-api unchanged
deploymentconfig.apps.openshift.io/registry-postgres unchanged
deploymentconfig.apps.openshift.io/registry-api configured
➜ platform-services-registry git:(feature/prov-cb) ✗ oc get pods
NAME READY STATUS RESTARTS AGE
registry-api-1-deploy 1/1 Running 0 18s
registry-api-1-z2n4x 0/1 Running 0 15s
registry-postgres-1-deploy 0/1 Completed 0 7m20s
registry-postgres-1-ltv9z 1/1 Running 0 7m18s
➜ platform-services-registry git:(feature/prov-cb) ✗ oc logs pod/registry-api-1-z2n4x -f
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
➜ platform-services-registry git:(feature/prov-cb) ✗ oc get pods
NAME READY STATUS RESTARTS AGE
registry-api-1-deploy 0/1 Completed 0 66s
registry-api-1-z2n4x 1/1 Running 0 63s
registry-postgres-1-deploy 0/1 Completed 0 8m8s
registry-postgres-1-ltv9z 1/1 Running 0 8m6s
➜ platform-services-registry git:(feature/prov-cb) ✗ history|grep run|grep postg
8936 docker run --it -rm --name blarb postgres
8937 docker run -it --rm --name blarb postgres
9264 docker run -it --rm --name blarb postgres -v $(pwd):/opt/src
 9360  history|grep run|grep postg
 9361  docker run -it --rm --name blarb -v $(pwd):/opt/src postgres
9646 history|grep docker|grep run| grep postgr
9702 docker run -it --rm --name blarb postgres /bin/bash
9843 docker run -it --rm --name blarb postgres -v $(pwd):/opt/src /bin/bash
 9991  docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
10046 docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
➜  platform-services-registry git:(feature/prov-cb) ✗ !10046
➜  platform-services-registry git:(feature/prov-cb) ✗ docker run -it --rm --name blarb -v $(pwd):/opt/src postgres /bin/bash
root@afa1e9a07da4:/# cd /opt/src/db/s
scripts/ seed/ sql/  
root@afa1e9a07da4:/# cd /opt/src/db/sql/
root@afa1e9a07da4:/opt/src/db/sql# psql -U postgres -d registry -h host.docker.internal
psql (12.0 (Debian 12.0-1.pgdg100+1), server 12.1)
Type "help" for help.

registry=# \du
List of roles
Role name | Attributes | Membe
r of
------------------+------------------------------------------------------------+------

---

app_api_x1feiv1x | | {}
postgres | Superuser, Create role, Create DB, Replication, Bypass RLS | {}

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
psql:0001.sql:27: NOTICE: trigger "update_ref_cluster_changetimestamp" for relation "ref_cluster" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
psql:0001.sql:41: NOTICE: trigger "update_ref_bus_org_changetimestamp" for relation "ref_bus_org" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:60: NOTICE: trigger "update_user_profile_changetimestamp" for relation "user_profile" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
CREATE INDEX
GRANT
GRANT
psql:0001.sql:87: NOTICE: trigger "update_profile_changetimestamp" for relation "profile" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:107: NOTICE: trigger "update_namespace_changetimestamp" for relation "namespace" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:126: NOTICE: trigger "update_cluster_namespace_changetimestamp" for relation "cluster_namespace" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
psql:0001.sql:141: NOTICE: trigger "update_ref_role_changetimestamp" for relation "ref_role" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:163: NOTICE: trigger "update_contact_changetimestamp" for relation "contact" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
CREATE TABLE
GRANT
GRANT
psql:0001.sql:181: NOTICE: trigger "update_profile_contact_changetimestamp" for relation "profile_contact" does not exist, skipping
DROP TRIGGER
CREATE TRIGGER
COMMIT
root@afa1e9a07da4:/opt/src/db/sql# cd ..
root@afa1e9a07da4:/opt/src/db# ls
Dockerfile scripts seed sql
root@afa1e9a07da4:/opt/src/db# cd seed/
root@afa1e9a07da4:/opt/src/db/seed# ls
ref_bus_org.sql ref_cluster.sql ref_role.sql
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
