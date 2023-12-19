terraform {
  required_version = ">= 1.5.7"

  backend "kubernetes" {
    namespace     = "101ed4-tools"
    secret_suffix = "state" # pragma: allowlist secret
    config_path   = "~/.kube/config"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}
