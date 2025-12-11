terraform {
  required_version = "1.14.2"

  required_providers {
    keycloak = {
      source  = "keycloak/keycloak"
      version = "5.5.0"
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
