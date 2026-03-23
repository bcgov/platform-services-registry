import requests
from azure.identity import CertificateCredential


def decode_escaped_newlines(input_str: str) -> str:
    return input_str.replace("\\n", "\n")


class MsGraph:
    def __init__(self, tenant_id: str, client_id: str, client_secret=None, private_key=None, certificate=None):
        self.tenant_id = tenant_id
        self.client_id = client_id
        self.client_secret = client_secret
        self.private_key = private_key
        self.certificate = certificate
        self.token_url = f"https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token"
        self.scope = "https://graph.microsoft.com/.default"
        self.access_token = self._get_access_token()
        self.extension_attribute = "extension_85cc52e9286540fcb1f97ed86114a0e5_bcgovGUID"  # pragma: allowlist secret

    def _get_ms_graph_access_token_with_certificate(self) -> str:
        if (
            "BEGIN CERTIFICATE" not in self.certificate
            or "BEGIN PRIVATE KEY" not in self.private_key  # pragma: allowlist secret
        ):
            raise ValueError("Missing certificate or private key format")

        pem_combined = (
            f"{decode_escaped_newlines(self.certificate).strip()}\n{decode_escaped_newlines(self.private_key).strip()}"
        )
        credential = CertificateCredential(
            tenant_id=self.tenant_id, client_id=self.client_id, certificate_data=pem_combined.encode("utf-8")
        )

        token = credential.get_token(self.scope)
        return token.token

    def _get_ms_graph_access_token_with_secret(self) -> str:
        payload = {
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "scope": self.scope,
            "grant_type": "client_credentials",
        }
        response = requests.post(self.token_url, data=payload)
        response.raise_for_status()
        return response.json().get("access_token", "")

    def _get_access_token(self) -> str:
        if self.private_key and self.certificate:
            return self._get_ms_graph_access_token_with_certificate()
        elif self.client_secret:
            return self._get_ms_graph_access_token_with_secret()
        else:
            raise ValueError("Either certificate/private_key or client_secret must be provided.")

    def _get_headers(self):
        return {
            "Authorization": f"Bearer {self.access_token}",
            "ConsistencyLevel": "eventual",
        }

    def _get_select_fields(self):
        return (
            "officeLocation,jobTitle,userPrincipalName,id,displayName,"
            f"givenName,surname,mail,onPremisesSamAccountName,{self.extension_attribute}"
        )

    def _normalize_user(self, user):
        if not user:
            return None
        return {
            **user,
            "idirGuid": user.get(self.extension_attribute),
        }

    def _list_users(self, filter_value, retry=True):
        params = {
            "$filter": filter_value,
            "$select": self._get_select_fields(),
            "$top": "25",
        }

        try:
            response = requests.get(
                "https://graph.microsoft.com/v1.0/users",
                params=params,
                headers=self._get_headers(),
            )

            if response.status_code == 401 and retry:
                self.access_token = self._get_access_token()
                return self._list_users(filter_value, retry=False)

            response.raise_for_status()
            return response.json().get("value", [])

        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"Failed to fetch users: {str(e)}")

    def fetch_azure_user(self, matching_email, retry=True):
        escaped_email = matching_email.replace("'", "''")
        filter_value = f"mail eq '{escaped_email}'"

        users = self._list_users(filter_value, retry=retry)
        return self._normalize_user(users[0]) if users else None

    def list_azure_users_by_guid(self, idir_guid, retry=True):
        escaped_guid = idir_guid.replace("'", "''")
        filter_value = f"startswith({self.extension_attribute},'{escaped_guid}')"

        users = self._list_users(filter_value, retry=retry)
        return [self._normalize_user(user) for user in users]

    def fetch_azure_user_by_guid(self, idir_guid, retry=True):
        users = self.list_azure_users_by_guid(idir_guid, retry=retry)
        matching_users = [user for user in users if user.get("idirGuid") == idir_guid]
        return matching_users[0] if matching_users else None
