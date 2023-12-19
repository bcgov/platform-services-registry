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

resource "keycloak_role" "pltsvc_ministry_citz_admin" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-citz-admin"
  description = "Ministry CITZ Administrator"
}

resource "keycloak_role" "pltsvc_ministry_citz_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-citz-reader"
  description = "Ministry CITZ Read-Only"
}

resource "keycloak_role" "pltsvc_ministry_hlth_admin" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-hlth-admin"
  description = "Ministry HLTH Administrator"
}

resource "keycloak_role" "pltsvc_ministry_hlth_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-hlth-reader"
  description = "Ministry HLTH Read-Only"
}
