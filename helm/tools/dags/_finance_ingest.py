"""Shared helper to trigger public-cloud finance ingest via the registry API."""

from __future__ import annotations

from datetime import datetime, timezone

import requests
from _keycloak import Keycloak

PROVIDERS = ("AWS_LZA", "AZURE")


def trigger_finance_ingest(
    base_url: str,
    kc_auth_url: str,
    kc_realm: str,
    kc_client_id: str,
    kc_client_secret: str,
    use_simulated: bool = False,
):
    """
    Ingest the previous complete calendar month for each provider.

    Authenticates with Keycloak client_credentials (team service account),
    same pattern as provisioner / temporary-products DAGs.
    Test/prod should call with use_simulated=False and real billing credentials
    configured on the app. Dev DAGs may pass use_simulated=True.
    """
    if not kc_client_id or not kc_client_secret:
        raise ValueError("Keycloak service account client id/secret are required for finance ingest")

    today = datetime.now(timezone.utc)
    year = today.year
    month = today.month - 1
    if month == 0:
        month = 12
        year -= 1

    kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
    access_token = kc.get_access_token()
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    session = requests.Session()
    results = []
    for provider in PROVIDERS:
        url = f"{base_url.rstrip('/')}/api/public-cloud/finance/ingest"
        response = session.post(
            url,
            headers=headers,
            json={
                "provider": provider,
                "year": year,
                "month": month,
                "useSimulated": use_simulated,
            },
            timeout=300,
        )
        results.append({"provider": provider, "status": response.status_code, "body": response.text[:500]})
        response.raise_for_status()

    return results
