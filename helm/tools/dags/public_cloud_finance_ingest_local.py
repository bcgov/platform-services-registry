import os
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator
from _finance_ingest import trigger_finance_ingest
from _task_failure_callback import send_alert

BASE_URL = os.getenv("LOCAL_REGISTRY_BASE_URL", "http://host.docker.internal:3000")
KEYCLOAK_AUTH_URL = os.getenv("LOCAL_KEYCLOAK_AUTH_URL", "http://host.docker.internal:8080")
KEYCLOAK_REALM = os.getenv("LOCAL_KEYCLOAK_REALM", "platform-services")
FINANCE_SA_ID = os.getenv("LOCAL_FINANCE_SA_ID")
FINANCE_SA_SECRET = os.getenv("LOCAL_FINANCE_SA_SECRET")

with DAG(
    dag_id="public_cloud_finance_ingest_local",
    schedule="15 6 * * *",
    start_date=datetime.now() - timedelta(days=1),
    is_paused_upon_creation=True,
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=5)},
    tags=["public-cloud", "finance", "local"],
) as dag:
    PythonOperator(
        task_id="ingest-public-cloud-finance-local",
        python_callable=trigger_finance_ingest,
        op_kwargs={
            "base_url": BASE_URL,
            "kc_auth_url": KEYCLOAK_AUTH_URL,
            "kc_realm": KEYCLOAK_REALM,
            "kc_client_id": FINANCE_SA_ID,
            "kc_client_secret": FINANCE_SA_SECRET,
        },
        execution_timeout=timedelta(minutes=20),
        on_failure_callback=lambda context: send_alert(context, context["dag"].dag_id),
    )
