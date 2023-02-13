# Updates Required for Switch to New Registry App

When the new version of the registry app is made live, some updates will be required for the provisioner.

## Registry callback
Each cluster has a Git repository for project set information.  These are the repos that contain the namespace-related manifests that are managed by the registry and provisioner.  Each of these repos has a GitHub Action that calls a registry API when a change has been pushed to the main branch, such as at the end of a provisioner workflow run.

* In each workflow, remove the step that makes the callback to the old registry app, leaving the callback to the new registry app.
* Zenhub: 3396

## Update sensors
Each cluster has an Argo Events Sensor that defines the workflows for the given cluster.

* Update the `app-provisioner` image tag for each sensor, changing the tag to `v4.0.0`
* See: https://github.com/bcgov-c/tenant-gitops-platform-provisioner/blob/main/tools/sensor.nats-registry-prod.yaml
* Note that with the change to IDIR-based access rules, app-provisioner is transitioning from v3 to v4.

## Merge branch
The code changes for 'app-provisioner' are in a feature branch.  Merge this branch into 'master'.
* In the 'devops-fulfillment-pipeline' repo, merge `feature/change_to_idir` into `master`
* https://github.com/bcgov-c/devops-fulfillment-pipeline/pull/143

## Update Route
The Route 'registry.developer.gov.bc.ca' must be created in the new registry's prod namespace and removed from the old 'platform-registry-prod' namespace.  Note that it uses a Certbot certificate and a change will be required for that.
* Configure the Route in `101ed4-prod`
* Delete the Route in `platform-registry-prod`

