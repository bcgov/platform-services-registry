![Test & Build](https://github.com/bcgov/platform-services-registry/workflows/Test%20&%20Build/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/95db366ef76313d5d4eb/maintainability)](https://codeclimate.com/github/bcgov/platform-services-registry/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/95db366ef76313d5d4eb/test_coverage)](https://codeclimate.com/github/bcgov/platform-services-registry/test_coverage)

# platform-services-registry

Platform services OCP project registry

## Callbacks

export SSO_TOKEN=YOUR_TOKEN_HERE
export SSO_CLIENT_ID=YOUR_CLIENT_ID_HERE
export SSO_TOKEN_URL=YOUR_TOKEN_URL_HERE

curl -sX POST -H "Content-Type: application/x-www-form-urlencoded" \
 --data "grant_type=client_credentials&client_id=${SSO_CLIENT_ID}&client_secret=${SSO_TOKEN}" \
 \${SSO_TOKEN_URL} | \
 jq '.access_token' |
cut -d "\"" -f 2

Then use a callback:
curl -vX PUT -H "Content-Type: application/json" -H "Authorization: Bearer \${MYT}" http://localhost:8100/api/v1/provision/1/namespace -d @data.json

## Build

### API

`oc process -f api/openshift/templates/build.yaml| oc apply -f -`

### Web

setup the s2i-caddy image as per:
https://github.com/bcgov/s2i-caddy-nodejs

`oc process -f web/openshift/templates/build.yaml -p SOURCE_IMAGE_NAMESPACE=\$(oc project --short) | oc apply -f -`

### Patroni

Build if you need a local image (defaults in this build have been changed to leverage postgres:12). Note the `oc create` instead of `oc apply`, this is to support multiple base image versions.

```bash
oc process -f openshift/templates/patroni-build.yaml | oc -n platform-registry-tools create -f -
```

### Backup-container

Rather than maintaining a custom build configuration, this build will leverage the [backup-container](https://bcdevops/backup-container) templates directly with default values.

```bash
oc process -f https://raw.githubusercontent.com/BCDevOps/backup-container/master/openshift/templates/backup/backup-build.json | \
  oc -n platform-registry-tools apply -f -
```

This will build a `latest` tagged image that can be integrated into the pipeline.

## Deploy

### Postgres Service

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

Once the postgres service has been deployed, add the helm repository for the published backup-container helm charts.

```bash
helm repo add bcgov https://bcgov.github.io/helm-charts
```

Modify ./openshift/backup/deploy-values.yaml and customize for the specific environment

- ensure `image.repository` and `image.tag` are updated per environment/deploy
- update `env.ENVIRONMENT_NAME.value` for the specific environment
- verify `persistence.backup.size` and `persistence.verification.size` are appropriately sized.

**Option 1: Deploy direct from helm:**

```bash
helm install db-backup bcgov/backup-storage -f ./openshift/backup/deploy-values.yaml
```

**Option 2: Generate manifest using helm, and then apply**

```bash
helm template db-backup bcgov/backup-storage -f ./openshift/backup/deploy-values.yaml > \
  ./openshift/backup/db-backup-deploy.yaml
oc apply -f ./openshift/backup/db-backup-deploy.yaml
```

### Application Services

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
