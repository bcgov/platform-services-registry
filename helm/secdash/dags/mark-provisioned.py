import os
import requests
from pymongo import MongoClient


def fetch_products_mark_completed(provisioner_api_url, mark_provisioned_url, mongo_connection_url, env_id):
    """
    Fetches Approved Requests from MongoDB, makes call to the Provisioner by every of them
    and if labels completed = true and phase = Succeeded, makes a call to callback URL.

    Parameters:
    - provisioner_api_url (str): The url for provisioner API that returns the workflow status
    - mark_provisioned_url (str): The url to Registry App API that marks Product as Completed
    - mongo_connection_url (str): The connection string to Registry App DB to fetch products in 'Approved' state
    - env_id (str): The name of the environment (prod or test) to filter out non-lab clusters in test

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
                                                    "_id": True, "licencePlate": True})

        for request in product_requests:
            request_id = request["_id"]
            licence_plate = request["licencePlate"]
            # a call to the RequestedProject table to get cluster
            requested_project_document = requested_projects_collection.find_one(
                {"licencePlate": licence_plate}, projection={"cluster": True})
            cluster = requested_project_document.get("cluster").lower()

            if env_id == "prod" or env_id == "test" and "lab" in cluster:

                # start of provisioner logic
                workflow_name = f"{cluster}-{licence_plate}-{request_id}"
                provisioner_workflow_url = provisioner_api_url + workflow_name
                request_status_in_provisioner = requests.get(provisioner_workflow_url).json()
                request_phase = request_status_in_provisioner['metadata']['labels']['workflows.argoproj.io/phase']
                if request_phase != "Running" and 'workflows.argoproj.io/completed' in request_status_in_provisioner['metadata']['labels']:
                    request_completed = request_status_in_provisioner['metadata']['labels']['workflows.argoproj.io/completed']
                    if request_phase == "Error":
                        pass
                        # add a notification here. UPD: we already have one in Provisioner channel
                    elif request_phase == "Succeeded" and request_completed == "true":
                        # call the callback URL to mark the product Provisioned
                        mark_finished_url = f"{mark_provisioned_url}{licence_plate}"
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
        provisioner_api_url = os.environ["PROVISIONER_URL"][:23] + \
            "-test" + os.environ["PROVISIONER_URL"][23:] + "test/"
        mark_provisioned_url = os.environ["MARK_PROVISIONED_URL"][:8] + "test-" + os.environ["MARK_PROVISIONED_URL"][8:]
        mongo_connection_url = os.environ["MONGO_URL_TEST"]
        env_id = "test"

    elif conn_id == "pltsvc_prod":
        provisioner_api_url = os.environ["PROVISIONER_URL"]+"prod/"
        mark_provisioned_url = os.environ["MARK_PROVISIONED_URL"]
        mongo_connection_url = os.environ["MONGO_URL_PROD"]
        env_id = "prod"

    fetch_products_mark_completed(provisioner_api_url, mark_provisioned_url, mongo_connection_url, env_id)
