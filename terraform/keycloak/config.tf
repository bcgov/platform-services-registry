terraform {
  required_version = "1.7.3"

  backend "kubernetes" {
    namespace     = "101ed4-prod"
    secret_suffix = "keycloak" # pragma: allowlist secret
    config_path   = "~/.kube/config"
  }

  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "4.4.0"
    }
  }
}
