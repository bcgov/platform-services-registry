## Registry CI/CD pipline setup.

Regsitry app has a full CI/CD pipline using GitHub Action and Argo CD. and its been hosted on **Silver** Cluster.

**CI**: [Github Action ](https://github.com/bcgov/platform-services-registry/actions) will trigger image build accordingly and commit to the [tenant-gitops-platform-registry](https://github.com/bcgov-c/tenant-gitops-platform-registry/tree/main/platform-registry-app) based on the target deployment environment(the job triggered).

**CD**: [ArgoCD resource](https://argocd-shared.apps.silver.devops.gov.bc.ca/applications?proj=&sync=&health=&namespace=&cluster=&labels=&search=platform-registry) is will compare the current deployment configration and the record we have in[tenant-gitops-platform-registry](https://github.com/bcgov-c/tenant-gitops-platform-registry/tree/main/platform-registry-app) and do the deploy the application accordingly.

### Environment has different usage

- [Dev](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-dev): Testing env for feature branch
- [Test](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-test): Testing env for main branch
- [Prod](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-prod): Production environment for user.

#### Usage of different env's pipeline

The pricinple for all environment is the same but the way how to trigger/use the pielines for each env are slightly different.

##### Dev

We are using s2i strategy for regsitry web and api, because it is used for testing feature branch, we will then target the source to the feature branch that you want to test in the BuildConfig in tools namespaces under for both web([platsrv-registry-web-dev-build](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-tools/buildconfigs/platsrv-registry-web-dev-build/yaml) ) and api([platsrv-registry-api-dev-build](https://console.apps.silver.devops.gov.bc.ca/k8s/ns/platform-registry-tools/buildconfigs/platsrv-registry-api-dev-build/yaml) ) under `spec.source.git.ref`(ie. update your branch name into that field). **DON'T FORGET TO SAVE YOUR CHANGE.**

Then you will need to manually trigger a new build in registry repo github action for both web([DEV Build and Tag - WEB](https://github.com/bcgov/platform-services-registry/actions/workflows/dev-web.yml)) and api([DEV Build and tag - API](https://github.com/bcgov/platform-services-registry/actions/workflows/dev-api.yml)) builds by clicking Run workflow on the right side of the page. (Normally you don't have to select branch, default is master branch unless you are testing your new github action branch).

Wait untill those images been build and tagged and commited the image hash tag to GitOps repository(all automated process).

Auto Sync policy in argocd [Dev instance](https://argocd-shared.apps.silver.devops.gov.bc.ca/applications/platform-registry-dev) has enabled, so argoCD will do a auto deployment once it detect that its `out of sync`. (if not, click refresh, because argocd don't scan resource on second base.) Once the current sync status becomes **Synced** again, your feature branch should have been deployed into Dev env.

##### Test

Test is much easier than Dev. Because it only deploy the code on main branch, and it will be triggered once there's any commits to master branch. Auto-Sync is enabled, once code gets merged, it should be deployed to test env in 5-15 mins. (You can check the building progress, or error in Registry repo Github Action)

##### Prod

After we have tested our feature works in Test and there's no concern, we can the deploy to prod.

This time we don't build image anymore, instead, we tag the image that we used for _test_ to _prod_. Its [GithubAction](https://github.com/bcgov/platform-services-registry/actions/workflows/promote_to_prod.yml) will happen automaticly when a release is happening.

Start a [new release](https://github.com/bcgov/platform-services-registry/releases/new) by create a new tag first. I'd suggest we follow the current tag pattern like v3.7.1 (Major.Minor.Patch). Then give this release a meanful title and description. Click publish release and wait until github action finish. Auto-sync is **NOT** been enable for prod in argoCD, so you will have to manually trigged it manually the ArgoCD [platform-registry-prod](https://argocd-shared.apps.silver.devops.gov.bc.ca/applications/platform-registry-prod). You are expecting an `out of sync` shown on the page.(if not, click refresh, because argocd desn't scan resources on second base.) Click **Sync => Synchronize** and chill. When the "current sync status" becomes _Synced_
again, means that your changes now are all in Prod env!
