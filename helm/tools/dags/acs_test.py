from datetime import timedelta, datetime

from airflow import DAG
from airflow.operators.python import PythonOperator
from _projects import fetch_load_acs_projects
from _task_failure_callback import send_alert

YESTERDAY = datetime.now() - timedelta(days=1)
CONCURRENCY = 5
MONGO_CONN_ID = "pltsvc-test"

with DAG(
    dag_id="acs_test",
    schedule_interval="0 3 * * *",
    start_date=YESTERDAY,
    concurrency=CONCURRENCY,
) as dag:
    t1 = PythonOperator(
        task_id="fetch-load-acs-projects-test",
        python_callable=fetch_load_acs_projects,
        op_kwargs={"mongo_conn_id": MONGO_CONN_ID},
        provide_context=True,
        on_failure_callback=lambda context: send_alert(context, "acs_test"),
        dag=dag,
    )
