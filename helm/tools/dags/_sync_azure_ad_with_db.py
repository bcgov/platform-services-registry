from _projects import get_mongo_db
from _msgraph import MsGraph


def parse_ministry_from_display_name(display_name: str):
    ministry = ""
    if display_name and len(display_name) > 0:
        divided_string = display_name.split()
        if len(divided_string) >= 2:
            ministry = divided_string[-1].split(":", 1)[0]
    return ministry


def archive_user(users_collection, user_id, email, reason, archived_report):
    users_collection.update_one(
        {"_id": user_id},
        {"$set": {"archived": True}},
    )
    archived_report.append(
        {
            "id": str(user_id),
            "email": email,
            "reason": reason,
        }
    )


def report_invalid_guid(invalid_guid_report, user_id, email, bad_idir_guid):
    invalid_guid_report.append(
        {
            "id": str(user_id),
            "email": email,
            "bad_idirGuid": bad_idir_guid,
        }
    )


def report_fixed_guid(fixed_guid_report, user_id, email, old_idir_guid, new_idir_guid):
    fixed_guid_report.append(
        {
            "id": str(user_id),
            "email": email,
            "old_idirGuid": old_idir_guid,
            "new_idirGuid": new_idir_guid,
        }
    )


def fetch_azure_user(ms_graph, db_user_email, db_user_guid, is_idir_guid_valid):
    if is_idir_guid_valid is False:
        if not db_user_email:
            return None
        return ms_graph.fetch_azure_user(db_user_email)

    if db_user_guid:
        return ms_graph.fetch_azure_user_by_guid(db_user_guid)

    if db_user_email:
        return ms_graph.fetch_azure_user(db_user_email)

    return None


def get_archive_reason(is_idir_guid_valid, db_user_email, db_user_guid):
    if is_idir_guid_valid is False and not db_user_email:
        return "Invalid idirGuid and missing email"

    if is_idir_guid_valid is False:
        return "Invalid idirGuid and email not found in Azure"

    if db_user_guid:
        return "Valid-looking idirGuid not found in Azure"

    if db_user_email:
        return "No idirGuid and email not found in Azure"

    return "Missing idirGuid and email"


def build_update_data(azure_user, db_user_email, db_user_guid):
    azure_guid = azure_user.get("idirGuid")

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
        "email": (azure_user.get("mail") or db_user_email).lower(),
        "idirGuid": azure_guid or db_user_guid,
        "idir": azure_user.get("onPremisesSamAccountName", ""),
    }

    return {k: v for k, v in update_data.items() if v is not None}


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

    invalid_guid_report = []
    fixed_guid_report = []
    archived_report = []

    for db_user in db_users:
        db_user_id = db_user["_id"]
        db_user_email = db_user.get("email", "").lower()
        db_user_guid = db_user.get("idirGuid")
        is_idir_guid_valid = db_user.get("isGuidValid", True)

        if is_idir_guid_valid is False:
            report_invalid_guid(
                invalid_guid_report,
                db_user_id,
                db_user_email,
                db_user_guid,
            )

        azure_user = fetch_azure_user(
            ms_graph,
            db_user_email,
            db_user_guid,
            is_idir_guid_valid,
        )

        if azure_user is None:
            archive_user(
                users_collection,
                db_user_id,
                db_user_email,
                get_archive_reason(
                    is_idir_guid_valid,
                    db_user_email,
                    db_user_guid,
                ),
                archived_report,
            )
            continue

        azure_guid = azure_user.get("idirGuid")
        update_data = build_update_data(azure_user, db_user_email, db_user_guid)

        if is_idir_guid_valid is False and azure_guid:
            update_data["isGuidValid"] = True
            report_fixed_guid(
                fixed_guid_report,
                db_user_id,
                db_user_email,
                db_user_guid,
                azure_guid,
            )

        users_collection.update_one(
            {"_id": db_user_id},
            {"$set": update_data},
        )

    print("\nUsers with invalid idirGuid:")
    for user in invalid_guid_report:
        print(user)

    print("\nUsers fixed:")
    for user in fixed_guid_report:
        print(user)

    print("\nUsers archived:")
    for user in archived_report:
        print(user)

    print(f"\nTotal invalid idirGuid users: {len(invalid_guid_report)}")
    print(f"Total fixed idirGuid users: {len(fixed_guid_report)}")
    print(f"Total archived users: {len(archived_report)}")
