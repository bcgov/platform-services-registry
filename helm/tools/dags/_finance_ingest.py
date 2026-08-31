"""Fetch Azure / AWS LZA billing in Airflow, then persist via the registry API."""

from __future__ import annotations

import time
from datetime import datetime, timezone

import requests
from _aws_cost_explorer import fetch_aws_cost_explorer_rows
from _azure_cost_query import fetch_azure_cost_query_pages
from _keycloak import Keycloak

PROVIDERS = ("AWS_LZA", "AZURE")
PERSIST_CONFLICT_STATUS = 409
PERSIST_CONFLICT_ATTEMPTS = 8


def previous_complete_month(today: datetime) -> tuple[int, int]:
    year = today.year
    month = today.month - 1
    if month == 0:
        month = 12
        year -= 1
    return year, month


def current_calendar_month(today: datetime) -> tuple[int, int]:
    return today.year, today.month


def _to_ingest_lines(rows: list[dict]) -> list[dict]:
    lines = []
    for row in rows:
        currency = str(row.get("currency") or "CAD").upper()
        if currency not in ("USD", "CAD"):
            raise RuntimeError(f"Unsupported billing currency: {currency}")
        lines.append(
            {
                "accountIdentifier": row["accountIdentifier"],
                "serviceLine": row["serviceLine"],
                "amount": row["amount"],
                "currency": currency,
            }
        )
    return lines


def _conflict_delay_seconds(response: requests.Response, attempt: int) -> float:
    retry_after = response.headers.get("retry-after")
    if retry_after:
        try:
            return min(float(retry_after), 30.0)
        except ValueError:
            pass
    return min(2**attempt, 30)


def post_ingest_lines(session: requests.Session, url: str, headers: dict, payload: dict, timeout: int = 120):
    """POST persist; retry 409 while another run holds the provider/month lock."""
    response = session.post(url, headers=headers, json=payload, timeout=timeout)
    for attempt in range(1, PERSIST_CONFLICT_ATTEMPTS):
        if response.status_code != PERSIST_CONFLICT_STATUS:
            return response
        time.sleep(_conflict_delay_seconds(response, attempt))
        response = session.post(url, headers=headers, json=payload, timeout=timeout)
    return response


def _fetch_provider_rows(provider: str, year: int, month: int) -> list[dict]:
    if provider == "AWS_LZA":
        return fetch_aws_cost_explorer_rows(year, month)
    if provider == "AZURE":
        return fetch_azure_cost_query_pages(year, month)
    raise RuntimeError(f"Classic AWS ingest is not supported for real billing data. Use AWS_LZA. Got {provider}.")


def _rows_or_fetch_failure(provider: str, year: int, month: int) -> tuple[list[dict] | None, str]:
    try:
        return _fetch_provider_rows(provider, year, month), ""
    except RuntimeError as error:
        if "no non-zero rows" in str(error):
            return [], ""
        return None, str(error)[:500]


def _ingest_provider_period(
    session: requests.Session,
    url: str,
    headers: dict,
    provider: str,
    year: int,
    month: int,
) -> dict:
    result = {
        "provider": provider,
        "year": year,
        "month": month,
        "status": "ok",
        "http_status": None,
        "body": "",
        "error": "",
    }
    rows, fetch_error = _rows_or_fetch_failure(provider, year, month)
    if rows is None:
        result["status"] = "fetch_failed"
        result["error"] = fetch_error
        return result
    try:
        lines = _to_ingest_lines(rows)
    except RuntimeError as error:
        result["status"] = "fetch_failed"
        result["error"] = str(error)[:500]
        return result
    response = post_ingest_lines(
        session,
        url,
        headers,
        {"provider": provider, "year": year, "month": month, "lines": lines},
    )
    result["http_status"] = response.status_code
    result["body"] = response.text[:500]
    if response.ok:
        return result
    result["status"] = "persist_failed"
    result["error"] = response.text[:500]
    return result


def _raise_if_provider_failures(results: list[dict]) -> None:
    failures = [row for row in results if row.get("status") != "ok"]
    if not failures:
        return
    summary = ", ".join(
        f"{row['provider']} {row['year']}-{row['month']}: {row.get('error') or row.get('status')}" for row in failures
    )
    raise RuntimeError(f"Finance ingest failed for {len(failures)} provider-month(s): {summary}"[:2000])


def months_inclusive(start_year: int, start_month: int, end_year: int, end_month: int) -> list[dict]:
    periods = []
    year, month = start_year, start_month
    while (year, month) <= (end_year, end_month):
        periods.append({"year": year, "month": month})
        month += 1
        if month == 13:
            month = 1
            year += 1
    return periods


def _dag_run_conf() -> dict:
    try:
        from airflow.sdk import get_current_context

        dag_run = get_current_context().get("dag_run")
        conf = getattr(dag_run, "conf", None) or {}
        return conf if isinstance(conf, dict) else {}
    except Exception:
        return {}


def backfill_periods(through_year: int, through_month: int, conf: dict | None = None) -> list[dict] | None:
    payload = conf if conf is not None else _dag_run_conf()
    start = payload.get("backfill_from") if isinstance(payload, dict) else None
    if not isinstance(start, dict) or "year" not in start or "month" not in start:
        return None
    return months_inclusive(int(start["year"]), int(start["month"]), through_year, through_month)


def trigger_finance_ingest(
    base_url: str,
    kc_auth_url: str,
    kc_realm: str,
    kc_client_id: str,
    kc_client_secret: str,
):
    """
    Ingest the current (partial) month and last complete month, plus any earlier FY
    months with no successful IngestionRun (so a failed night does not leave a hole).
    """
    if not kc_client_id or not kc_client_secret:
        raise ValueError("Keycloak service account client id/secret are required for finance ingest")

    today = datetime.now(timezone.utc)
    year, month = current_calendar_month(today)

    kc = Keycloak(kc_auth_url, kc_realm, kc_client_id, kc_client_secret)
    access_token = kc.get_access_token()
    headers = {"Authorization": f"Bearer {access_token}", "Content-Type": "application/json"}

    session = requests.Session()
    backfill = backfill_periods(year, month)
    if backfill:
        plan = {"providers": [{"provider": provider, "periods": backfill} for provider in PROVIDERS]}
    else:
        missing_url = f"{base_url.rstrip('/')}/api/public-cloud/finance/ingest/missing"
        missing_response = session.get(
            missing_url,
            headers=headers,
            timeout=60,
        )
        missing_response.raise_for_status()
        plan = missing_response.json()

    providers = plan.get("providers") if isinstance(plan, dict) else None
    if not isinstance(providers, list) or not providers:
        raise RuntimeError(f"Missing ingest plan has no providers: {plan!r}"[:500])

    results = []
    lines_url = f"{base_url.rstrip('/')}/api/public-cloud/finance/ingest/lines"
    for item in providers:
        provider = item["provider"]
        for period in item.get("periods", [{"year": year, "month": month}]):
            results.append(
                _ingest_provider_period(session, lines_url, headers, provider, period["year"], period["month"])
            )
    _raise_if_provider_failures(results)
    return results
