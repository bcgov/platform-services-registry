import os
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from update_mailchimp_list import update_mailchimp_segment

MONGO_CONN_ID = 'pltsvc-test'
MAILCHIMP_LIST_ID = os.getenv('MAILCHIMP_LIST_ID')
MAILCHIMP_API_KEY = os.getenv('MAILCHIMP_API_KEY')
MAILCHIMP_SERVER_PREFIX = os.getenv('MAILCHIMP_SERVER_PREFIX')
MAILCHIMP_REGISTRY_PRIVATE_TAG_NAME = os.getenv('MAILCHIMP_REGISTRY_PRIVATE_TAG_NAME')

with DAG(
    dag_id="mailchimp-test",
    schedule_interval='@weekly',
    start_date=datetime.now() - timedelta(weeks=1)
) as dag:
    t1 = PythonOperator(
        task_id='fetch-and-update-mailchimp-segment',
        python_callable=update_mailchimp_segment,
        op_kwargs={
            'api_key': MAILCHIMP_API_KEY,
            'server_prefix': MAILCHIMP_SERVER_PREFIX,
            'list_id': MAILCHIMP_LIST_ID,
            'tag_name': MAILCHIMP_REGISTRY_PRIVATE_TAG_NAME,
            'mongo_conn_id': MONGO_CONN_ID
        },
        provide_context=True,
        dag=dag
    )
