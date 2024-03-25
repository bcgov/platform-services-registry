locals {
  ministry_codes = ["ag", "pssg", "embc", "hous"]
}

resource "keycloak_role" "pltsvc_ministry_editor" {
  for_each  = toset(local.ministry_codes)
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-${each.value}-editor"
  description = "Ministry ${each.value} Editor"
}

resource "keycloak_role" "pltsvc_ministry_reader" {
  for_each  = toset(local.ministry_codes)
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "ministry-${each.value}-reader"
  description = "Ministry ${each.value} Read-Only"
}
