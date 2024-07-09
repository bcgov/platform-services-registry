import os
import subprocess
import json
from datetime import datetime, timedelta, timezone
from pymongo import MongoClient, DESCENDING
from bson import ObjectId


def get_mongo_db():
    connection_url = os.getenv('DATABASE_URL')
    print(f"Connecting to MongoDB with URL: {connection_url}")
    client = MongoClient(connection_url)
    db_name = connection_url.split('/')[-1].split('?')[0]
    return client[db_name]


def call_node_function(function_name, request, user_name):
    try:
        result = subprocess.run(
            ['ts-node', 'app/services/ches/private-cloud/send-emails.ts',
                function_name, json.dumps(request), user_name],
            check=True, capture_output=True, text=True
        )
        print(f"[call_node_function]: {result.stdout}")
    except subprocess.CalledProcessError as e:
        print(f"[call_node_function] error occurred: {e.stderr}")


def create_request_data(db, project_details):
    now = datetime.now()

    # Assuming project_details contains all necessary info, or set defaults
    request_data = {
        "name": project_details.get("name", "Default Name"),
        "description": project_details.get("description", "Default Description"),
        "status": project_details.get("status", "INACTIVE"),  # Assuming 'status' is provided, or set a default
        "licencePlate": project_details.get("licencePlate", "Default Licence"),
        "isTest": project_details.get("isTest", False),
        "createdAt": now,
        "projectOwnerId": project_details.get("projectOwnerId"),
        "primaryTechnicalLeadId": project_details.get("primaryTechnicalLeadId"),
        "secondaryTechnicalLeadId": project_details.get("secondaryTechnicalLeadId", None),
        "ministry": project_details.get("ministry", "Default Ministry"),
        "cluster": project_details.get("cluster", "Default Cluster"),
        "golddrEnabled": project_details.get("golddrEnabled", False),
        "productionQuota": project_details.get("productionQuota", {}),
        "testQuota": project_details.get("testQuota", {}),
        "developmentQuota": project_details.get("developmentQuota", {}),
        "toolsQuota": project_details.get("toolsQuota", {}),
        "commonComponents": project_details.get("commonComponents", {}),
        "supportPhoneNumber": project_details.get("supportPhoneNumber", "N/A")
    }

    # Insert the data into the collection and obtain the new ObjectId
    request_data_id = db["PrivateCloudRequestedProject"].insert_one(request_data).inserted_id

    # Return the entire document just created, for further processing or verification
    return db["PrivateCloudRequestedProject"].find_one({"_id": request_data_id})


def create_private_cloud_requested_project(db, project_details):
    now = datetime.now()

    # Prepare the data document based on the model structure
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

    # Insert the document into the MongoDB collection
    document_id = db["PrivateCloudRequestedProject"].insert_one(private_cloud_project_data).inserted_id
    print("data : ", db["PrivateCloudRequestedProject"].find_one({"_id": document_id})
          )
    # Optionally, return the created document
    return document_id


def send_deletion_request():
    db = get_mongo_db()
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
            if project_create_at <= (now - timedelta(days=0)):
                request_data = {
                    "type": "DELETE",
                    "decisionStatus": "PENDING",
                    "active": True,
                    "createdByEmail": "PlatformServicesTeam@gov.bc.ca",
                    "licencePlate": project.get("licencePlate"),
                    "originalDataId": previous_request["_id"] if previous_request else None,
                    "decisionDataId": ObjectId(create_private_cloud_requested_project(db, project)),
                    "requestDataId": ObjectId(),
                    "projectId": ObjectId(project["_id"]),
                    "createdAt": now,
                    "updatedAt": now,
                    "isQuotaChanged": False
                }

                new_request = requests_collection.insert_one(request_data)
                # print("new_request", new_request)
                if new_request:
                    # call_node_function("sendDeleteRequestEmails", request_data, "PlatformServicesTeam")
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


send_deletion_request()
