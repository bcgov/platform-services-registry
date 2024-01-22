resource "sysdig_monitor_alert_metric" "test_pltsvc_db_pod_memory" {
  name        = "[Test] Registry MongoDB - Memory"
  description = "Test: Registry MongoDB pod is using 90% of the memory limit"
  severity    = 4
  enabled     = false

  metric                = "avg(max(sysdig_container_memory_limit_used_percent)) > 90"
  trigger_after_minutes = 60

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-test\") and kube_workload_name in (\"pltsvc-mongodb\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_metric" "test_pltsvc_db_pod_cpu" {
  name        = "[Test] Registry MongoDB - CPU"
  description = "Test: Any of Registry MongoDB pod is using more than 80% of limited CPU"
  severity    = 3
  enabled     = false

  metric                = "max(max(sysdig_container_cpu_cores_used_percent)) > 80"
  trigger_after_minutes = 60

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-test\") and kube_workload_name in (\"pltsvc-mongodb\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_metric" "test_pltsvc_app_pod_memory" {
  name        = "[Test] Registry App - Memory"
  description = "Test: Registry app pod is using 90% of the memory limit"
  severity    = 4
  enabled     = false

  metric                = "avg(max(sysdig_container_memory_limit_used_percent)) > 90"
  trigger_after_minutes = 60

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-test\") and kube_workload_name in (\"pltsvc-app\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_metric" "test_pltsvc_app_pod_cpu" {
  name        = "[Test] Registry App - CPU"
  description = "Test: Any of Registry App pod is using more than 80% of limited CPU"
  severity    = 3
  enabled     = false

  metric                = "max(max(sysdig_container_cpu_cores_used_percent)) > 80"
  trigger_after_minutes = 60

  scope                 = "kubernetes.cluster.name in (\"silver\") and kube_namespace_name in (\"101ed4-test\") and kube_workload_name in (\"pltsvc-app\")"
  multiple_alerts_by    = []
  notification_channels = [148742]

  custom_notification {
    title = "{{__alert_name__}} is {{__alert_status__}}"
  }
}
