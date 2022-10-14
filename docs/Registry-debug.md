Some bug/issue for Registry that you might see in production env:

### User can not login to dashboard: a user can log in, sees their dashboard momentarily, and then gets logged out back to /public-landing?redirect=/dashboard

This is related to a pull request that [Block github keycloak token](https://github.com/bcgov/platform-services-registry/pull/665/files).
Normally there are two reasons(or maybe three) that lead this issue:

1. User is loged into the same realm with their github account, while the GitHub session still exist, they are trying to login to Registry.

- To solve this situation, we just need them to completely loged out once, or to use other browser.

2. User's keyclock account have GitHub identity links.

- To identify if is this case, we need to find user profile in https://oidc.gov.bc.ca/auth/admin/devhub/console/#/realms/devhub/users.

- In their user page, selete **Identity Provider Links** tab and observe if there's a github account that linked to this account. If yes, remove it.

3. User only have one GitHub KeyCloack account and that one have their gov email binded so when they loged in with IDIR, KeyCloack always consider them login as GitHub.

- This case is really easy to identify, they in keycloack [user page](https://oidc.gov.bc.ca/auth/admin/devhub/console/#/realms/devhub/users), their idir user profile have github suffix.

- To solve this issue is also easy, delete this user profile and let them login back again to recreate their account with idir.

### Project stuck in pending edit or approved status:

Under this situation, user are not able to update registry product. And there are serval reason that can lead this happen except registry internal bug

Normally provisioner url is been disabled, you can enable it by updating its route from `argo-server-DISABLE` to `argo-server`. And please remmber to disbale it again once you finish using provisioner because it doesn't have authentification.

1.  provisioner job failed or not finished. look into provisioner workflow and you will find a red entry that shows the fail job. A failed job means provisioner has logic issue and provisioner repo is here: https://github.com/bcgov-c/devops-fulfillment-pipeline

2.  provisioner job successed, but pr is not been auto merged in request [repos](https://github.com/BC-Gov-PaaS-Platform-Services)(each cluster has it own repo).

in this case, we just need to manually merge the pull request and make sure the triggered github action finished for that project.

3.  provisioner did not recieve the request at all. Reason coule be vary, but we can debug/unblock the team by :

    - 1.  maunally cancle their last request and let them send out request again while we observe registry closely. The way to do this is through db change, so please **back up db** before any change happens.

          This method can also be use when provisioner is doing some test and development and unable to successfully send out pull request. Here's how to do it:

                    ```
                    oc -n platform-registry-prod rsh registry-patroni-0
                    psql -U postgres -W registry

                    superuser-password is in https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-prod/secrets/registry-patroni-creds

                    select * from request where profile_id={profile_ID} and is_active=true;
                    ```

                find the latest request ID with that profile

                ```
                    update request set is_active=false where id={request_ID};

                    update profile set profile_status='provisioned' where id={request_ID};
                ```

    - 2. (**IMPORTANT**) Run a **sync pending** task on registry for cluster.
         This will find which project that is stucked at pending Edit/approval status and run the provisioner job for them again.

         Document can be found in here: https://github.com/bcgov-c/platform-services-docs/blob/b1b16f3c2a1483bb87d4b0e94467027055405583/provisioner/provisioner_management.md#manually-sync-pending-requests.

4.  Ocassionaly Github action that send callback to registry will failed. In this case, the request repo already have the update.

    So even if you re-run the provisioner task, the pr won't able to be made because there's no difference bewteen the pr and the master branch. So that the project will also stucked at approval status.

    - To solve this issue, we can send a pr to manually change that product in repo a little bit and let provisioner re-run the task(By click re-submit on provisioner UI, or run a `sync pending` to that cluster) **OR**
    - (not recommand) We will need to maunally mark this project as provisioned just like upon mentioned (**REMEMBER TO BACKUP DB**).

### Registry failed to load the dashboard

Its a front-end logic bug that needs to be fixed, it basically means that dashboard don't have any income data.

1. check if api pod ran normally

   - if not, check the log and events tab to fix the issue. Rocketchat Channel Devops-howto is a good place to ask those question.

2. check if database pod run normally

   - check if migration script run successfully.(https://github.com/bcgov/platform-services-registry/blob/0d05d9013d1bf9f87b1980a5c14065f484bf1ac8/openshift/README.md#verify-release)

   - check if database have any data, if not, recover data from lasted backup using `backup-container`.

### Registry need cluster wide update

This will happen if we want to add some new configuration to applied to all namespaces, please follow this instruction: https://github.com/bcgov-c/platform-services-docs/blob/b1b16f3c2a1483bb87d4b0e94467027055405583/provisioner/provisioner_management.md#manually-sync-all-project-sets
