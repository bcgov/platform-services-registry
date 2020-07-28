![Test & Build](https://github.com/bcgov/platform-services-registry/workflows/Test%20&%20Build/badge.svg)
[![Maintainability](https://api.codeclimate.com/v1/badges/95db366ef76313d5d4eb/maintainability)](https://codeclimate.com/github/bcgov/platform-services-registry/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/95db366ef76313d5d4eb/test_coverage)](https://codeclimate.com/github/bcgov/platform-services-registry/test_coverage)


# platform-services-registry
Platform services OCP project registry

## Build

# API
oc process -f api/openshift/templates/build.yaml| oc apply -f -

# Web

setup the s2i-caddy image as per:
https://github.com/bcgov/s2i-caddy-nodejs


oc process -f web/openshift/templates/build.yaml -p SOURCE_IMAGE_NAMESPACE=$(oc project --short) | oc apply -f -

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

