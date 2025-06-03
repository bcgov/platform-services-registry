import os
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from _mark_provisioned import fetch_products_mark_completed
from _task_failure_callback import send_alert

MONGO_CONN_ID = "pltsvc-prod"
PROV_API_URL = os.getenv("PROD_PROVISIONER_URL")
MARK_PROV_URL = "https://pltsvc.apps.silver.devops.gov.bc.ca/api/v1/private-cloud/products"
KEYCLOAK_AUTH_URL = "https://loginproxy.gov.bc.ca/auth"
KEYCLOAK_REALM = "platform-services"
REGISTRY_PROVISION_SA_ID = os.getenv("PROD_PROVISION_SA_ID")
REGISTRY_PROVISION_SA_SECRET = os.getenv("PROD_PROVISION_SA_SECRET")

with DAG(dag_id="provisioner_prod", schedule="*/7 * * * *", start_date=datetime.now() - timedelta(minutes=8)) as dag:
    t1 = PythonOperator(
        task_id="fetch-products-mark-completed-prod",
        python_callable=fetch_products_mark_completed,
        op_kwargs={
            "provisioner_api_url": PROV_API_URL,
            "mark_provisioned_url": MARK_PROV_URL,
            "mongo_conn_id": MONGO_CONN_ID,
            "kc_auth_url": KEYCLOAK_AUTH_URL,
            "kc_realm": KEYCLOAK_REALM,
            "kc_client_id": REGISTRY_PROVISION_SA_ID,
            "kc_client_secret": REGISTRY_PROVISION_SA_SECRET,
        },
        on_failure_callback=lambda context: send_alert(context, "provisioner_prod"),
    )
