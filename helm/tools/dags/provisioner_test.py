import os
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from _mark_provisioned import fetch_products_mark_completed
from _task_failure_callback import send_alert

MONGO_CONN_ID = "pltsvc-test"
PROV_API_URL = os.getenv("TEST_PROVISIONER_URL")
MARK_PROV_URL = os.getenv("TEST_MARK_PROVISIONED_URL")

with DAG(
    dag_id="provisioner_test", schedule_interval="*/7 * * * *", start_date=datetime.now() - timedelta(minutes=8)
) as dag:
    t1 = PythonOperator(
        task_id="fetch-products-mark-completed-test",
        python_callable=fetch_products_mark_completed,
        op_kwargs={
            "provisioner_api_url": PROV_API_URL,
            "mark_provisioned_url": MARK_PROV_URL,
            "mongo_conn_id": MONGO_CONN_ID,
        },
        provide_context=True,
        on_failure_callback=lambda context: send_alert(context, "provisioner_test"),
        dag=dag,
    )
