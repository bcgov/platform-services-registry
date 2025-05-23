resource "sysdig_monitor_alert_v2_metric" "prod_pltsvc_db_pod_memory" {
  enabled     = false
  name        = "[Prod] Registry MongoDB - Memory"
  description = "Prod: Registry MongoDB pod is using 90% of the memory limit"
  severity    = "low"

  metric            = "sysdig_container_memory_limit_used_percent"
  group_aggregation = "avg"
  time_aggregation  = "avg"
  operator          = ">"
  threshold         = 90

  range_seconds = 300

  scope {
    label    = "kube_cluster_name"
    operator = "in"
    values   = ["silver"]
  }

  scope {
    label    = "kube_namespace_name"
    operator = "in"
    values   = ["101ed4-prod"]
  }

  scope {
    label    = "kube_workload_name"
    operator = "in"
    values   = ["pltsvc-mongodb"]
  }

  notification_channels {
    id                     = 148742
    renotify_every_minutes = 60
  }

  custom_notification {
    subject = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_v2_metric" "prod_pltsvc_db_pod_cpu" {
  enabled     = false
  name        = "[Prod] Registry MongoDB - CPU"
  description = "Prod: Any of Registry MongoDB pod is using more than 80% of limited CPU"

  severity = "low"

  metric            = "sysdig_container_cpu_cores_used_percent"
  group_aggregation = "avg"
  time_aggregation  = "avg"
  operator          = ">"
  threshold         = 80

  range_seconds = 300

  scope {
    label    = "kube_cluster_name"
    operator = "in"
    values   = ["silver"]
  }

  scope {
    label    = "kube_namespace_name"
    operator = "in"
    values   = ["101ed4-prod"]
  }

  scope {
    label    = "kube_workload_name"
    operator = "in"
    values   = ["pltsvc-mongodb"]
  }

  notification_channels {
    id                     = 148742
    renotify_every_minutes = 60
  }

  custom_notification {
    subject = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_v2_metric" "prod_pltsvc_app_pod_memory" {
  enabled     = false
  name        = "[Prod] Registry App - Memory"
  description = "Prod: Registry app pod is using 90% of the memory limit"

  severity = "low"

  metric            = "sysdig_container_memory_limit_used_percent"
  group_aggregation = "avg"
  time_aggregation  = "avg"
  operator          = ">"
  threshold         = 90

  range_seconds = 300

  scope {
    label    = "kube_cluster_name"
    operator = "in"
    values   = ["silver"]
  }

  scope {
    label    = "kube_namespace_name"
    operator = "in"
    values   = ["101ed4-prod"]
  }

  scope {
    label    = "kube_workload_name"
    operator = "in"
    values   = ["pltsvc-app"]
  }

  notification_channels {
    id                     = 148742
    renotify_every_minutes = 60
  }

  custom_notification {
    subject = "{{__alert_name__}} is {{__alert_status__}}"
  }
}

resource "sysdig_monitor_alert_v2_metric" "prod_pltsvc_app_pod_cpu" {
  enabled     = false
  name        = "[Prod] Registry App - CPU"
  description = "Prod: Any of Registry App pod is using more than 80% of limited CPU"


  severity = "low"

  metric            = "sysdig_container_cpu_cores_used_percent"
  group_aggregation = "avg"
  time_aggregation  = "avg"
  operator          = ">"
  threshold         = 80

  range_seconds = 300

  scope {
    label    = "kube_cluster_name"
    operator = "in"
    values   = ["silver"]
  }

  scope {
    label    = "kube_namespace_name"
    operator = "in"
    values   = ["101ed4-prod"]
  }

  scope {
    label    = "kube_workload_name"
    operator = "in"
    values   = ["pltsvc-app"]
  }

  notification_channels {
    id                     = 148742
    renotify_every_minutes = 60
  }

  custom_notification {
    subject = "{{__alert_name__}} is {{__alert_status__}}"
  }
}
