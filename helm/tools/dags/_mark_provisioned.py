import json
import requests
from bson.objectid import ObjectId
from _projects import get_mongo_db
from _utils import keys_exist
from _keycloak import Keycloak


def fetch_products_mark_completed(
    provisioner_api_url, mark_provisioned_url, mongo_conn_id, kc_auth_url, kc_realm, kc_client_id, kc_client_secret
):
    """
    Fetches Approved Requests from MongoDB, makes call to the Provisioner by every of them
    and if labels completed = true and phase = Succeeded, makes a call to callback URL.

    Parameters:
    - provisioner_api_url (str): The url for provisioner API that returns the workflow status
    - mark_provisioned_url (str): The url to Registry App API that marks Product as Completed
    - mongo_connection_url (str): The connection string to Registry App DB to fetch products in 'Approved' state

    Raises:
    - Any exceptions that occur during the execution.
    """

    try:
        # Establish MongoDB connection
        db = get_mongo_db(mongo_conn_id)
        requests_collection = db["PrivateCloudRequest"]
        requested_projects_collection = db["PrivateCloudRequestData"]

        product_requests = requests_collection.find(
            {"decisionStatus": "APPROVED"}, projection={"_id": True, "licencePlate": True, "decisionDataId": True}
        )

        for request in product_requests:
            request_id = request["_id"]
            licence_plate = request["licencePlate"]
            decision_data_id = ObjectId(request["decisionDataId"])
            # a call to the RequestedProject table to get cluster
            requested_project_document = requested_projects_collection.find_one(
                {"_id": decision_data_id}, projection={"cluster": True}
            )
            cluster = requested_project_document.get("cluster").lower()
            # start of provisioner logic
            workflow_name = f"{cluster}-{licence_plate}-{request_id}"
            provisioner_workflow_url = f"{provisioner_api_url}/{workflow_name}"
            request_status_in_provisioner = requests.get(provisioner_workflow_url).json()
            if not keys_exist(request_status_in_provisioner, "metadata", "labels", "workflows.argoproj.io/phase"):
                continue

            request_phase = request_status_in_provisioner["metadata"]["labels"]["workflows.argoproj.io/phase"]
            if request_phase == "Running":
                continue
            elif request_phase == "Error" or request_phase == "Failed":
                # TODO: add resend logic here in the future
                continue
            elif request_phase == "Succeeded":
                # Call the callback URL to mark the product as Provisioned
                mark_provisioned_url = f"{mark_provisioned_url}/{licence_plate}/provision"
                kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
                access_token = kc.get_access_token()
                headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}
                response = requests.post(mark_provisioned_url, headers=headers, json={})

                if response.status_code != 200:
                    print(
                        f"Error while marking {licence_plate} as Provisioned: {response.status_code} - {response.reason}"
                    )
                else:
                    print(f"Marked {licence_plate} as Provisioned")

    except Exception as e:
        print(f"[fetch_products_mark_completed] Error: {e}")
