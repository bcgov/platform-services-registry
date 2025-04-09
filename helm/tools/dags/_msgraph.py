import requests
from urllib.parse import quote


class MsGraph:
    def __init__(self, tenant_id, client_id, client_secret):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        self.scope = "https://graph.microsoft.com/.default"
        self.access_token = self._get_access_token()
        self.extension_attribute = "extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID"  # pragma: allowlist secret

    def _get_access_token(self):
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": self.scope,
            "grant_type": "client_credentials",
        }
        response = requests.post(self.token_url, data=payload)
        response.raise_for_status()
        return response.json().get("access_token", "")

    def fetch_azure_user(self, matching_email, retry=True):
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "ConsistencyLevel": "eventual",
        }

        escaped_email = matching_email.replace("'", "''")
        filter_value = f"mail eq '{escaped_email}'"
        params = {
            "$filter": filter_value,
            "$select": f"officeLocation,jobTitle,userPrincipalName,id,displayName,givenName,surname,mail,onPremisesSamAccountName,{self.extension_attribute}",
            "$top": "1",
        }

        try:
            response = requests.get("https://graph.microsoft.com/v1.0/users", params=params, headers=headers)

            if response.status_code == 401 and retry:
                self.access_token = self._get_access_token()
                return self.fetch_azure_user(matching_email, retry=False)

            if response.status_code == 200:
                users = response.json().get("value", [])
            else:
                response.raise_for_status()
            return {**users[0], "idirGuid": users[0].get(self.extension_attribute)} if users else None

        except requests.exceptions.RequestException as e:
            raise Exception(f"Failed to fetch user: {str(e)}")
