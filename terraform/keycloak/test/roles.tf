resource "keycloak_role" "pltsvc_admin" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "admin"
  description = "Registry Administrator"
}

resource "keycloak_role" "pltsvc_editor" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "editor"
  description = "Registry Editor"
}

resource "keycloak_role" "pltsvc_analyzer" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "analyzer"
  description = "Registry Analyzer"
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
  description = "Registry Private Cloud Administrator"
}

resource "keycloak_role" "pltsvc_private_analyzer" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "private-analyzer"
  description = "Registry Private Cloud Analyzer"
}

resource "keycloak_role" "pltsvc_private_editor" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "private-editor"
  description = "Registry Private Cloud Editor"
}

resource "keycloak_role" "pltsvc_private_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "private-reader"
  description = "Registry Private Cloud Read-Only"
}

resource "keycloak_role" "pltsvc_public_admin" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "public-admin"
  description = "Registry Public Cloud Administrator"
}

resource "keycloak_role" "pltsvc_public_analyzer" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "public-analyzer"
  description = "Registry Public Cloud Analyzer"
}

resource "keycloak_role" "pltsvc_public_editor" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "public-editor"
  description = "Registry Public Cloud Editor"
}

resource "keycloak_role" "pltsvc_public_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "public-reader"
  description = "Registry Public Cloud Read-Only"
}

resource "keycloak_role" "pltsvc_billing_reviewer" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "billing-reviewer"
  description = "Registry Billing Reviewer"
}

resource "keycloak_role" "pltsvc_billing_manager" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "billing-manager"
  description = "Registry Billing Manager"
}

resource "keycloak_role" "pltsvc_billing_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "billing-reader"
  description = "Registry Billing Reader"
}

resource "keycloak_role" "pltsvc_finance_manager" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "finance-manager"
  description = "Registry Finance Manager"
}

resource "keycloak_role" "pltsvc_private_reviewer" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "private-reviewer"
  description = "Registry Private Reviewer"
}

resource "keycloak_role" "pltsvc_public_reviewer" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "public-reviewer"
  description = "Registry Public Reviewer"
}

resource "keycloak_role" "pltsvc_user_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "user-reader"
  description = "Registry User Reader"
}

resource "keycloak_role" "pltsvc_task_reader" {
  realm_id  = data.keycloak_realm.pltsvc.id
  client_id = keycloak_openid_client.pltsvc.id

  name        = "task-reader"
  description = "Registry Task Reader"
}
