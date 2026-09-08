import os
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator
from _finance_ingest import trigger_finance_ingest
from _task_failure_callback import send_alert

# TEST_* overrides let local Airflow (sandbox/docker-compose-airflow.yml) run real Forge billing
# against the local registry. In the cluster these are unset and the Silver test defaults apply.
BASE_URL = os.getenv("TEST_REGISTRY_BASE_URL", "https://test-pltsvc.apps.silver.devops.gov.bc.ca")
KEYCLOAK_AUTH_URL = os.getenv("TEST_KEYCLOAK_AUTH_URL", "https://test.loginproxy.gov.bc.ca/auth")
KEYCLOAK_REALM = os.getenv("TEST_KEYCLOAK_REALM", "platform-services")
FINANCE_SA_ID = os.getenv("TEST_FINANCE_SA_ID")
FINANCE_SA_SECRET = os.getenv("TEST_FINANCE_SA_SECRET")

with DAG(
    dag_id="public_cloud_finance_ingest_test",
    schedule="15 6 * * *",
    start_date=datetime(2026, 8, 1),
    is_paused_upon_creation=True,
    catchup=False,
    default_args={"retries": 2, "retry_delay": timedelta(minutes=5)},
    tags=["public-cloud", "finance"],
) as dag:
    PythonOperator(
        task_id="ingest-public-cloud-finance-test",
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
