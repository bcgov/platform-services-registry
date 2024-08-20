import os
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from _mark_provisioned import fetch_products_mark_completed

MONGO_CONN_ID = "pltsvc-test"
PROV_API_URL = os.getenv("PROD_PROVISIONER_URL")
MARK_PROV_URL = os.getenv("PROD_MARK_PROVISIONED_URL")

with DAG(
    dag_id="provisioner_prod", schedule_interval="*/7 * * * *", start_date=datetime.now() - timedelta(minutes=8)
) as dag:
    t1 = PythonOperator(
        task_id="fetch-products-mark-completed-prod",
        python_callable=fetch_products_mark_completed,
        op_kwargs={
            "provisioner_api_url": PROV_API_URL,
            "mark_provisioned_url": MARK_PROV_URL,
            "mongo_conn_id": MONGO_CONN_ID,
        },
        provide_context=True,
        dag=dag,
    )
