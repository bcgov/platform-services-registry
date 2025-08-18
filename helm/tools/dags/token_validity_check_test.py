import os
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from _task_failure_callback import send_alert
from _token_check import call_token_check_api

# Environment-specific base URL
BASE_URL = "https://test-pltsvc.apps.silver.devops.gov.bc.ca"

with DAG(
    dag_id="token_validity_check_test",
    description="Daily token check for test environment",
    schedule="0 2 * * *",
    start_date=datetime.now() - timedelta(days=1),
    is_paused_upon_creation=True,
    catchup=False,
) as dag:

    token_check_task = PythonOperator(
        task_id="call-token-check-api-test",
        python_callable=call_token_check_api,
        op_kwargs={"base_url": BASE_URL},
        on_failure_callback=lambda context: send_alert(context, context["dag"].dag_id),
    )
