terraform {
  required_version = "1.14.6"

  backend "kubernetes" {
    namespace     = "101ed4-prod"
    secret_suffix = "sysdig" # pragma: allowlist secret
    config_path   = "~/.kube/config"
  }
}
