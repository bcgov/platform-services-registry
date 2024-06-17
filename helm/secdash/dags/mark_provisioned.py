import os
import requests
from pymongo import MongoClient
from bson.objectid import ObjectId


def fetch_products_mark_completed(provisioner_api_url, mark_provisioned_url, mongo_connection_url):
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
        client = MongoClient(mongo_connection_url)
        database = client["pltsvc"]
        requests_collection = database["PrivateCloudRequest"]
        requested_projects_collection = database["PrivateCloudRequestedProject"]

        product_requests = requests_collection.find({"decisionStatus": "APPROVED"}, projection={
                                                    "_id": True, "licencePlate": True, "decisionDataId": True})

        for request in product_requests:
            request_id = request["_id"]
            licence_plate = request["licencePlate"]
            decision_data_id = ObjectId(request["decisionDataId"])
            # a call to the RequestedProject table to get cluster
            requested_project_document = requested_projects_collection.find_one(
                {"_id": decision_data_id}, projection={"cluster": True})
            cluster = requested_project_document.get("cluster").lower()
            # start of provisioner logic
            workflow_name = f"{cluster}-{licence_plate}-{request_id}"
            provisioner_workflow_url = f"{provisioner_api_url}/{workflow_name}"
            request_status_in_provisioner = requests.get(provisioner_workflow_url).json()
            request_phase = request_status_in_provisioner['metadata']['labels']['workflows.argoproj.io/phase']
            if request_phase == "Running":
                continue
            elif request_phase == "Error" or request_phase == "Failed":
                # TODO: add resend logic here in the future
                continue
            elif request_phase == "Succeeded":
                # call the callback URL to mark the product Provisioned
                mark_finished_url = f"{mark_provisioned_url}/{licence_plate}"
                response = requests.put(mark_finished_url)
                if response.status_code != 200:
                    print(
                        f"Error while marking {licence_plate} as Provisioned: {response.status_code} - {response.reason}")

        client.close()

    except Exception as e:
        print(f"[fetch_products_mark_completed] Error: {e}")


def prepare_data_to_poll_provisioner(conn_id):
    """
    Fetches and assembles urls from environment variables and calls the function with fetching and marking logic.

    Parameter:
    - conn_id (str): used to find out which environment is needed (test or prod)
    """
    if conn_id == "pltsvc_test":
        provisioner_api_url = os.environ["TEST_PROVISIONER_URL"]
        mark_provisioned_url = os.environ["TEST_MARK_PROVISIONED_URL"]
        mongo_connection_url = os.environ["MONGO_URL_TEST"]

    elif conn_id == "pltsvc_prod":
        provisioner_api_url = os.environ["PROD_PROVISIONER_URL"]
        mark_provisioned_url = os.environ["PROD_MARK_PROVISIONED_URL"]
        mongo_connection_url = os.environ["MONGO_URL_PROD"]
    fetch_products_mark_completed(provisioner_api_url, mark_provisioned_url, mongo_connection_url)
