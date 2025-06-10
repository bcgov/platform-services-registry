import os
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from _task_failure_callback import send_alert
from _token_check import call_token_check_api

# Environment-specific base URL
BASE_URL = "https://registry.developer.gov.bc.ca"

with DAG(
    dag_id="token_validity_check_prod",
    description="Daily credentials and tokens check for production environment",
    schedule="@daily",
    start_date=datetime.now() - timedelta(days=1),
    catchup=False,
) as dag:

    token_check_task = PythonOperator(
        task_id="call-token-check-api-production",
        python_callable=call_token_check_api,
        op_kwargs={"base_url": BASE_URL},
        on_failure_callback=lambda context: send_alert(context, "token_check_production"),
    )
