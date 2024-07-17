import requests
from datetime import datetime, timedelta, timezone
from projects import get_mongo_db


class PrivateCloudTempProductsDeletionRequestManager:
    def __init__(self, base_url, client_id, client_secret, mongo_conn_id, auth_server_url, realm):
        self.base_url = base_url
        self.client_id = client_id
        self.client_secret = client_secret
        self.mongo_conn_id = mongo_conn_id
        self.auth_server_url = auth_server_url
        self.realm = realm
        self.token = None

    def get_token(self):
        token_url = f"{self.auth_server_url}/realms/{self.realm}/protocol/openid-connect/token"
        data = {
            "grant_type": "client_credentials",
            "client_id": self.client_id,
            "client_secret": self.client_secret
        }

        response = requests.post(token_url, data=data)
        try:
            response.raise_for_status()
            self.token = response.json().get("access_token")
            print("Access token retrieved successfully:", self.token)
        except requests.exceptions.HTTPError as e:
            print("Failed to retrieve token:", e)
            print("Response:", response.text)
            return None

    def delete_private_cloud_project(self, licence_plate):
        url = f"{self.base_url}/{licence_plate}"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        try:
            response = requests.delete(url, headers=headers)
            response.raise_for_status()
            return response.json()
        except requests.RequestException as e:
            print(f"An error occurred: {e}")
            return None

    def send_deletion_requests(self):
        db = get_mongo_db(self.mongo_conn_id)
        projects_collection = db["PrivateCloudProject"]
        try:
            projects = list(projects_collection.find({"isTest": True}))
            now = datetime.now(timezone.utc)

            for project in projects:
                project_create_at = project.get("createdAt")
                if project_create_at:
                    if isinstance(project_create_at, str):
                        project_create_at = datetime.fromisoformat(
                            project_create_at.rstrip("Z")).replace(tzinfo=timezone.utc)
                    elif isinstance(project_create_at, datetime) and project_create_at.tzinfo is None:
                        project_create_at = project_create_at.replace(tzinfo=timezone.utc)

                if project_create_at <= (now - timedelta(days=0)):
                    licence_plate = project.get("licencePlate")
                    result = self.delete_private_cloud_project(licence_plate)
                    print("API Response:", result)

        except Exception as e:
            print(f"[send_deletion_requests] Error: {e}")


def send_temp_products_deletion_request(base_url, client_id, client_secret, mongo_conn_id, auth_server_url, realm):
    manager = PrivateCloudTempProductsDeletionRequestManager(
        base_url, client_id, client_secret, mongo_conn_id, auth_server_url, realm)
    manager.get_token()
    manager.send_deletion_requests()
