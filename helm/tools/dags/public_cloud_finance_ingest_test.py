import os
from datetime import datetime, timedelta

from airflow import DAG
from airflow.operators.python import PythonOperator
from _finance_ingest import trigger_finance_ingest
from _task_failure_callback import send_alert

BASE_URL = "https://test-pltsvc.apps.silver.devops.gov.bc.ca"
USE_SIMULATED = False

with DAG(
    dag_id="public_cloud_finance_ingest_test",
    schedule="15 6 * * *",
    start_date=datetime.now() - timedelta(days=1),
    is_paused_upon_creation=True,
    catchup=False,
    tags=["public-cloud", "finance"],
) as dag:
    PythonOperator(
        task_id="ingest-public-cloud-finance-test",
        python_callable=trigger_finance_ingest,
        op_kwargs={
            "base_url": BASE_URL,
            "auth_header": os.getenv("TEST_FINANCE_INGEST_AUTH_HEADER"),
            "use_simulated": USE_SIMULATED,
        },
        on_failure_callback=lambda context: send_alert(context, context["dag"].dag_id),
    )
