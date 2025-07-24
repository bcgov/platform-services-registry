import requests
from requests.exceptions import RequestException
from datetime import date, datetime, timedelta, timezone
from jinja2 import Environment, FileSystemLoader
from typing import Optional, Set
from _projects import get_mongo_db
from _keycloak import Keycloak
from _ches import Ches


def get_holiday_dates(province: str) -> set:
    url = f"https://canada-holidays.ca/api/v1/provinces/{province}"
    response = requests.get(url)
    response.raise_for_status()

    data = response.json()
    holiday_dates = {holiday["date"] for holiday in data["province"]["holidays"]}
    print(holiday_dates)
    return holiday_dates


def get_n_business_days_ago(n: int, province: str, base_date: Optional[date] = None) -> date:
    holidays = get_holiday_dates(province)
    current_day = base_date or date.today()
    count = 0

    while count < n:
        current_day -= timedelta(days=1)
        weekday = current_day.weekday()  # Monday is 0, Sunday is 6

        if weekday >= 5:  # Weekend
            continue
        if current_day.isoformat() in holidays:  # Holiday
            continue

        count += 1

    return current_day


def generate_email_html(app_url: str, licence_plate: str, request_id: str):
    env = Environment(loader=FileSystemLoader("/opt/airflow/dags"))

    template = env.get_template("_request_review_reminder.html")
    html_content = template.render(
        request_url=f"{app_url}/private-cloud/requests/{request_id}/decision", licence_plate=licence_plate
    )

    return html_content


def send_request_review_reminders(
    app_url,
    mongo_conn_id,
    kc_auth_url,
    kc_realm,
    kc_client_id,
    kc_client_secret,
    ches_api_url,
    ches_auth_url,
    ches_realm,
    ches_client_id,
    ches_client_secret,
):
    kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
    admins = kc.find_users_by_client_role("pltsvc", "private-admin")
    adminEmails = [admin["email"] for admin in admins if "email" in admin]
    if not adminEmails:
        print("No admin emails found.")
        return None

    ches = Ches(ches_api_url, ches_auth_url, ches_realm, ches_client_id, ches_client_secret)
    db = get_mongo_db(mongo_conn_id)

    three_business_days_ago = get_n_business_days_ago(3, "BC")
    print(f"Three business days ago: {three_business_days_ago}")

    three_business_days_ago_dt = datetime.combine(three_business_days_ago, datetime.min.time())
    query = {
        "type": "REVIEW_PRIVATE_CLOUD_REQUEST",
        "status": "ASSIGNED",
        "createdAt": {"$lt": three_business_days_ago_dt},
    }
    projection = {"_id": True, "data": True}

    print(f"Querying {query}...")
    tasks = db.Task.find(query, projection=projection)

    success = 0
    failure = 0
    for task in tasks:
        try:
            data = task.get("data")
            licence_plate = data["licencePlate"]
            request_id = data["requestId"]
            print(f"Processing task {task['_id']} with data: {data}")

            ches.send_email(
                {
                    "subject": "Private Cloud Request Review Reminder",
                    "body": generate_email_html(app_url, licence_plate, request_id),
                    "to": adminEmails,
                }
            )
            success += 1
        except Exception as e:
            print(f"Failed to process task {task['_id']}: {e}")
            failure += 1

    return {"success": success, "failure": failure}
