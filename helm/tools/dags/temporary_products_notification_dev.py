import os
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from _temporary_products_notification import send_temporary_products_notification
from _task_failure_callback import send_alert


MONGO_CONN_ID = "pltsvc-dev"
KEYCLOAK_AUTH_URL = "https://dev.loginproxy.gov.bc.ca/auth"
KEYCLOAK_REALM = "comsvcauth"
CHES_SA_ID = os.getenv("DEV_CHES_SA_ID")
CHES_SA_SECRET = os.getenv("DEV_CHES_SA_SECRET")
CHES_API_URL = "http://pltsvc-ches-mock.101ed4-dev.svc.cluster.local:3025"
APP_URL = "https://dev-pltsvc.apps.silver.devops.gov.bc.ca"

with DAG(
    dag_id="temporary_products_notification_dev",
    description="A DAG to send notifications to temporary products",
    schedule="0 0 * * *",
    start_date=datetime.now() - timedelta(weeks=1),
    is_paused_upon_creation=False,
    catchup=False,
) as dag:
    t1 = PythonOperator(
        task_id="send-temporary-products-notification",
        python_callable=send_temporary_products_notification,
        op_kwargs={
            "kc_auth_url": KEYCLOAK_AUTH_URL,
            "kc_realm": KEYCLOAK_REALM,
            "kc_client_id": CHES_SA_ID,
            "kc_client_secret": CHES_SA_SECRET,
            "mongo_conn_id": MONGO_CONN_ID,
            "ches_api_url": CHES_API_URL,
            "app_url": APP_URL,
        },
        on_failure_callback=lambda context: send_alert(context, context["dag"].dag_id),
    )
