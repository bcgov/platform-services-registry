import requests
from datetime import datetime, timedelta, timezone
from _projects import get_mongo_db
from _keycloak import Keycloak


# product_deletion_url_template example: "http://localhost:3000/api/private-cloud/products/{}"
def send_temp_products_deletion_request(
    kc_auth_url, kc_realm, kc_client_id, kc_client_secret, mongo_conn_id, product_deletion_url_template
):
    kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
    db = get_mongo_db(mongo_conn_id)

    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    query = {"isTest": True, "createdAt": {"$lt": thirty_days_ago}}
    projection = {"_id": False, "licencePlate": True}
    projects = db.PrivateCloudProject.find(query, projection=projection)

    access_token = kc.get_access_token()
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    for project in projects:
        licence_plate = project.get("licencePlate")
        print(f"Processing {licence_plate}...")
        url = product_deletion_url_template.format(licence_plate)
        response = requests.delete(url, headers=headers)
        response.raise_for_status()

    return {"status": "success", "deleted_count": projects.count()}
