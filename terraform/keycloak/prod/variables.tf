variable "client_id" {
  description = "The client_id for the Keycloak client in 'platform-services' Realm"
  default     = "realm-admin-cli"
  type        = string
}

variable "client_secret" {
  description = "The client_secret for the Keycloak client in 'platform-services' Realm"
  type        = string
  sensitive   = true
}

variable "url" {
  description = "The URL of the Keycloak instance"
  default     = "http://localhost:8080"
  type        = string
}

variable "base_path" {
  description = "The base path used for accessing the Keycloak REST API"
  default     = "/auth"
  type        = string
}
