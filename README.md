# Platform Services Registry

The Platform Services' Project Registry is a single entry point for the Platform Service intake process. It is where teams can submit requests for provisioning namespaces in OpenShift 4 (OCP4) clusters, as well as perform other tasks such as:
* Update project contact details and other metadata;
* Request their project namespace set be created additional clusters;
* Request other resources be provisioned such as KeyCloak realms or Artifactory pull-through repositories.

## TL;DR

This repo contains all the components for the Platform Service Registry as well as all the OpenShift 4.x manifests to build and deploy said project. You can find more about each component here:
* [Web](./web/README.md);
* [API](./api/README.md); and
* [Database](./db/README.md)

## Project Structure

Find anything relevant to the project as a whole in the repo root such as OCP4 manifests; docker compose file; and development configuration. Each of the three main components to the project are listed below and have their own build and deployment documentation:

* [Web](./web/README.md);
* [API](./api/README.md); and
* [Database](./db/README.md)

## Architecture

The registry is a typical web app with an API backed by persistent storage. This serves to provide an interface for humans and automations alike, and, persist the data in a reliable way. Beyond this, the registry utilizes [NATS](https://nats.io/) to send message to "smart robots" that perform tasks outside of its scope.

These smart robots include:

| Name                   | Repo | Description | 
| :--------------------- | :--- | :-----------|
| Namespace Provisioning | [here](https://github.com/bcgov-c/devops-fulfillment-pipeline) |This automation implements a GitOps approach to provisioning a namespace set with quotas and various service accounts on our clusters | 

## How to Build & Deploy

There are lots of moving parts in the registry even though its a relatively simple web app. Each section below will walk you through the parameters and commands needed to deploy.

### Role Based Access Control (RBAC)

Assuming you are building both the Patroni and Backup images in an OCP `tools` namespace, you will need some RBAC to pull said images from tools to your other namespaces for deployment. Read, then run, the RBAC manifest located [here](./openshift/rbac.yaml). It will enough access for the image puller to do its job.

```console
oc apply -f openshift/rbac.yaml
```

### Network Security Policy(ies)

As of OCP4 Network Service Policy (NSP) is required to allow all the components (Web, API, DB, and SSO) to communicate. In each of the Web, API and DB deployment manifests there will be a label to uniquely identify each component by `roll`; for the Patroni database there will be a unique characteristic to identify any pod that is part of the cluster. These are used in the NSP to enable communication.

In the `tools` namespace run this NSP to allow the build to pull resources form the internet:

```console
oc process -f openshift/templates/nsp-tools.yaml \
  -p NAMESPACE=$(oc project --short) | \
  oc apply -f -
```

Then, in each of the other namespaces run the application specific NSP. It will allow each component to talk to one another as necessary.

```console
oc process -f openshift/templates/nsp.yaml \
  -p NAMESPACE=$(oc project --short) | \
  oc apply -f -
```

### Database

The build and deploy documents for PostgreSQL (Patroni) are located in the [db](./db) directory of this project.

### Database Backup Container (Prod Only)

The community supported backup container is used to backup the database. Setup the database container using the helm charts:

```console
helm repo add bcgov https://bcgov.github.io/helm-charts

helm install db-backup bcgov/backup-storage -f ./openshift/backup/deploy-values.yaml
```

### API

The build and deploy documents for the API are located in the [api](./api) directory of this project.

### Web

The build and deploy documents for the Web are located in the [web](./web) directory of this project.

### NATS (Dev & Test Only)

The API needs to connect to [NATS](https://nats.io) for messaging the "smart robots". In production a shared NATS exists, however, in dev and test there no such thing exists, so we fire up a stand alone NATS instance to accept message from the API.

Deploy a stand alone, single Pod instance of NATS with the DeploymentConfig provided. Provide its service to the API when deployed so it can find and use this service.

```console
oc process -f openshift/templates/nats.yaml
```

## Project Status / Goals / Roadmap

Additional features and fixes can be found in backlog; find it under issues in this repo.

## Getting Help or Reporting an Issue

If you find issues with this application suite please create an [issue](https://github.com/bcgov/secure-image-app/issues) describing the problem in detail.

## How to Contribute

Contributions are welcome. Please ensure they relate to an issue. See our 
[Code of Conduct](./CODE-OF-CONDUCT.md) that is included with this repo for important details on contributing to Government of British Columbia projects. 

## License

See the included [LICENSE](./LICENSE) file.









--------------------------------------------------------------------------



## Build



 9859  helm uninstall db-backup 
 9860  helm install db-backup bcgov/backup-storage -f ./openshift/backup/deploy-values.yaml

oc process -f openshift/templates/nsp.yaml -p NAMESPACE=$(oc project --short) -p NATS_NAMESPACE="platform-provisioner-dev" -p NATS_APO_IDENTIFIER="app=nats"| oc apply -f -


### Patroni

Build if you need a local image (defaults in this build have been changed to leverage postgres:12). Note the `oc create` instead of `oc apply`, this is to support multiple base image versions.

`oc process -f openshift/templates/patroni-build.yaml | oc -n platform-registry-tools create -f -`

## Deploy

NOTES:
cleanup
oc delete all,pvc,sa,secret,role,rolebinding -l "app=platsrv-registry"

➜  platform-services-registry git:(master) ✗ oc process -f openshift/templates/nsp.yaml -p NAMESPACE=$(oc project --short) | oc apply -f -
networksecuritypolicy.security.devops.gov.bc.ca/api-to-db created
networksecuritypolicy.security.devops.gov.bc.ca/frontend-to-api created
networksecuritypolicy.security.devops.gov.bc.ca/api-to-nats created
networksecuritypolicy.security.devops.gov.bc.ca/db-to-db created
➜  platform-services-registry git:(master) ✗ 

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
