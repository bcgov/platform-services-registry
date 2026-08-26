import os
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator
from _finance_ingest import trigger_finance_ingest
from _task_failure_callback import send_alert

BASE_URL = "https://pltsvc.apps.silver.devops.gov.bc.ca"
KEYCLOAK_AUTH_URL = "https://loginproxy.gov.bc.ca/auth"
KEYCLOAK_REALM = "platform-services"
FINANCE_SA_ID = os.getenv("PROD_FINANCE_SA_ID")
FINANCE_SA_SECRET = os.getenv("PROD_FINANCE_SA_SECRET")
USE_SIMULATED = False

with DAG(
    dag_id="public_cloud_finance_ingest_prod",
    schedule="15 6 * * *",
    start_date=datetime.now() - timedelta(days=1),
    is_paused_upon_creation=True,
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=5)},
    tags=["public-cloud", "finance"],
) as dag:
    PythonOperator(
        task_id="ingest-public-cloud-finance-prod",
        python_callable=trigger_finance_ingest,
        op_kwargs={
            "base_url": BASE_URL,
            "kc_auth_url": KEYCLOAK_AUTH_URL,
            "kc_realm": KEYCLOAK_REALM,
            "kc_client_id": FINANCE_SA_ID,
            "kc_client_secret": FINANCE_SA_SECRET,
            "use_simulated": USE_SIMULATED,
        },
        on_failure_callback=lambda context: send_alert(context, context["dag"].dag_id),
    )
