from datetime import datetime, timedelta, timezone
from jinja2 import Environment, FileSystemLoader
from bson.objectid import ObjectId
from _projects import get_mongo_db
from _ches import Ches


def generate_email_html(app_url: str, licence_plate: str):
    env = Environment(loader=FileSystemLoader("/opt/airflow/dags"))

    template = env.get_template("_temporary_products_notification.html")
    html_content = template.render(
        product_url=f"{app_url}/private-cloud/products/{licence_plate}/edit", licence_plate=licence_plate
    )

    return html_content


def send_temporary_products_notification(
    kc_auth_url, kc_realm, kc_client_id, kc_client_secret, mongo_conn_id, ches_api_url, app_url
):
    ches = Ches(ches_api_url, kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
    db = get_mongo_db(mongo_conn_id)

    sixteen_days_ago = datetime.now(timezone.utc) - timedelta(days=16)
    current_date = datetime.now(timezone.utc)
    query = {
        "isTest": True,
        "status": "ACTIVE",
        "createdAt": {"$lt": sixteen_days_ago},
        "temporaryProductNotificationDate": {"$exists": False},
    }
    projection = {
        "_id": True,
        "licencePlate": True,
        "projectOwnerId": True,
        "primaryTechnicalLeadId": True,
        "secondaryTechnicalLeadId": True,
    }
    projects = db.PrivateCloudProject.find(query, projection=projection)
    project_ids = []

    count = 0
    for project in projects:
        count += 1
        licence_plate = project.get("licencePlate")
        project_id = project.get("_id")
        project_owner_id = project.get("projectOwnerId")
        primary_technical_lead_id = project.get("primaryTechnicalLeadId")
        secondary_technical_lead_id = project.get("secondaryTechnicalLeadId")
        print(f"Processing {licence_plate}...")

        unique_ids = {
            str(id) for id in (project_owner_id, primary_technical_lead_id, secondary_technical_lead_id) if id
        }
        if not unique_ids:
            print(f"No valid user IDs found for project {licence_plate}")
            continue

        user_filter = {"_id": {"$in": [ObjectId(id) for id in unique_ids]}}
        user_emails = db.User.distinct("email", filter=user_filter)

        if not user_emails:
            print(f"No user emails found for project {licence_plate}")
            continue

        ches.send_email(
            {
                "subject": "Temporary Product Set Deletion Notification",
                "body": generate_email_html(app_url, licence_plate),
                "to": user_emails,
            }
        )

        project_ids.append(project_id)

    if project_ids:
        db.PrivateCloudProject.update_many(
            {"_id": {"$in": project_ids}}, {"$set": {"temporaryProductNotificationDate": current_date}}
        )

    return {"status": "success", "count": count}
