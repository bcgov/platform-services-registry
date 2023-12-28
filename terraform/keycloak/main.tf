module "keycloak_dev" {
  source        = "./dev"
  client_id     = var.dev_client_id
  client_secret = var.dev_client_secret
  url           = "https://dev.loginproxy.gov.bc.ca"
  base_path     = "/auth"
}

module "keycloak_test" {
  source        = "./test"
  client_id     = var.test_client_id
  client_secret = var.test_client_secret
  url           = "https://test.loginproxy.gov.bc.ca"
  base_path     = "/auth"
}

module "keycloak_prod" {
  source        = "./prod"
  client_id     = var.test_client_id
  client_secret = var.prod_client_secret
  url           = "https://loginproxy.gov.bc.ca"
  base_path     = "/auth"
}
