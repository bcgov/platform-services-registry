terraform {
  required_version = "1.12.1"

  required_providers {
    sysdig = {
      source  = "sysdiglabs/sysdig"
      version = ">= 1.20.0"
    }
  }
}

provider "sysdig" {
  sysdig_monitor_api_token = var.sysdig_monitor_api_token
}
