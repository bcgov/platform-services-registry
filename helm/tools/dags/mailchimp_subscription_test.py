import os
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from _update_mailchimp_list import update_mailchimp_segment
from _task_failure_callback import send_alert


MONGO_CONN_ID = "pltsvc-test"
MAILCHIMP_LIST_ID = os.getenv("MAILCHIMP_LIST_ID")
MAILCHIMP_API_KEY = os.getenv("MAILCHIMP_API_KEY")
MAILCHIMP_SERVER_PREFIX = os.getenv("MAILCHIMP_SERVER_PREFIX")
MAILCHIMP_REGISTRY_PRIVATE_TAG_ID = os.getenv("MAILCHIMP_TEST_TAG_ID")

with DAG(
    dag_id="mailchimp_test",
    description="A DAG to update Mailchimp segment",
    schedule_interval="0 4 * * *",
    start_date=datetime.now() - timedelta(weeks=1),
    is_paused_upon_creation=True,
    catchup=False,
) as dag:
    t1 = PythonOperator(
        task_id="fetch-and-update-mailchimp-segment-test",
        python_callable=update_mailchimp_segment,
        op_kwargs={
            "api_key": MAILCHIMP_API_KEY,
            "server_prefix": MAILCHIMP_SERVER_PREFIX,
            "list_id": MAILCHIMP_LIST_ID,
            "tag_id": MAILCHIMP_REGISTRY_PRIVATE_TAG_ID,
            "mongo_conn_id": MONGO_CONN_ID,
        },
        provide_context=True,
        on_failure_callback=lambda context: send_alert(context, "mailchimp_test"),
        dag=dag,
    )
