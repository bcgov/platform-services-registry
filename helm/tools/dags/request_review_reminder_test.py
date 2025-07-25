import os
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta
from _request_review_reminder import send_request_review_reminders
from _task_failure_callback import send_alert

APP_URL = "https://test-pltsvc.apps.silver.devops.gov.bc.ca"
MONGO_CONN_ID = "pltsvc-test"

KC_AUTH_URL = "https://test.loginproxy.gov.bc.ca/auth"
KC_REALM = "platform-services"
KC_SA_ID = os.getenv("TEST_KEYCLOAK_ADMIN_CLIENT_ID")
KC_SA_SECRET = os.getenv("TEST_KEYCLOAK_ADMIN_CLIENT_SECRET")

CHES_AUTH_URL = "https://test.loginproxy.gov.bc.ca/auth"
CHES_REALM = "comsvcauth"
CHES_SA_ID = os.getenv("TEST_CHES_SA_ID")
CHES_SA_SECRET = os.getenv("TEST_CHES_SA_SECRET")
CHES_API_URL = "https://ches-dev.api.gov.bc.ca/api/v1"

with DAG(
    dag_id="request_review_reminder_test",
    description="A DAG to send reminders for review of private cloud requests",
    schedule="10 0 * * *",
    start_date=datetime.now() - timedelta(weeks=1),
    is_paused_upon_creation=False,
    catchup=False,
) as dag:
    t1 = PythonOperator(
        task_id="request-review-reminder",
        python_callable=send_request_review_reminders,
        op_kwargs={
            "app_url": APP_URL,
            "mongo_conn_id": MONGO_CONN_ID,
            "kc_auth_url": KC_AUTH_URL,
            "kc_realm": KC_REALM,
            "kc_client_id": KC_SA_ID,
            "kc_client_secret": KC_SA_SECRET,
            "ches_api_url": CHES_API_URL,
            "ches_auth_url": CHES_AUTH_URL,
            "ches_realm": CHES_REALM,
            "ches_client_id": CHES_SA_ID,
            "ches_client_secret": CHES_SA_SECRET,
        },
        on_failure_callback=lambda context: send_alert(context, context["dag"].dag_id),
    )
