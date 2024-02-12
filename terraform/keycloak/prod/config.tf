terraform {
  required_version = "1.7.3"

  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = "4.4.0"
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
