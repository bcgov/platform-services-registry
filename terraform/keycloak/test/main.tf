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
    "https://test-pltsvc.apps.silver.devops.gov.bc.ca/*"
  ]

  authentication_flow_binding_overrides {
    browser_id = data.keycloak_authentication_flow.idir_only.id
  }
}

data "keycloak_openid_client" "realm_management" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = "realm-management"
}

data "keycloak_role" "realm_admin" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = data.keycloak_openid_client.realm_management.id
  name      = "realm-admin"
}

resource "keycloak_openid_client" "pltsvc_admin_cli" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = "pltsvc-admin-cli"

  name    = "platform registry app admin CLI"
  enabled = true

  standard_flow_enabled        = false
  implicit_flow_enabled        = false
  direct_access_grants_enabled = false
  service_accounts_enabled     = true

  access_type = "CONFIDENTIAL"
}

resource "keycloak_openid_client_service_account_role" "pltsvc_admin_cli_realm_admin" {
  realm_id                = data.keycloak_realm.pltsvc.id
  service_account_user_id = keycloak_openid_client.pltsvc_admin_cli.service_account_user_id
  client_id               = data.keycloak_openid_client.realm_management.id
  role                    = data.keycloak_role.realm_admin.name
}
