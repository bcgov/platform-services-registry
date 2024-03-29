resource "sysdig_monitor_alert_metric" "prod_pltsvc_db_pod_memory" {
  name        = "[Prod] Registry MongoDB - Memory"
  description = "Prod: Registry MongoDB pod is using 90% of the memory limit"
  severity    = 2
  enabled     = true

  metric                = "avg(avg(sysdig_container_memory_limit_used_percent)) > 90"
  trigger_after_minutes = 5

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-prod\") and kube_workload_name in (\"pltsvc-mongodb\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_metric" "prod_pltsvc_db_pod_cpu" {
  name        = "[Prod] Registry MongoDB - CPU"
  description = "Prod: Any of Registry MongoDB pod is using more than 80% of limited CPU"
  severity    = 2
  enabled     = true

  metric                = "avg(avg(sysdig_container_cpu_cores_used_percent)) > 80"
  trigger_after_minutes = 5

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-prod\") and kube_workload_name in (\"pltsvc-mongodb\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_metric" "prod_pltsvc_app_pod_memory" {
  name        = "[Prod] Registry App - Memory"
  description = "Prod: Registry app pod is using 90% of the memory limit"
  severity    = 2
  enabled     = true

  metric                = "avg(avg(sysdig_container_memory_limit_used_percent)) > 90"
  trigger_after_minutes = 5

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-prod\") and kube_workload_name in (\"pltsvc-app\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_metric" "prod_pltsvc_app_pod_cpu" {
  name        = "[Prod] Registry App - CPU"
  description = "Prod: Any of Registry App pod is using more than 80% of limited CPU"
  severity    = 2
  enabled     = true

  metric                = "avg(avg(sysdig_container_cpu_cores_used_percent)) > 80"
  trigger_after_minutes = 5

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-prod\") and kube_workload_name in (\"pltsvc-app\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}
