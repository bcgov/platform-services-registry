## Registry CI/CD pipline setup.

Registry app has a full CI/CD pipeline using GitHub Actions and Argo CD. that is hosted on the **Silver** Cluster.

**CI**: [Github Action ](https://github.com/bcgov/platform-services-registry/actions) will trigger an image build accordingly and commit to [tenant-gitops-platform-registry](https://github.com/bcgov-c/tenant-gitops-platform-registry/tree/main/platform-registry-app) based on the target deployment environment (the job triggered).

**CD**: [ArgoCD resource](https://argocd-shared.apps.silver.devops.gov.bc.ca/applications?proj=&sync=&health=&namespace=&cluster=&labels=&search=platform-registry) will compare the current deployment configration and the record we have in[tenant-gitops-platform-registry](https://github.com/bcgov-c/tenant-gitops-platform-registry/tree/main/platform-registry-app) and deploy the application accordingly.

### Environments have different uses

- [Dev](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-dev): Testing env for feature branch
- [Test](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-test): Testing env for main branch
- [Prod](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-prod): Production environment for user.

#### Usage of different env's pipeline

The principle for all environments is the same, but the way to trigger/use the pipelines for each environment is slightly different.

##### Dev

We are using s2i strategy for registry web and API. Because it is used for testing a feature branch, we will then target the source to the feature branch that you want to test in the BuildConfig in the tools namespaces under for both web([platsrv-registry-web-dev-build](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-tools/buildconfigs/platsrv-registry-web-dev-build/yaml) ) and api([platsrv-registry-api-dev-build](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-tools/buildconfigs/platsrv-registry-api-dev-build/yaml) ) under `spec.source.git.ref`(ie. update your branch name into that field). **DON'T FORGET TO SAVE YOUR CHANGES.**

Then you will need to manually trigger a new build in registry repo GitHub action for both web([DEV Build and Tag - WEB](https://github.com/bcgov/platform-services-registry/actions/workflows/dev-web.yml)) and API ([DEV Build and tag - API](https://github.com/bcgov/platform-services-registry/actions/workflows/dev-api.yml)) builds by clicking run workflow on the right side of the page. (Normally you don't have to select a branch, the default is the master branch unless you are testing your new GitHub action branch).

Wait until those images have been built, tagged and committed to the image hashtag to the GitOps repository (all automated processes).

Auto Sync policy in argocd [Dev instance](https://argocd-shared.apps.silver.devops.gov.bc.ca/applications/platform-registry-dev) has been enabled, so argoCD will do an auto-deployment once it detects that it is `out of sync`. (if not, click refresh, because argocd does not scan the resource on second base.) Once the current sync status becomes **Synced** again, your feature branch should have been deployed into Dev env.

##### Test

Test is much easier than Dev. Because it only deploys the code on the main branch, it will be triggered once there are any commits to the master branch. Auto-Sync is enabled, once code gets merged, it should be deployed to test env in 5-15 mins. (You can check the building progress or error in Registry repo Github Action)

##### Prod

After we have tested that our feature works in Test and there's no concern, we can deploy to prod.

This time we do not build images, instead, we tag the image that we used for _test_ to _prod_. Its [GithubAction](https://github.com/bcgov/platform-services-registry/actions/workflows/promote_to_prod.yml) will happen automatically when a release is happening.

Start a [new release](https://github.com/bcgov/platform-services-registry/releases/new) by creating a new tag first. I'd suggest we follow the current tag pattern like v3.7.1 (Major.Minor.Patch). Then give this release a meaningful title and description. Click publish release and wait until github action finishes. Auto-sync has **NOT** been enabled for prod in argoCD, so you will have to trigger it manually in ArgoCD [platform-registry-prod](https://argocd-shared.apps.silver.devops.gov.bc.ca/applications/platform-registry-prod). You are expecting an `out of sync` shown on the page.(if not, click refresh, because argocd does not scan resources on second base.) Click **Sync => Synchronize** and chill. When the "current sync status" becomes _Synced_
again, your changes now are all in the Prod environment!

###### Verify Release

Once you've finished your release to prod, check that it was successful.
If your release included changes to the database schema, verify that those changes are reflected in the patroni instance on OpenShift. From https://console.apps.silver.devops.gov.bc.ca/topology/ns/platform-registry-prod, click on the registry-api pod, and access its terminal. Change the "Connecting to" option at the top of the terminal window from "registry-api" to "flyway-migration". The command ```flyway info``` will show the history and status of each migration that has taken place. The command may take a few moments. Your most recent one should be at the bottom of the list, with its current version number, and a status of "Success".

If your release does not appear, or its status is not good, see if the command ```flyway-migrate``` fixes things. 

To double check that schema changes you've made are present, click on the registry-patroni pod from the topology view. From the terminal, access the postgres database by typing ```psql -U postgres registry```. Make sure your change is there. For example if you added an entry to the ref-cluster table, try ```select * from ref_cluster;```, and make sure your new entry is there. 
