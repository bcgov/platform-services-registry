"""Shared helper to trigger public-cloud finance ingest via the registry API."""

from __future__ import annotations

from datetime import datetime, timezone

import requests

PROVIDERS = ("AWS_LZA", "AZURE")


def trigger_finance_ingest(base_url: str, auth_header: str | None = None, use_simulated: bool = False):
    """
    Ingest the previous complete calendar month for each provider.
    Test/prod should call with use_simulated=False and real export/credentials configured on the app.
    Dev DAGs may pass use_simulated=True.
    """
    today = datetime.now(timezone.utc)
    year = today.year
    month = today.month - 1
    if month == 0:
        month = 12
        year -= 1

    session = requests.Session()
    headers = {"Content-Type": "application/json"}
    if auth_header:
        headers["Authorization"] = auth_header

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
