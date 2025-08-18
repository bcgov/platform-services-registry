output "service_account_id" {
  description = "Service account ID"
  value       = kubernetes_service_account.this.id
}

output "service_account_secret_data" {
  description = "Service account secret data"
  value       = kubernetes_secret.this.data
}
