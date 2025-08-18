module "oc_deployer" {
  source = "../_module"

  name                  = "oc-deployer"
  namespace             = "101ed4-test"
  privileged_namespaces = ["101ed4-test"]
}

output "service_account_id" {
  value = module.oc_deployer.service_account_id
}
