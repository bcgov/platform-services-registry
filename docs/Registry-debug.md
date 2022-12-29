Some bug/issues for Registry that you might see in production env:

### Backup database:

Registry is using backup-container to do database backup cronjob and we can also restore backup from there. Please read through this [documentataion](https://github.com/BCDevOps/backup-container#using-the-backup-script) of how to use backup-container.

Example command to restore from backup:

```
./backup.sh -r registry-patroni-master:5432/registry -f /backups/daily/2022-09-20/registry-patroni-master-registry_******.sql.gz
```

This is required super-admin password for DB, you can find it in https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-prod/secrets/registry-patroni-creds

### User can not log in to dashboard: a user can log in, sees their dashboard momentarily, and then get logged out back to /public-landing?redirect=/dashboard

This is related to a pull request that [Block GitHub keycloak token](https://github.com/bcgov/platform-services-registry/pull/665/files).
Normally there are two reasons(or maybe three) that lead to this issue:

1. User is logged into the same realm with their GitHub account, while the GitHub session still exists, they are trying to log in to Registry.

- To solve this situation, we just need them to completely log out once, or use another browser.

2. User's keycloack account has GitHub identity links.

- To identify if the issue is in this case, we need to find the user profile at https://oidc.gov.bc.ca/auth/admin/devhub/console/#/realms/devhub/users.

- In their user page, select **Identity Provider Links** tab and observe if there's a GitHub account that is linked to this account. If yes, remove it.

3. User only has one GitHub KeyCloack account and that one has their gov email bound so when they log in with IDIR, KeyCloack always consider them to log in as GitHub.

- This case is really easy to identify, they are in keycloack [user page](https://oidc.gov.bc.ca/auth/admin/devhub/console/#/realms/devhub/users), and their idir user profile has a GitHub suffix.

- To solve this issue is also easy, delete this user profile and let them login back again to recreate their account with idir.

### Project stuck in pending edit or approved status:

Under this situation, users are not able to update the registry product. And there are serval reasons that can lead this to happen except the registry internal bug

Normally provisioner URL is been disabled, you can enable it by updating its route from `Argo-server-DISABLE` to `Argo-server`. And please remember to disable it again once you finish using Provisioner because it doesn't have authentification.

1.  provisioner job failed or not finished. look into the provisioner workflow and you will find a red entry that shows the failed job. A failed job means the provisioner has a logic issue and provisioner repo is here: https://github.com/bcgov-c/devops-fulfillment-pipeline

2.  provisioner job success, but pr is not been auto merged in request [repos](https://github.com/BC-Gov-PaaS-Platform-Services)(each cluster has its repo).

in this case, we just need to manually merge the pull request and make sure the triggered github action is finished for that project.

3.  provisioner did not receive the request at all. The reason could be vary, but we can debug/unblock the team by :

    - 1.  manually cancel their last request and let them send out the request again while we observe the registry closely. The way to do this is through DB change, so please **back up DB** before any change happens.

          This method can also be used when the provisioner is doing some testing and development and is unable to successfully send out a pull request. Here's how to do it:

                    ```
                    oc -n platform-registry-prod rsh registry-patroni-0
                    psql -U postgres -W registry

                    superuser-password is in https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-prod/secrets/registry-patroni-creds

                    select * from request where profile_id={profile_ID} and is_active=true;
                    ```

                find the latest request ID with that profile

                ```
                    update request set is_active=false where id={reques_ID};

                    update profile set profile_status='provisioned' where id={request_ID};
                ```

    - 2. (**IMPORTANT**) Run a **sync pending** task on the registry for the cluster.
         This will find which project is stuck at pending Edit/approval status and run the provisioner job for them again.

         The document can be found here: https://github.com/bcgov-c/platform-services-docs/blob/main/provisioner/provisioner_management.md#manually-sync-pending-requests.

4.  Occasionally Github action that sends the callback to the registry will fail. In this case, the request repo already has the update.

    So even if you re-run the provisioner task, the pr won't able to be made because there's no difference between the pr and the master branch. So that the project will also be stuck at approval status.

    - To solve this issue, we can send a pr to manually change that product in the repo a little bit and let provisioner re-run the task(By clicking re-submit on provisioner UI, or running a `sync pending` to that cluster) **OR**
    - (not recommended) We will need to manually mark this project as provisioned just like upon mentioned (**REMEMBER TO BACKUP DB**).

### Registry failed to load the dashboard

It's a front-end logic bug that needs to be fixed, it basically means that the dashboard doesn't have any income data.

1. check if api pod ran normally

   - if not, check the log and events tab to fix the issue. Rocket chat Channel Devops-howto is a good place to ask those questions.

2. check if the database pod runs normally

   - check if the migration script runs successfully. (https://github.com/bcgov/platform-services-registry/blob/master/openshift/README.md#verify-release)

   - check if the database has any data, if not, recover data from lasted backup using `backup-container`.

### Registry needs cluster wide update

This will happen if we want to add some new configuration to apply to all namespaces, please follow this instruction: https://github.com/bcgov-c/platform-services-docs/blob/main/provisioner/provisioner_management.md#manually-sync-all-project-sets

### Copy production db to local:

In project environment that you want to copy db from

```
oc exec registry-patroni-0 -- bash -c 'pg_dump registry >  ~/backup/registry.sql'
```

Create a folder to put the backup file:

```
mkdir ~/databaseBackup
```

Copy it over from pod:

```
oc rsync registry-patroni-0:/home/postgres/backup/registry.sql ~/databaseBackup/
```

Apply file in docker’s db. Make sure remove and mkdir `pg_data` in app root:
In docker db shell, run:

```
dropdb -U postgres registry
createdb -U postgres registry
```

Now, apply the backup dumpfile back to db in docker, run this in your localhost terminal(PS: may need to make sure to create a new user for local dev or change local env variable to be the same from where you copy the db):

```
cd  ~/databaseBackup
cat registry.sql | docker exec -i registry-pg psql -U postgres registry
```

If you registry db user don't have access to this new db that gets created from dump, you will need to grant it access by run this cmd in docker registry_pg cmd:

```
 GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO <YOUR_LOCAL_REGISTRY_DB_USERNAME>;
```

And you should be all set
