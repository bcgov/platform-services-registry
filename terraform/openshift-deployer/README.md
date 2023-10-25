# Openshift Deployment with Terraform

In order to implement `configuration as code` and streamline the process of creating an Openshift service account token for `GitHub Actions` to deploy k8s resources on an Openshift cluster, we utilize a tool called [Terraform](https://www.terraform.io/).

## Procedure

1. Initialize the working directory that contains the Terraform configuration files:
   ```sh
   terraform init
   ```
2. Preview the changes that Terraform intends to apply to your infrastructure:
   ```sh
   terraform plan
   ```
3. Execute the actions specified in the Terraform plan:
   ```sh
   terraform apply
   ```
