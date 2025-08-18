import os
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from _task_failure_callback import send_alert
from _sync_azure_ad_with_db import sync_db_users_with_azure_ad

MONGO_CONN_ID = "pltsvc-dev"
MS_GRAPH_API_TENANT_ID = os.getenv("DEV_MS_GRAPH_API_TENANT_ID")
MS_GRAPH_API_CLIENT_ID = os.getenv("DEV_MS_GRAPH_API_CLIENT_ID")
MS_GRAPH_API_CLIENT_PRIVATE_KEY = os.getenv("DEV_MS_GRAPH_API_CLIENT_PRIVATE_KEY")
MS_GRAPH_API_CLIENT_CERTIFICATE = os.getenv("DEV_MS_GRAPH_API_CLIENT_CERTIFICATE")

with DAG(
    dag_id="sync_user_dbs_dev",
    schedule="0 0 * * *",
    start_date=datetime.now() - timedelta(days=1),
    is_paused_upon_creation=True,
    catchup=False,
) as dag:
    t1 = PythonOperator(
        task_id="sync-db-users-with-azure-ad-dev",
        python_callable=sync_db_users_with_azure_ad,
        op_kwargs={
            "mongo_conn_id": MONGO_CONN_ID,
            "ms_graph_api_tenant_id": MS_GRAPH_API_TENANT_ID,
            "ms_graph_api_client_id": MS_GRAPH_API_CLIENT_ID,
            "ms_graph_api_client_private_key": MS_GRAPH_API_CLIENT_PRIVATE_KEY,
            "ms_graph_api_client_certificate": MS_GRAPH_API_CLIENT_CERTIFICATE,
        },
        on_failure_callback=lambda context: send_alert(context, context["dag"].dag_id),
    )
