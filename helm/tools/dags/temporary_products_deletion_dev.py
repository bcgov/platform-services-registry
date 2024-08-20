import os
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from _temporary_products_deletion import send_temp_products_deletion_request


MONGO_CONN_ID = "pltsvc-dev"
KEYCLOAK_AUTH_URL = "https://dev.loginproxy.gov.bc.ca/auth"
KEYCLOAK_REALM = "platform-services"
REGISTRY_SA_ID = os.getenv("DEV_REGISTRY_SA_ID")
REGISTRY_SA_SECRET = os.getenv("DEV_REGISTRY_SA_SECRET")
REGISTRY_DELETE_URL_TEMPLATE = "https://dev-pltsvc.apps.silver.devops.gov.bc.ca/api/private-cloud/products/{}"

with DAG(
    dag_id="temporary_products_deletion_dev",
    description="A DAG to create delete request for old temporary products",
    schedule_interval="0 0 * * *",
    start_date=datetime.now() - timedelta(weeks=1),
    is_paused_upon_creation=False,
    catchup=False,
) as dag:
    t1 = PythonOperator(
        task_id="send-temp-products-deletion-request",
        python_callable=send_temp_products_deletion_request,
        op_kwargs={
            "kc_auth_url": KEYCLOAK_AUTH_URL,
            "kc_realm": KEYCLOAK_REALM,
            "kc_client_id": REGISTRY_SA_ID,
            "kc_client_secret": REGISTRY_SA_SECRET,
            "mongo_conn_id": MONGO_CONN_ID,
            "product_deletion_url_template": REGISTRY_DELETE_URL_TEMPLATE,
        },
        provide_context=True,
        dag=dag,
    )
