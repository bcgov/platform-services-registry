import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
from _utils import generate_md5_hash
from _projects import get_mongo_db
from bson.objectid import ObjectId
import json


def fetch_unique_emails(mongo_conn_id):
    try:
        db = get_mongo_db(mongo_conn_id)
        projects_collection = db["PrivateCloudProject"]
        users_collection = db["User"]
        query = {"status": "ACTIVE"}
        projection = {"_id": 0, "projectOwnerId": 1, "primaryTechnicalLeadId": 1, "secondaryTechnicalLeadId": 1}
        projects = list(projects_collection.find(query, projection))

        unique_ids = set()
        for project in projects:
            if project.get("projectOwnerId"):
                unique_ids.add(str(project["projectOwnerId"]))
            if project.get("primaryTechnicalLeadId"):
                unique_ids.add(str(project["primaryTechnicalLeadId"]))
            if project.get("secondaryTechnicalLeadId"):
                unique_ids.add(str(project["secondaryTechnicalLeadId"]))

            unique_emails = []
            if unique_ids:
                user_criteria = {"_id": {"$in": [ObjectId(id) for id in unique_ids]}}
                user_projection = {"email": 1, "_id": 0}
                users = users_collection.find(user_criteria, user_projection)
                unique_emails = [user["email"] for user in users if "email" in user]

        return unique_emails
    except Exception as e:
        print(f"[fetch_unique_emails] Error: {e}")
        return []


class MailchimpManager:
    def __init__(self, api_key, server_prefix, list_id, tag_id, mongo_conn_id):
        self.client = MailchimpMarketing.Client()
        self.client.set_config({"api_key": api_key, "server": server_prefix})
        self.list_id = list_id
        self.mongo_conn_id = mongo_conn_id
        self.tag_id = tag_id

    def add_emails_to_list(self, emails):
        operations = []
        for email in emails:
            operations.append(
                {
                    "method": "POST",
                    "path": f"/lists/{self.list_id}/members",
                    "body": json.dumps({"email_address": email, "status": "subscribed"}),
                }
            )

        if len(operations) == 0:
            return None
        response = self.client.batches.start({"operations": operations})
        return response.get("id")

    def add_tag_to_emails(self, emails, tag_name):
        operations = []
        for email in emails:
            email_hash = generate_md5_hash(email)
            operations.append(
                {
                    "method": "POST",
                    "path": f"/lists/{self.list_id}/members/{email_hash}/tags",
                    "body": json.dumps({"tags": [{"name": tag_name, "status": "active"}]}),
                }
            )

        if len(operations) == 0:
            return None
        response = self.client.batches.start({"operations": operations})
        return response.get("id")

    def remove_tag_from_emails(self, emails, tag_name):
        operations = []
        for email in emails:
            email_hash = generate_md5_hash(email)
            operations.append(
                {
                    "method": "POST",
                    "path": f"/lists/{self.list_id}/members/{email_hash}/tags",
                    "body": json.dumps({"tags": [{"name": tag_name, "status": "inactive"}]}),
                }
            )

        if len(operations) == 0:
            return None
        response = self.client.batches.start({"operations": operations})
        return response.get("id")

    def wait_for_batch_complete(self, batch_id):
        if batch_id is None:
            return
        while True:
            response = self.client.batches.status(batch_id)
            status = response.get("status")
            print(f"batch status check: '{batch_id}' - '{status}'")
            if status == "finished":
                break

    def get_all_members(self):
        members = []
        offset = 0
        count = 1000

        while True:
            response = self.client.lists.get_list_members_info(
                self.list_id, count=count, offset=offset, fields=["members"]
            )
            fetched_members = response.get("members", [])
            members.extend(fetched_members)
            if len(fetched_members) < count:
                break
            offset += count

        return members

    def filter_members_by_tag(self, tag_name):
        all_members = self.get_all_members()
        members_with_tag = [
            member
            for member in all_members
            if any(tag["name"].strip().lower() == tag_name.lower() for tag in member.get("tags", []))
        ]

        return members_with_tag

    def get_tag_name_by_id(self):
        tags_data = self.client.lists.tag_search(self.list_id)
        for tag in tags_data["tags"]:
            if str(tag["id"]) == self.tag_id:
                return tag

        return None


def update_mailchimp_segment(api_key, server_prefix, list_id, tag_id, mongo_conn_id):
    mc = MailchimpManager(api_key, server_prefix, list_id, tag_id, mongo_conn_id)

    # Fetch unique emails from MongoDB
    unique_emails = list(set(fetch_unique_emails(mc.mongo_conn_id)))
    print(f"found {len(unique_emails)} emails.")
    if not unique_emails:
        print("No emails to update.")
        return

    # get tag name by tag ID
    tag_name = mc.get_tag_name_by_id()["name"]
    print(f"Tag name: {tag_name}")

    # Fetch all members and filter those who already have the tag
    current_tagged_members = mc.filter_members_by_tag(tag_name)
    print(f"The current tagged members: {len(current_tagged_members)}")

    current_tagged_emails = {member["email_address"] for member in current_tagged_members}

    # Remove tags from all currently tagged members
    batch_id = mc.remove_tag_from_emails(current_tagged_emails, tag_name)
    mc.wait_for_batch_complete(batch_id)
    print("'remove_tag_from_emails' completed")

    # Add emails to the list if they are not already added
    batch_id = mc.add_emails_to_list(unique_emails)
    mc.wait_for_batch_complete(batch_id)
    print("'add_emails_to_list' completed")

    # Tag the necessary emails based on the database
    batch_id = mc.add_tag_to_emails(unique_emails, tag_name)
    mc.wait_for_batch_complete(batch_id)
    print("'add_tag_to_emails' completed")

    print("Mailchimp tag update process completed successfully.")
