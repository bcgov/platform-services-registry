import os
import requests
from dags.projects import get_mongo_db


def fetch_products_mark_completed_prod(mongo_conn_id):
    """
    Fetches Approved Requests from MongoDB, makes call to the Provisioner by every of them
    and if parameter completed = true and phase = Succeeded, makes a call to callback URL.

    Parameters:
    - mongo_conn_id (str): The connection ID for MongoDB.

    Note: This function assumes the existence of a 'get_mongo_db' function.

    Raises:
    - Any exceptions that occur during the execution.
    """

    provisioner_url = os.environ["PROVISIONER_URL"] + "prod"
    mark_provisioned_url = os.environ["MARK_PROVISIONED_URL"]

    try:
        # Establish MongoDB connection
        db = get_mongo_db(mongo_conn_id)
        requests_collection = db["PrivateCloudRequest"]
        requested_projects_collection = db["PrivateCloudRequestedProject"]

        product_requests = requests_collection.find({"decisionStatus": "APPROVED"}, projection={
                                                    "_id": True, "licencePlate": True})

        for request in product_requests:
            request_id = request["_id"]
            licence_plate = request["licencePlate"]
            # call to the RequestedProject table to get cluster
            requested_project_document = requested_projects_collection.find_one(
                {"licencePlate": licence_plate}, projection={"cluster": True})
            cluster = requested_project_document.get("cluster").lower()
            # start of provisioner logic
            workflow_name = f"{cluster}-{licence_plate}-{request_id}"
            provisioner_workflow_url = provisioner_url + workflow_name
            request_status_in_provisioner = requests.get(provisioner_workflow_url).json()
            request_phase = request_status_in_provisioner['metadata']['labels']['workflows.argoproj.io/phase']
            if request_phase != "Running" and 'workflows.argoproj.io/completed' in request_status_in_provisioner['metadata']['labels']:
                request_completed = request_status_in_provisioner['metadata']['labels']['workflows.argoproj.io/completed']

                if request_phase == "Error":
                    pass
                    # add a notification here. UPD: we already have one in Provisioner channel
                elif request_phase == "Succeeded" and request_completed == "true":
                    # call the callback URL to mark the product Provisioned
                    mark_provisioned_url = f"{mark_provisioned_url}{licence_plate}"
                    response = requests.put(mark_provisioned_url)
                    if response.status_code != 200:
                        print(
                            f"Error while marking {licence_plate} as Provisioned: {response.status_code} - {response.reason}")

    except Exception as e:
        print(f"[fetch_products_mark_completed] Error: {e}")
