from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import timedelta, datetime
from _task_failure_callback import send_alert

"""
DAG: airflow_failure_test

This DAG is a simple script to demonstrate failure handling and sending of rocektchat alerts in Airflow.
It's not part of the functionality of the codebase.
"""

default_args = {
    "owner": "airflow",
    "retries": 1,
    "retry_delay": timedelta(seconds=5),
}

with DAG(
    dag_id="airflow_failure_test",
    default_args=default_args,
    description="A simple example DAG",
    schedule_interval=timedelta(minutes=5),
    start_date=datetime(2024, 10, 16),
    catchup=False,
) as dag:

    def test_dag_task():
        print("Hello, testing airflow task!")
        raise Exception("The task has been failed intentionally")

    t1 = PythonOperator(
        task_id="test_dag_task",
        python_callable=test_dag_task,
        on_failure_callback=lambda context: send_alert(context, "airflow_failure_test"),
    )
