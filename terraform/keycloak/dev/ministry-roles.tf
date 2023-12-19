locals {
  ministry_codes = ["citz", "hlth"]
}

resource "keycloak_role" "pltsvc_ministry_admin" {
  for_each  = toset(local.ministry_codes)
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-${each.value}-admin"
  description = "Ministry ${each.value} Administrator"
}

resource "keycloak_role" "pltsvc_ministry_reader" {
  for_each  = toset(local.ministry_codes)
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-${each.value}-reader"
  description = "Ministry ${each.value} Read-Only"
}
