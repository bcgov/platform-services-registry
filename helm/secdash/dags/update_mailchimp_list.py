import mailchimp_marketing as MailchimpMarketing
from mailchimp_marketing.api_client import ApiClientError
from _utils import generate_md5_hash
from projects import get_mongo_db
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
            if project.get('projectOwnerId'):
                unique_ids.add(str(project['projectOwnerId']))
            if project.get('primaryTechnicalLeadId'):
                unique_ids.add(str(project['primaryTechnicalLeadId']))
            if project.get('secondaryTechnicalLeadId'):
                unique_ids.add(str(project['secondaryTechnicalLeadId']))

            unique_emails = []
            if unique_ids:
                user_criteria = {'_id': {'$in': [ObjectId(id) for id in unique_ids]}}
                user_projection = {'email': 1, '_id': 0}
                users = users_collection.find(user_criteria, user_projection)
                unique_emails = [user['email'] for user in users if 'email' in user]

        return unique_emails
    except Exception as e:
        print(f"[fetch_unique_emails] Error: {e}")
        return []


class MailchimpManager:
    def __init__(self, api_key, server_prefix, list_id, tag_id, mongo_conn_id):
        self.client = MailchimpMarketing.Client()
        self.client.set_config({
            "api_key": api_key,
            "server": server_prefix
        })
        self.list_id = list_id
        self.mongo_conn_id = mongo_conn_id
        self.tag_id = tag_id

    def add_emails_to_list(self, emails):
        operations = []
        for email in emails:
            operations.append({
                "method": "POST",
                "path": f"/lists/{self.list_id}/members",
                "body": json.dumps({
                    "email_address": email,
                    "status": "subscribed"
                })
            })

        try:
            response = self.client.batches.start({"operations": operations})
            print(f"Emails added to list: {response}")
        except ApiClientError as error:
            print(f"[add_emails_to_list] API Client Error: {error.text}")
        except Exception as e:
            print(f"[add_emails_to_list] General Error: {e}")

    def add_tag_to_emails(self, emails, tag_name):
        operations = []
        for email in emails:
            email_hash = generate_md5_hash(email)
            operations.append({
                "method": "POST",
                "path": f"/lists/{self.list_id}/members/{email_hash}/tags",
                "body": json.dumps({
                    "tags": [{"name": tag_name, "status": "active"}]
                })
            })

        try:
            response = self.client.batches.start({"operations": operations})
            print(f"Batch tag operation response: {response}")
        except ApiClientError as error:
            print(f"[add_tag_to_emails] API Client Error: {error.text}")
        except Exception as e:
            print(f"[add_tag_to_emails] General Error: {e}")

    def remove_tag_from_emails(self, emails, tag_name):
        operations = []
        for email in emails:
            email_hash = generate_md5_hash(email)
            operations.append({
                "method": "POST",
                "path": f"/lists/{self.list_id}/members/{email_hash}/tags",
                "body": json.dumps({
                    "tags": [{"name": tag_name, "status": "inactive"}]
                })
            })
        try:
            response = self.client.batches.start({"operations": operations})
            print(f"Batch remove tag operation response: {response}")
        except ApiClientError as error:
            print(f"[remove_tag_from_emails] API Client Error: {error.text}")
        except Exception as e:
            print(f"[remove_tag_from_emails] General Error: {e}")

    def get_all_members(self):
        members = []
        offset = 0
        count = 1000
        try:
            while True:
                response = self.client.lists.get_list_members_info(self.list_id, count=count, offset=offset)
                fetched_members = response.get('members', [])
                members.extend(fetched_members)
                if len(fetched_members) < count:
                    break
                offset += count
            return members
        except ApiClientError as error:
            print(f"[get_all_members] API Client Error: {error.text}")
            return []
        except Exception as e:
            print(f"[get_all_members] General Error: {e}")
            return []

    def filter_members_by_tag(self, tag_name):
        try:
            all_members = self.get_all_members()
            members_with_tag = [
                member for member in all_members
                if any(tag['name'].strip().lower() == tag_name.lower() for tag in member.get('tags', []))
            ]
            return members_with_tag
        except Exception as e:
            print(f"[filter_members_by_tag] Error: {e}")
            return []

    def get_tag_name_by_id(self):
        try:
            tags_data = self.client.lists.tag_search(self.list_id)
            for tag in tags_data['tags']:
                if tag['id'] == self.tag_id:
                    return tag

        except ApiClientError as error:
            print("Error: {}".format(error.text))
            return None

    def update_mailchimp_tag(self):
        try:
            # Fetch unique emails from MongoDB
            unique_emails = set(fetch_unique_emails(self.mongo_conn_id))
            if not unique_emails:
                print("No emails to update.")
                return

            # get tag name by tag ID
            tag_name = self.get_tag_name_by_id()['name']

            # Fetch all members and filter those who already have the tag
            current_tagged_members = self.filter_members_by_tag(tag_name)
            current_tagged_emails = {member['email_address'] for member in current_tagged_members}

            # Remove tags from all currently tagged members
            if current_tagged_emails:
                self.remove_tag_from_emails(current_tagged_emails, tag_name)

            # Add emails to the list if they are not already added
            self.add_emails_to_list(unique_emails)

            # Tag the necessary emails based on the database
            if unique_emails:
                self.add_tag_to_emails(unique_emails, tag_name)

            print("Mailchimp tag update process completed successfully.")
        except Exception as e:
            print(f"[update_mailchimp_tag] Error: {e}")


def update_mailchimp_segment(api_key, server_prefix, list_id, tag_id, mongo_conn_id):
    manager = MailchimpManager(api_key, server_prefix, list_id, tag_id, mongo_conn_id)
    manager.update_mailchimp_tag()
