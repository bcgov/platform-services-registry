import httpx
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from _task_failure_callback import send_alert


def validate_token_healthcheck(**kwargs):
    url = "http://host.docker.internal:3000/api/token-check"
    try:
        with httpx.Client(timeout=10) as client:
            response = client.post(url)
            response.raise_for_status()
            data = response.json()

        if not isinstance(data, dict) or not all(data.values()):
            raise RuntimeError(f"Some tokens are invalid: {data}")
    except Exception as e:
        raise RuntimeError(f"Token check failed: {e}")


with DAG(
    dag_id="token_validation",
    description="A DAG to validate tokens via Registry API",
    schedule="0 3 * * *",
    start_date=datetime.now() - timedelta(weeks=1),
    is_paused_upon_creation=False,
    catchup=False,
) as dag:
    t1 = PythonOperator(
        task_id="validate-tokens",
        python_callable=validate_token_healthcheck,
        on_failure_callback=lambda context: send_alert(context, "token_validation"),
    )
