resource "keycloak_role" "pltsvc_admin" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "admin"
  description = "Registry Administrator"
}

resource "keycloak_role" "pltsvc_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "reader"
  description = "Registry Read-Only"
}

resource "keycloak_role" "pltsvc_private_admin" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "private-admin"
  description = "Registry Public Cloud Administrator"
}

resource "keycloak_role" "pltsvc_private_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "private-reader"
  description = "Registry Public Cloud Read-Only"
}

resource "keycloak_role" "pltsvc_approver" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "approver"
  description = "Registry Approver"
}
