# Terraform Deployment for Sysdig

In order to implement `configuration as code` and simplify the provisioning of `Sysdig resources`, we leverage the capabilities of [Terraform](https://www.terraform.io/).

## Terraform Backend State

The Terraform state is securely stored within the project's namespace `101ed4-prod`, and the associated `secret` is prefixed with `sysdig`.

## Deployment Procedure

1. Log in to Openshift to gain access to the backend state:

   ```sh
   oc login --token=<token> --server=https://api.silver.devops.gov.bc.ca:6443
   ```

2. Initialize the working directory that contains the Terraform configuration files:
   ```sh
   terraform init
   ```
3. Preview the changes that Terraform intends to apply to your infrastructure:
   ```sh
   terraform plan
   ```
4. Execute the actions specified in the Terraform plan:
   ```sh
   terraform apply
   ```
