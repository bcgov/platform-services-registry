terraform {
  required_version = "1.12.1"

  required_providers {
    # See https://registry.terraform.io/providers/sysdiglabs/sysdig/latest/docs
    sysdig = {
      source  = "sysdiglabs/sysdig"
      version = ">= 1.56.3"
    }
  }
}

provider "sysdig" {
  sysdig_monitor_api_token = var.sysdig_monitor_api_token
}
