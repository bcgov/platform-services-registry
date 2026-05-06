import os
import requests
import json

N8N_MSTEAMS_WEBHOOK_URL = os.getenv("N8N_MSTEAMS_WEBHOOK_URL")


def send_alert(context, dag):
    task_instance = context.get("task_instance")
    task_id = task_instance.task_id
    execution_date = context.get("execution_date")

    airflow_dag_logs = f"https://secdash-airflow.apps.silver.devops.gov.bc.ca/dags/{dag}/runs"

    payload = {
        "title": f"⚠️ Airflow DAG failed: {dag}",
        "body": f"""
        Task `{task_id}` failed
        Execution: {execution_date}
        Logs: {airflow_dag_logs}
        """.strip(),
    }

    try:
        requests.post(N8N_MSTEAMS_WEBHOOK_URL, data=json.dumps(payload), headers={"Content-Type": "application/json"})
    except requests.exceptions.RequestException as e:
        pass
