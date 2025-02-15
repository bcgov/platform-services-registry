terraform {
  required_version = "1.10.5"

  backend "kubernetes" {
    namespace     = "101ed4-test"
    secret_suffix = "state" # pragma: allowlist secret
    config_path   = "~/.kube/config"
  }
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}
