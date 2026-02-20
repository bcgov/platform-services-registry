import requests
from requests.exceptions import RequestException
from datetime import datetime, timedelta, timezone
from _projects import get_mongo_db
from _keycloak import Keycloak


# product_deletion_url_template example: "http://localhost:3000/api/private-cloud/products/{}archive"
def send_temp_products_deletion_request(
    kc_auth_url, kc_realm, kc_client_id, kc_client_secret, mongo_conn_id, product_deletion_url_template
):
    kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
    db = get_mongo_db(mongo_conn_id)

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    query = {"isTest": True, "status": "ACTIVE", "createdAt": {"$lt": thirty_days_ago}}
    print(f"Querying {query}...")
    projection = {
        "_id": False,
        "licencePlate": True,
        "createdAt": True,
        "temporaryProductNotificationDate": True,
    }
    projects = db.PrivateCloudProduct.find(query, projection=projection)

    access_token = kc.get_access_token()
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    success = 0
    failure = 0
    skipped = 0

    for project in projects:
        licence_plate = project.get("licencePlate")
        created_at = project.get("createdAt")
        notif_date = project.get("temporaryProductNotificationDate")

        print(f"Processing {licence_plate}... createdAt={created_at} temporaryProductNotificationDate={notif_date}")

        reqQuery = {"licencePlate": licence_plate, "active": True}
        activeCount = db.PrivateCloudRequest.count_documents(reqQuery)
        print(f"Active request count for {licence_plate}: {activeCount}")

        activeReq = db.PrivateCloudRequest.find_one(
            reqQuery,
            projection={
                "_id": True,
                "licencePlate": True,
                "active": True,
                "type": True,
                "decisionStatus": True,
                "actioned": True,
                "createdAt": True,
                "updatedAt": True,
                "cancelledAt": True,
                "projectId": True,
            },
        )

        if activeReq is None:
            print(f"Has an active request; skipping... activeReq={activeReq}")
            skipped += 1
            continue
        url = product_deletion_url_template.format(licence_plate)
        payload = {"requestComment": "auto-archive: older than 30 days, no active request"}
        print(f"Sending a request to {url}")

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=10)

            if response.status_code >= 400:
                print(f"Archive failed for {licence_plate}: " f"status={response.status_code} body={response.text}")
                try:
                    print(f"Archive failed JSON for {licence_plate}: {response.json()}")
                except Exception:
                    pass
                failure += 1
                continue

            print("Archive request successful.")
            success += 1

        except RequestException as err:
            print(f"Request exception for {licence_plate}: {err}")
            failure += 1

    return {"success": success, "failure": failure, "skipped": skipped}
