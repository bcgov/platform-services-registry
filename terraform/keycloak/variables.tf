# KEYCLOAK_DEV
variable "dev_client_id" {
  description = "The client_id for the Dev Keycloak client in 'platform-services' Realm"
  default     = "realm-admin-cli"
  type        = string
}

variable "dev_client_secret" {
  description = "The client_secret for the Dev Keycloak client in 'platform-services' Realm"
  type        = string
  sensitive   = true
}

# KEYCLOAK_TEST
variable "test_client_id" {
  description = "The client_id for the Test Keycloak client in 'platform-services' Realm"
  default     = "realm-admin-cli"
  type        = string
}

variable "test_client_secret" {
  description = "The client_secret for the Test Keycloak client in 'platform-services' Realm"
  type        = string
  sensitive   = true
}

# KEYCLOAK_PROD
variable "prod_client_id" {
  description = "The client_id for the Test Keycloak client in 'platform-services' Realm"
  default     = "realm-admin-cli"
  type        = string
}

variable "prod_client_secret" {
  description = "The client_secret for the Test Keycloak client in 'platform-services' Realm"
  type        = string
  sensitive   = true
}
