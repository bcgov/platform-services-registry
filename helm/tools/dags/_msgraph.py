import requests
from urllib.parse import quote


class MsGraph:
    def __init__(self, tenant_id, client_id, client_secret):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        self.scope = "https://graph.microsoft.com/.default"

    def _request_token(self):
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": self.scope,
            "grant_type": "client_credentials",
        }
        response = requests.post(self.token_url, data=payload)
        response.raise_for_status()
        return response.json()

    def _get_access_token(self):
        token_data = self._request_token()
        return token_data.get("access_token", "")

    def fetch_azure_user(self, matching_email):
        access_token = self._get_access_token()
        encoded_user_email = quote(f"'{matching_email}'")
        graph_url = (
            f"https://graph.microsoft.com/v1.0/users"
            f"?$filter=mail eq {encoded_user_email}"
            f"&$select=officeLocation,jobTitle,userPrincipalName,id,displayName,givenName,surname,mail"
        )
        headers = {
            "Authorization": f"Bearer {access_token}",
            "ConsistencyLevel": "eventual",
        }
        try:
            response = requests.get(graph_url, headers=headers)
            response.raise_for_status()
            users = response.json().get("value", [])
            return users[0] if users else None
        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch user: {str(e)}")
