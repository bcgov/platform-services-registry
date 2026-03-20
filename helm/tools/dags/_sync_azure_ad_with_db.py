from _projects import get_mongo_db
from _msgraph import MsGraph


def parse_ministry_from_display_name(display_name: str):
    ministry = ""
    if display_name and len(display_name) > 0:
        divided_string = display_name.split()
        if len(divided_string) >= 2:
            ministry = divided_string[-1].split(":", 1)[0]
    return ministry


def sync_db_users_with_azure_ad(
    mongo_conn_id,
    ms_graph_api_tenant_id,
    ms_graph_api_client_id,
    ms_graph_api_client_private_key,
    ms_graph_api_client_certificate,
):
    db = get_mongo_db(mongo_conn_id)
    projection = {"image": 0, "lastseen": 0, "updatedAt": 0, "createdAt": 0}
    users_collection = db["User"]
    db_users = users_collection.find({"archived": {"$eq": False}}, projection)

    ms_graph = MsGraph(
        ms_graph_api_tenant_id,
        ms_graph_api_client_id,
        private_key=ms_graph_api_client_private_key,
        certificate=ms_graph_api_client_certificate,
    )

    for db_user in db_users:
        db_user_id = db_user["_id"]
        db_user_email = db_user["email"].lower()
        db_user_guid = db_user.get("idirGuid")
        azure_user = None

        if db_user_guid:
            azure_user = ms_graph.fetch_azure_user_by_guid(db_user_guid)

            if azure_user is None:
                users_collection.update_one(
                    {"_id": db_user_id},
                    {"$set": {"archived": True}},
                )
                continue

        elif db_user_email:
            azure_user = ms_graph.fetch_azure_user(db_user_email)

            if azure_user is None:
                users_collection.update_one(
                    {"_id": db_user_id},
                    {"$set": {"archived": True}},
                )
                continue

        else:
            users_collection.update_one(
                {"_id": db_user_id},
                {"$set": {"archived": True}},
            )
            continue

        update_data = {
            "officeLocation": azure_user.get("officeLocation", ""),
            "jobTitle": azure_user.get("jobTitle", ""),
            "upn": azure_user.get("userPrincipalName", ""),
            "providerUserId": azure_user.get("id", ""),
            "ministry": parse_ministry_from_display_name(
                azure_user.get("displayName", ""),
            ),
            "firstName": azure_user.get("givenName", ""),
            "lastName": azure_user.get("surname", ""),
            "email": azure_user.get("mail", "").lower(),
            "idirGuid": azure_user.get("idirGuid", ""),
            "idir": azure_user.get("onPremisesSamAccountName", ""),
        }

        update_data = {k: v for k, v in update_data.items() if v is not None}

        users_collection.update_one({"_id": db_user["_id"]}, {"$set": update_data})
