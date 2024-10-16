import os
import requests
import json

ROCKETCHAT_WEBHOOK_URL = os.getenv("ROCKETCHAT_WEBHOOK_URL")


def send_alert(context, dag):
    task_instance = context.get("task_instance")
    task_id = task_instance.task_id
    execution_date = context.get("execution_date")

    airflow_dag_logs = f"https://secdash-airflow.apps.silver.devops.gov.bc.ca/dags/{dag}/grid"

    payload = {
        "text": f":warning: Airlow: **{dag}**",
        "attachments": [
            {
                "color": "#d03ae8",
                "title": "System Alert",
                "text": f"Task `{task_id}` failed on {dag} at {execution_date}. You can check logs here: [{airflow_dag_logs}]({airflow_dag_logs})",
                "fields": [
                    {
                        "title": "**Action Required**",
                        "value": "Attention needed to resolve the issue.",
                    }
                ],
            }
        ],
    }

    try:
        requests.post(ROCKETCHAT_WEBHOOK_URL, data=json.dumps(payload), headers={"Content-Type": "application/json"})
    except:
        pass
