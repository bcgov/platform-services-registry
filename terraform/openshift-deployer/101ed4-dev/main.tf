module "oc_deployer" {
  source  = "bcgov/openshift/deployer"
  version = "0.11.0"

  name                  = "oc-deployer"
  namespace             = "101ed4-dev"
  privileged_namespaces = ["101ed4-dev"]
}
