terraform {
  required_version = "1.7.3"

  backend "kubernetes" {
    namespace     = "101ed4-dev"
    secret_suffix = "state" # pragma: allowlist secret
    config_path   = "~/.kube/config"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}
