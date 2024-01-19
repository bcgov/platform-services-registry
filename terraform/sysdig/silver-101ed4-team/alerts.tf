
resource "sysdig_monitor_alert_metric" "dev_pltsvc_db_pod_memory" {
  name        = "[DEV] Registry MongoDB - Memory"
  description = "DEV: Registry mongo pod is using 90% of the memory limit"
  severity    = 4
  enabled     = false

  metric                = "avg(max(sysdig_container_memory_limit_used_percent)) > 90.0"
  trigger_after_minutes = 60

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-dev\") and kube_workload_name in (\"pltsvc-mongodb\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}
