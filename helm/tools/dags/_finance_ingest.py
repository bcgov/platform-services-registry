"""Shared helper to trigger public-cloud finance ingest via the registry API."""

from __future__ import annotations

from datetime import datetime, timezone

import requests
from _keycloak import Keycloak

PROVIDERS = ("AWS_LZA", "AZURE")


def previous_complete_month(today: datetime) -> tuple[int, int]:
    year = today.year
    month = today.month - 1
    if month == 0:
        month = 12
        year -= 1
    return year, month


def trigger_finance_ingest(
    base_url: str,
    kc_auth_url: str,
    kc_realm: str,
    kc_client_id: str,
    kc_client_secret: str,
    use_simulated: bool = False,
):
    """
    Ingest the previous complete calendar month, plus any earlier FY months with no
    successful IngestionRun (so a failed night does not leave a permanent hole).
    """
    if not kc_client_id or not kc_client_secret:
        raise ValueError("Keycloak service account client id/secret are required for finance ingest")

    today = datetime.now(timezone.utc)
    year, month = previous_complete_month(today)

    kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
    access_token = kc.get_access_token()
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    session = requests.Session()
    missing_url = f"{base_url.rstrip('/')}/api/public-cloud/finance/ingest/missing"
    missing_response = session.get(
        missing_url,
        headers=headers,
        params={"year": year, "month": month},
        timeout=60,
    )
    missing_response.raise_for_status()
    plan = missing_response.json()

    results = []
    ingest_url = f"{base_url.rstrip('/')}/api/public-cloud/finance/ingest"
    for item in plan.get("providers", []):
        provider = item["provider"]
        for period in item.get("periods", [{"year": year, "month": month}]):
            response = session.post(
                ingest_url,
                headers=headers,
                json={
                    "provider": provider,
                    "year": period["year"],
                    "month": period["month"],
                    "useSimulated": use_simulated,
                },
                # Match the OpenShift route (600s). Estate-scope Azure fits; per-sub fallback does not.
                timeout=600,
            )
            results.append(
                {
                    "provider": provider,
                    "year": period["year"],
                    "month": period["month"],
                    "status": response.status_code,
                    "body": response.text[:500],
                }
            )
            response.raise_for_status()

    return results
