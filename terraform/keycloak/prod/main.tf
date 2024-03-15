data "keycloak_realm" "pltsvc" {
  realm = "platform-services"
}

data "keycloak_authentication_flow" "idir_only" {
  realm_id = data.keycloak_realm.pltsvc.id
  alias    = "browser - idir - only"
}

resource "keycloak_openid_client" "pltsvc" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = "pltsvc"

  name    = "platform registry app"
  enabled = true

  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = false

  access_type = "CONFIDENTIAL"
  valid_redirect_uris = [
    "https://pltsvc.apps.silver.devops.gov.bc.ca/*",
    "https://registry.developer.gov.bc.ca/*"
  ]

  authentication_flow_binding_overrides {
    browser_id = data.keycloak_authentication_flow.idir_only.id
  }
}
