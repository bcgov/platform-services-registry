import requests


class Keycloak:
    def __init__(self, auth_server_url, realm, client_id, client_secret):
        self.auth_server_url = auth_server_url
        self.realm = realm
        self.client_id = client_id
        self.client_secret = client_secret
        self.token_url = f"{auth_server_url}/realms/{realm}/protocol/openid-connect/token"
        self.base_admin_url = f"{auth_server_url}/admin/realms/{realm}"
        self._access_token = None

    def _request_token(self):
        payload = {"grant_type": "client_credentials", "client_id": self.client_id, "client_secret": self.client_secret}
        response = requests.post(self.token_url, data=payload)
        response.raise_for_status()
        return response.json()

    def get_access_token(self):
        if not self._access_token:
            token_data = self._request_token()
            self._access_token = token_data.get("access_token", "")
        return self._access_token

    def _get_headers(self):
        return {"Authorization": f"Bearer {self.get_access_token()}", "Content-Type": "application/json"}

    def find_client_by_client_id(self, client_id):
        url = f"{self.base_admin_url}/clients?clientId={client_id}"
        response = requests.get(url, headers=self._get_headers())
        response.raise_for_status()
        clients = response.json()
        return clients[0] if clients else None

    def find_users_by_client_role(self, client_id, role_name):
        client = self.find_client_by_client_id(client_id)
        if not client or "id" not in client:
            return []

        role_users_url = f"{self.base_admin_url}/clients/{client['id']}/roles/{role_name}/users"

        response = requests.get(role_users_url, headers=self._get_headers())
        response.raise_for_status()
        return response.json()
