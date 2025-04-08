import requests


class Keycloak:
    def __init__(self, auth_server_url, realm, client_id, client_secret):
        self.auth_server_url = auth_server_url
        self.realm = realm
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = f"{auth_server_url}/realms/{realm}/protocol/openid-connect/token"

    def _request_token(self):
        payload = {"grant_type": "client_credentials", "client_id": self.client_id, "client_secret": self.client_secret}

        response = requests.post(self.token_url, data=payload)
        response.raise_for_status()
        return response.json()

    def get_access_token(self):
        token_data = self._request_token()
        return token_data.get("access_token", "")
