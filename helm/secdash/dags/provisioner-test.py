from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from mark_provisioned import prepare_data_to_poll_provisioner

MONGO_CONN_ID = 'pltsvc-test'

with DAG(
    dag_id="provisioner_test",
    schedule_interval='*/7 * * * *',
    start_date=datetime.now() - timedelta(minutes=8)
) as dag:
    t1 = PythonOperator(
        task_id='fetch-products-mark-completed-test',
        python_callable=prepare_data_to_poll_provisioner,
        op_kwargs={'mongo_conn_id': MONGO_CONN_ID},
        provide_context=True,
        dag=dag
    )
