# Project Set Resources

The Platform Services Registry is used to create profiles for teams. Each profile is a collection of details that desribe a Project Set. At this time, Profiles are limited to OpenShift Project Sets.

> **Note**: As of March 3rd, All resources name are prefixed with `platform-services-controlled-` with the Exclusion of Quotas and the ArtifactoryServiceAccount which still has the name `default`. This resource will be updated when the Archiobot (BCGov Artifactory Operator) can support renaming the ArtifactoryServiceAccount without disruptions to tenants.

## OpenShift Project Sets

Each OpenShift Project Set comes with a license plate used to identify the Project and four environments (tools, dev, test,prod). THe license plate is combined with each environment to create four OpenShift Namespaces - `<licensePlate>-<environment>`.

For Example: (license plate - `1a2b3c`)
- **Namespaces:**
  - `1a2b3c-tools`
  - `1a2b3c-dev`
  - `1a2b3c-test`
  - `1a2b3c-prod`

### Labels

> Note: Values that start with `$` are sourced from the Registry API/Database

All tenant accessible resources are tagged with the following labels:

```yaml
labels:
  environment: $ENV
  name: $LICENSE_PLATE
  profile_id: $INTERNAL_REGISTRY_PROFILE_ID
  project_type: user
  provisioned-by: argocd
  quota: $QUOTA_TSHIRT_SIZE
  # The following label is inserted at apply by ArgoCD
  #  and is another way to identify resources created
  #  through our GitOps Provisioning Pipeline
  devops.gov.bc.ca/argocd-app: $LICENSE_PLATE
```

It's also worth noting that namespaces have the following annotations:

```yaml
annotations:
  openshift.io/description: $DESCRIPTION
  openshift.io/display-name: $DISPLAY_NAME ($ENV)
  openshift.io/requester: "application-registry"
  product-owner: $PRODUCT_OWNER_EMAIL
  technical-lead: $TECHNICAL_CONTACT_EMAIL
```

### Common Resources

- **Role Bindings**

  Each environment has a single Role Binding applied to it consisting of the Product Owner, Technical Contact, and the BCDevOps-Admin Service Account. Prior to March 3rd this Role Binding was named `admin`, it is now named `platform-services-controlled-admin`

  In order to edit this Role Binding you must update the details for your Project Set within the Registry Web UI.

- **Quotas**

  Quotas and Limits are applied to each namespace based on the T-Shirt Size Requested from the Registry Web UI. The Default is `small`

- **PodInjectSelector**

  > Note: This is an Aporeto specific feature that will be removed when Aporeto is removed.

  The PodInjectorSelector is applied in all environments and gives teams the ability to force their pod to wait until the network is completely up and available before starting the primary container within the pod.

  Teams can use this by adding a `zero-trust-first: 'true'` label to their pods. This will tell the Aporeto Operator to inject an init container that will prevent the pod from starting the primary container until it gets the `OK` from the Aporeto Enforcer API.

### Tools Environment Specific Resources

- **PodInjectorSelector**

  The **tools** environment has the `zero-trust-first` PodInjectorSelector but it also has another one that is specific to builds and is enabled by default. This prevents builds from failing at start up.

- **Build Entitlements**

  The **tools** environment comes with a set of secrets and configmaps for using the Red Hat Subscription manager within builds to install RedHat specific packages that are not normally available without a subscription.

  Please see this [issue](https://github.com/BCDevOps/OpenShift4-Migration/issues/15) for additional information on build entitements and how to use them. (Check the Secret and ConfigMaps within the namespace and match accordingly)

- **ArtifactoryServiceAccount**

  Please See the [Artifactory Documentation on DevHub](https://developer.gov.bc.ca/Artifact-Repositories-(Artifactory)) for details

### Dev Environment Specific Resources

- **NetworkPolicy**

  As of March 3rd, the **dev** environment now includes a default-deny NetworkPolicy that blocks all communication within the namespace until additional Network Policies are created to open up the desired communication channels. (Between Pods, Other Namespaces, Ingress from Routes, etc)

  Additional Information on the move from Aporeto NetworkSecurityPolicies to OpenShift / Kubernetes Network Policies including the environment cut-over schedule can be found [here](https://github.com/BCDevOps/developer-experience/issues/902).

  A Quick Start Guide for transitioning from Aporeto Network Security Policies to OpenShift / Kubernetes can be found [here](https://github.com/bcgov/networkpolicy-migration-workshop).
