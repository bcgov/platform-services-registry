# Terraform Configuration for Infrastructure Provisioning

We employ `Terraform` as the `configuration code` to `provision resources` within our infrastructure, encompassing `OCP Deployer Service Accounts`, `Keycloak`, and `Sysdig`.

## Sysdig

The main point for the `Sysdig Terraform` is situated at [terraform/sysdig](../terraform/sysdig), featuring individual sub-modules for each Openshift project.

### Local Machine Modifications

For making changes on a local machine, please consult the [Sysdig Terraform Readme](../terraform/sysdig/README.md) for comprehensive instructions.

### CD Pipeline-driven Modifications

The Sysdig Terraform scripts are integrated into the `Continuous Deployment (CD) pipeline`, specifically the [Sysdig Terraform Action](../.github/workflows/terraform-sysdig.yml).
The process involves two distinct phases:

1. PR creation
   Upon the `creation of a pull request` that includes changes to the Sysdig Terraform script, the pipeline executes a `Terraform Plan` and comments on the PR regarding the proposed alterations.

2. PR merging
   Upon approval and `merging of the pull request`, the pipeline executes a `Terraform Apply`, implementing the approved changes into the infrastructure.
