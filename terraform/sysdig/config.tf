terraform {
  required_version = "1.13.1"

  backend "kubernetes" {
    namespace     = "101ed4-prod"
    secret_suffix = "sysdig" # pragma: allowlist secret
    config_path   = "~/.kube/config"
  }
}
