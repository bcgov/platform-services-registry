from _projects import get_mongo_db
from helm.tools.dags._msgraph import MsGraph


def sync_db_users_with_azure_ad(
    mongo_conn_id, ms_graph_api_tenant_id, ms_graph_api_client_id, ms_graph_api_client_secret
):
    try:
        db = get_mongo_db(mongo_conn_id)
        excluded_fields = {"image": 0, "ministry": 0, "lastseen": 0, "updatedAt": 0, "createdAt": 0}
        db_users = db.User.find({}, excluded_fields)

        ms_graph = MsGraph(ms_graph_api_tenant_id, ms_graph_api_client_id, ms_graph_api_client_secret)
        azure_users = ms_graph.get_azure_users()
        azure_emails = {u["mail"].lower(): u for u in azure_users if u["mail"]}

        for db_user in db_users:
            db_user_email = db_user["email"].lower()

            if db_user_email in azure_emails:
                azure_data = azure_emails[db_user_email]
                db.User.update_one(
                    {"_id": db_user["_id"]},
                    {
                        "$set": {
                            "officeLocation": azure_data["officeLocation"],
                            "jobTitle": azure_data["jobTitle"],
                            "upn": azure_data["userPrincipalName"],
                            "providerUserId": azure_data["id"],
                        }
                    },
                )
            else:
                db.User.update_one({"_id": db_user["_id"]}, {"$set": {"archived": False}})

    except Exception as e:
        print(f"[sync_users_in_db_and_azure_ad] Error: {e}")
