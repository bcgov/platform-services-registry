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

        if not licence_plate or not decision_data_id:
            print(f"Skipping request {request_id}: missing licencePlate or decisionDataId")
            continue

        # a call to the RequestedProject table to get cluster
        requested_project_document = requested_projects_collection.find_one(
            {"_id": decision_data_id}, projection={"cluster": True}
        )
        if not requested_project_document or not requested_project_document.get("cluster"):
            print(f"Skipping request {request_id}: cluster not found")
            continue

        cluster = requested_project_document.get("cluster").lower()
        # start of provisioner logic
        workflow_name = f"{cluster}-{licence_plate}-{request_id}"
        provisioner_workflow_url = f"{provisioner_api_url}/{workflow_name}"

        try:
            resp = requests.get(provisioner_workflow_url, timeout=30)
            print(f"Provisioner URL: {provisioner_workflow_url}")
            print(f"Provisioner status: {resp.status_code}")
            print(f"Provisioner content-type: {resp.headers.get('Content-Type')}")
            print(f"Provisioner body preview: {resp.text[:500]!r}")

            resp.raise_for_status()

            if not resp.text.strip():
                print(f"Empty response from provisioner for workflow {workflow_name}")
                continue

            if "json" not in resp.headers.get("Content-Type", "").lower():
                print(
                    f"Non-JSON response from provisioner for workflow {workflow_name}: "
                    f"status={resp.status_code}, "
                    f"content_type={resp.headers.get('Content-Type')}, "
                    f"body={resp.text[:500]!r}"
                )
                continue

            request_status_in_provisioner = resp.json()
        except Exception as e:
            print(f"Failed to fetch workflow status for {workflow_name}: {e}")
            continue

        if not keys_exist(request_status_in_provisioner, "metadata", "labels", "workflows.argoproj.io/phase"):
            print(f"Workflow {workflow_name} missing phase label")
            continue

        request_phase = request_status_in_provisioner["metadata"]["labels"]["workflows.argoproj.io/phase"]
        if request_phase in ["Running", "Error", "Failed"]:
            continue

        if request_phase == "Succeeded":
            product_mark_url = f"{mark_provisioned_url}/{licence_plate}/provision"

            try:
                kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
                access_token = kc.get_access_token()
                headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

                response = requests.post(product_mark_url, headers=headers, json={}, timeout=30)

                print(f"Mark provisioned URL: {product_mark_url}")
                print(f"Mark provisioned status: {response.status_code}")
                print(f"Mark provisioned body preview: {response.text[:500]!r}")

                if response.status_code != 200:
                    print(
                        f"Error while marking {licence_plate} as Provisioned: "
                        f"{response.status_code} - {response.reason}"
                    )
                else:
                    print(f"Marked {licence_plate} as Provisioned")
            except Exception as e:
                print(f"Failed to mark {licence_plate} as Provisioned: {e}")
