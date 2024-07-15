from datetime import datetime, timedelta, timezone
from pymongo import DESCENDING
from bson import ObjectId
from projects import get_mongo_db


def create_private_cloud_requested_project(db, project_details):
    now = datetime.now()
    private_cloud_project_data = {
        "name": project_details.get("name", "Default Name"),
        "description": project_details.get("description", "Default Description"),
        "status": project_details.get("status", "INACTIVE"),
        "licencePlate": project_details.get("licencePlate", "Default Licence Plate"),
        "isTest": project_details.get("isTest", False),
        "createdAt": now,
        "projectOwnerId": ObjectId(project_details.get("projectOwnerId")),
        "primaryTechnicalLeadId": ObjectId(project_details.get("primaryTechnicalLeadId")),
        "secondaryTechnicalLeadId": ObjectId(project_details.get("secondaryTechnicalLeadId")) if project_details.get("secondaryTechnicalLeadId") else None,
        "ministry": project_details.get("ministry", "Default Ministry"),
        "cluster": project_details.get("cluster", "Default Cluster"),
        "golddrEnabled": project_details.get("golddrEnabled", False),
        "productionQuota": project_details.get("productionQuota", {"cpu": 0, "memory": 0}),
        "testQuota": project_details.get("testQuota", {"cpu": 0, "memory": 0}),
        "developmentQuota": project_details.get("developmentQuota", {"cpu": 0, "memory": 0}),
        "toolsQuota": project_details.get("toolsQuota", {"cpu": 0, "memory": 0}),
        "commonComponents": project_details.get("commonComponents", {}),
        "supportPhoneNumber": project_details.get("supportPhoneNumber", "N/A")
    }

    document_id = db["PrivateCloudRequestedProject"].insert_one(private_cloud_project_data).inserted_id

    return document_id


def send_deletion_request(mongo_conn_id):
    db = get_mongo_db(mongo_conn_id)
    projects_collection = db["PrivateCloudProject"]
    requests_collection = db["PrivateCloudRequest"]

    try:
        projects = list(projects_collection.find({"isTest": True}))

        for project in projects:
            previous_request = get_last_closed_private_cloud_request(project["licencePlate"], requests_collection)
            project_create_at = project.get("createdAt")
            if project_create_at:
                if isinstance(project_create_at, str):
                    project_create_at = datetime.fromisoformat(
                        project_create_at.rstrip("Z")).replace(tzinfo=timezone.utc)
                elif isinstance(project_create_at, datetime) and project_create_at.tzinfo is None:
                    project_create_at = project_create_at.replace(tzinfo=timezone.utc)

            now = datetime.now(timezone.utc)
            if project_create_at <= (now - timedelta(days=30)):

                request_data = {
                    "type": "DELETE",
                    "decisionStatus": "PENDING",
                    "active": True,
                    "createdByEmail": "PlatformServicesTeam@gov.bc.ca",
                    "licencePlate": project.get("licencePlate"),
                    "originalDataId": previous_request["_id"] if previous_request else None,
                    "decisionDataId": create_private_cloud_requested_project(db, project),
                    "requestDataId": ObjectId(),
                    "projectId": project["_id"],
                    "createdAt": now,
                    "updatedAt": now,
                    "isQuotaChanged": False
                }

                new_request = requests_collection.insert_one(request_data)
                request_data['_id'] = str(new_request.inserted_id)

                if new_request:
                    print(f"Project {project['licencePlate']} is 30 days old or older and deletion request is created.")

                # if project_create_at == (now - timedelta(days=20)):
                #     print(f"Project {project['licencePlate']} is 20 days old and notification should be sent.")

    except Exception as e:
        print(f"[send_deletion_request] Error: {e}")


def get_last_closed_private_cloud_request(licence_plate, requests_collection):
    try:
        previous_request = requests_collection.find_one(
            {
                "licencePlate": licence_plate,
                "active": False,
            },
            sort=[("updatedAt", DESCENDING)],
        )
        return previous_request

    except Exception as e:
        print(f"[get_last_closed_private_cloud_request] Error: {e}")
        return None
