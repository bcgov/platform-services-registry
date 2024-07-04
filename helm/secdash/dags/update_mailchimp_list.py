from bson.objectid import ObjectId
import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
import json
import hashlib
from projects import get_mongo_db


def fetch_unique_emails(mongo_conn_id):
    try:
        db = get_mongo_db(mongo_conn_id)
        projects_collection = db["PrivateCloudProject"]
        users_collection = db["User"]

        projects = projects_collection.find({"status": "ACTIVE"})

        unique_emails = set()

        for project in projects:
            project_owner_id = project.get("projectOwnerId")
            if project_owner_id:
                project_owner = users_collection.find_one({"_id": ObjectId(project_owner_id)})
                if project_owner:
                    email = project_owner.get('email')
                    if email:
                        unique_emails.add(email)

            primary_technical_lead_id = project.get("primaryTechnicalLeadId")
            if primary_technical_lead_id:
                primary_technical_lead = users_collection.find_one({"_id": ObjectId(primary_technical_lead_id)})
                if primary_technical_lead:
                    email = primary_technical_lead.get("email")
                    if email:
                        unique_emails.add(email)

            secondary_technical_lead_id = project.get("secondaryTechnicalLeadId")
            if secondary_technical_lead_id:
                secondary_technical_lead = users_collection.find_one({"_id": ObjectId(secondary_technical_lead_id)})
                if secondary_technical_lead:
                    email = secondary_technical_lead.get("email")
                    if email:
                        unique_emails.add(email)

        return list(unique_emails)

    except Exception as e:
        print(f"[fetch_unique_emails] Error: {e}")
        return []


def add_emails_to_list(client, list_id, emails):
    try:
        operations = []
        for email in emails:
            operations.append({
                "method": "POST",
                "path": f"/lists/{list_id}/members",
                "body": json.dumps({
                    "email_address": email,
                    "status": "subscribed"
                })
            })

        response = client.batches.start({"operations": operations})
        print(f"Emails added to list: {response}")
    except ApiClientError as error:
        print(f"[add_emails_to_list] Error: {error}")


def add_tag_to_emails(client, list_id, tag_name, emails):
    try:
        member_hashes = [hashlib.md5(email.lower().encode('utf-8')).hexdigest() for email in emails]
        print(f"Generated member hashes: {member_hashes}")

        members_to_tag = [{"email_address": email, "email_hash": member_hash}
                          for email, member_hash in zip(emails, member_hashes)]
        print(f"Members to tag: {members_to_tag}")

        batch_data = {
            "operations": []
        }

        for member in members_to_tag:
            operation = {
                "method": "POST",
                "path": f"/lists/{list_id}/members/{member['email_hash']}/tags",
                "body": json.dumps({
                    "tags": [{"name": tag_name, "status": "active"}]
                })
            }
            batch_data["operations"].append(operation)

        response = client.batches.start(batch_data)
        print(f"Batch tag operation response: {response}")
    except ApiClientError as error:
        print(f"[add_tag_to_emails] Error: {error.text}")


def get_all_members(client, list_id):
    members = []
    offset = 0
    count = 2000

    while True:
        response = client.lists.get_list_members_info(list_id, count=count, offset=offset)
        fetched_members = response.get('members', [])
        members.extend(fetched_members)

        if len(fetched_members) < count:
            break

        offset += count

    return members


def filter_members_by_tag(client, list_id, tag_name):
    members = get_all_members(client, list_id)
    members_with_tag = [member for member in members if any(tag['name'] == tag_name for tag in member.get('tags', []))]
    return members_with_tag


def remove_tag_from_emails(client, list_id, tag_name, emails):
    try:
        member_hashes = [hashlib.md5(email.lower().encode('utf-8')).hexdigest() for email in emails]
        print(f"Generated member hashes: {member_hashes}")

        members_to_remove_tag = [{"email_address": email, "email_hash": member_hash}
                                 for email, member_hash in zip(emails, member_hashes)]
        print(f"Members to remove tag from: {members_to_remove_tag}")

        batch_data = {
            "operations": []
        }

        for member in members_to_remove_tag:
            operation = {
                "method": "POST",
                "path": f"/lists/{list_id}/members/{member['email_hash']}/tags",
                "body": json.dumps({
                    "tags": [{"name": tag_name, "status": "inactive"}]
                })
            }
            batch_data["operations"].append(operation)

        response = client.batches.start(batch_data)
        print(f"Batch remove tag operation response: {response}")
    except ApiClientError as error:
        print(f"[remove_tag_from_emails] Error: {error.text}")


def update_mailchimp_tag(api_key, server_prefix, list_id, tag_name, mongo_conn_id):
    client = MailchimpMarketing.Client()
    client.set_config({
        "api_key": api_key,
        "server": server_prefix
    })

    emails_db = fetch_unique_emails(mongo_conn_id)
    add_emails_to_list(client, list_id, emails_db)

    members = filter_members_by_tag(client, list_id, tag_name)
    emails_mailchimp = [member['email_address'] for member in members]

    remove_tag_from_emails(client, list_id, tag_name, emails_mailchimp)
    add_tag_to_emails(client, list_id, tag_name, emails_db)
