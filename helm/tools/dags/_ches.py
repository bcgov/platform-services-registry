import requests
from _keycloak import Keycloak
from _utils import safe_strings


class Ches:
    def __init__(self, ches_api_url, kc_auth_url, kc_realm, kc_client_id, kc_client_secret):
        self.ches_email_url = f"{ches_api_url}/api/v1/email"
        self.kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)

    def send_email(self, email: dict):
        # Check for required fields
        if "subject" not in email or not email["subject"]:
            raise ValueError("The 'subject' field is required.")
        if "body" not in email or not email["body"]:
            raise ValueError("The 'body' field is required.")
        if "to" not in email or not email["to"]:
            raise ValueError("The 'to' field is required.")

        access_token = self.kc.get_access_token()
        headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

        payload = {
            "bodyType": email.get("bodyType", "html"),
            "from": email.get("from", "Registry <PlatformServicesTeam@gov.bc.ca>"),
            "subject": email["subject"],
            "body": email["body"],
            "to": safe_strings(email.get("to")),
            "bcc": safe_strings(email.get("bcc", [])),
            "cc": safe_strings(email.get("cc", [])),
            "delayTS": email.get("delayTS", 0),
            "encoding": email.get("encoding", "utf-8"),
            "priority": email.get("priority", "normal"),
            "tag": email.get("tag", ""),
        }

        response = requests.post(self.ches_email_url, json=payload, headers=headers)
        response.raise_for_status()
        return response.json()
