terraform {
  required_version = "1.13.1"

  backend "kubernetes" {
    namespace     = "101ed4-prod"
    secret_suffix = "keycloak" # pragma: allowlist secret
    config_path   = "~/.kube/config"
  }

  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.4.0"
    }
  }
}
