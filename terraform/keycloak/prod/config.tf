terraform {
  required_version = "1.15.8"

  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.9.0"
    }
  }
}

provider "keycloak" {
  realm         = "platform-services"
  client_id     = var.client_id
  client_secret = var.client_secret
  url           = var.url
  base_path     = var.base_path
}
