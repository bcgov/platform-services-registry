from _projects import get_mongo_db
from helm.tools.dags._msgraph import MsGraph


def sync_db_users_with_azure_ad(
    mongo_conn_id, ms_graph_api_tenant_id, ms_graph_api_client_id, ms_graph_api_client_secret
):
    try:
        db = get_mongo_db(mongo_conn_id)
        users_collection = db["User"]
        projection = {"image": 0, "ministry": 0, "lastseen": 0, "updatedAt": 0, "createdAt": 0}
        db_users = users_collection.find({}, projection)

        ms_graph = MsGraph(ms_graph_api_tenant_id, ms_graph_api_client_id, ms_graph_api_client_secret)
        azure_users = ms_graph.get_azure_users()
        azure_users_with_email_as_key = {u["mail"].lower(): u for u in azure_users if u["mail"]}

        for db_user in db_users:
            db_user_email = db_user["email"].lower()

            if db_user_email in azure_users_with_email_as_key:
                azure_user_data = azure_users_with_email_as_key[db_user_email]
                valid_data_to_update = {
                    k: v
                    for k, v in {
                        "officeLocation": azure_user_data.get("officeLocation"),
                        "jobTitle": azure_user_data.get("jobTitle"),
                        "upn": azure_user_data.get("userPrincipalName"),
                        "providerUserId": azure_user_data.get("id"),
                    }.items()
                    if v is not None
                }
                if valid_data_to_update:
                    users_collection.update_one({"_id": db_user["_id"]}, {"$set": valid_data_to_update})
            else:
                users_collection.update_one({"_id": db_user["_id"]}, {"$set": {"archived": False}})

    except Exception as e:
        print(f"[sync_users_in_db_and_azure_ad] Error: {e}")
