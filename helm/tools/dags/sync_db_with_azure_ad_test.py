import os
from airflow import DAG
from airflow.operators.python_operator import PythonOperator
from datetime import datetime, timedelta
from _task_failure_callback import send_alert
from helm.tools.dags._sync_azure_ad_with_db import sync_db_users_with_azure_ad

MONGO_CONN_ID = "pltsvc-test"
MS_GRAPH_API_TENANT_ID = os.getenv("MS_GRAPH_API_TENANT_ID")
MS_GRAPH_API_CLIENT_ID = os.getenv("MS_GRAPH_API_CLIENT_ID")
MS_GRAPH_API_CLIENT_SECRET = os.getenv("MS_GRAPH_API_CLIENT_SECRET")

with DAG(
    dag_id="sync_user_dbs_test",
    schedule_interval="0 1 * * *",
    start_date=datetime.now() - timedelta(days=1),
    catchup=False,
) as dag:
    t1 = PythonOperator(
        task_id="sync-db-users-with-azure-ad-test",
        python_callable=sync_db_users_with_azure_ad,
        op_kwargs={
            "mongo_conn_id": MONGO_CONN_ID,
            "ms_graph_api_tenant_id": MS_GRAPH_API_TENANT_ID,
            "ms_graph_api_client_id": MS_GRAPH_API_CLIENT_ID,
            "ms_graph_api_client_secret": MS_GRAPH_API_CLIENT_SECRET,
        },
        provide_context=True,
        on_failure_callback=lambda context: send_alert(context, "sync_user_dbs_test"),
        dag=dag,
    )
