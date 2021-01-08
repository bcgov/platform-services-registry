## This is to document a plan to integrate flyway in prod env with zero downtime

all temporary artifacts will be created with a new app label name using flyway as SUFFIX

0. create new temporary nsp rules
this is so the new db and api service (to be created next) can talk to each other

```console
oc process -f temp_flyway_migration/nsp.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p DB_APO_IDENTIFIER="statefulset=registry-patroni-flyway" \
  -p FLYWAY_IDENTIFIER="openshift.io/deployer-pod.type=hook-pre" | \
  oc apply -f -
```

1. create a new temporary db service using the existing db secret

```console
oc process -f temp_flyway_migration/db-deploy.yaml | \
  oc apply -f -
```

2. create a new temporary api service using the existing api config, secrets and the same role label

```console
oc process -f temp_flyway_migration/api-deploy.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p SOURCE_IMAGE_NAMESPACE=${SOURCE_IMAGE_NAMESPACE} \
  -p SOURCE_IMAGE_TAG=${SOURCE_IMAGE_TAG} \
  -p CHES_BASEURL=${CHES_BASEURL} \
  -p CHES_SSO_TOKEN_URL=${CHES_SSO_TOKEN_URL} \
  -p NATS_HOST_URL=${NATS_HOST_URL} \
  -p APP_DB_NAME="registry" \
  -p FLYWAY_IMAGE_NAME="platsrv-registry-flyway" \
  -p FLYWAY_IMAGE_TAG=${FLYWAY_IMAGE_TAG}| \
  oc apply -f -
```

3. rsh inside the new db service, registry-patroni-flyway to make sure all schema tables are there and initial seeds (role names and cluster names) are planted as well

4. test from postman / curl on the ministry list on fetching the list of ministries to make sure new api route is working fine - avoid testing other api endpoints that require user authentication, as it will create user records upon successful requests

5. port forward to the EXISTING db and use a middle container to export seeds to file

```console
oc port-forward $(oc get pods -l 'app in (platsrv-registry), role in (master), statefulset in (registry-patroni)' | awk 'NR==2{print $1}') 5432:5432
```

```console
docker run -it --rm --name db_export_seeds -v $(pwd):/opt/src \
  --env PGPASSWORD=$(oc get secret registry-patroni-creds -o json | jq '[ .data | to_entries[] | select(.key=="superuser-password").value]' | jq '.[0]' | cut -d "\"" -f 2 | base64 -D) \
  postgres pg_dump -U postgres -h host.docker.internal -d registry -n public --data-only -f /opt/src/exported_data_flyway.dmp
```

6. port forward to the NEW db and use a middle container to import seeds

```console
oc port-forward $(oc get pods -l 'app in (platsrv-registry-flyway), role in (master), statefulset in (registry-patroni-flyway)' | awk 'NR==2{print $1}') 5432:5432
```

```console
docker run -it --rm --name db_import_seeds -v $(pwd):/opt/src \
  --env PGPASSWORD=$(oc get secret registry-patroni-creds -o json | jq '[ .data | to_entries[] | select(.key=="superuser-password").value]' | jq '.[0]' | cut -d "\"" -f 2 | base64 -D) \
  postgres psql -U postgres -d registry -h host.docker.internal -f /opt/src/exported_data_flyway.dmp
```

7. test from postman / curl make sure all endpoints are working fine from the new api route

if everything looks good, update the existing Route object `registry-web-to-api` so it routes to `registry-api-flyway`

8. test the whole flow to make sure everything is working - if there is any error, immediately roll back to using the previous api service from the step above

9. to have another back-up container pod that points to the NEW db, run
```console
oc process -f openshift/backup/backup-nsp.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p STATEFULSET_NAME="registry-patroni-flyway" \
  -p BACKUP_CONTAINER_IDENTIFIER="app:k8s:serviceaccountname=db-backup-flyway-backup-storage" \
  -p APP_LABEL_NAME="platsrv-registry-flyway" | \
  oc apply -f -
```

```console
oc apply -f temp_flyway_migration/rbac.temp.yaml -n $TOOLS_NAMESPACE
```

```console
helm repo add bcgov https://bcgov.github.io/helm-charts

helm install db-backup-flyway bcgov/backup-storage -f temp_flyway_migration/deploy-values.temp.yaml 
```

10. for the consistency of using the same app label name

we could then choose to update the original set and remove the temporary new set with the temporary app label

but do so when we are 100% confident the new set works with no issue

-----------------

to update the original set:

- update the existing nsp rules so the original set will work with the pre-hook container

```console
oc process -f platform-services-registry/openshift/templates/nsp.yaml \
  -p NAMESPACE=$(oc project --short) \
  -p DB_APO_IDENTIFIER="statefulset=registry-patroni" \
  -p NATS_NAMESPACE=${NATS_NAMESPACE} \
  -p NATS_APO_IDENTIFIER=$NATS_APO_IDENTIFIER} \
  -p FLYWAY_IDENTIFIER="openshift.io/deployer-pod.type=hook-pre" | \
  oc apply -f -
```

- sync the original db `registry-patroni` with data from `registry-patroni-flyway`

- update the existing Route object `registry-web-to-api` so it routes back to `registry-api`

to remove the temporary new set:

- delete all artifacts under new back-up

```console
helm uninstall db-backup-flyway
```

- delete temporary service account role bindings created for new back-up

```console
oc apply -f openshift/rbac.yaml -n $TOOLS_NAMESPACE
```

- delete temporary api, db etc. artifacts that were created with the new app label name

```console
oc delete all,nsp,en,pvc,sa,secret,role,rolebinding \
  -l "app=platsrv-registry-flyway"
```
