"""Azure Cost Management estate query for finance ingest. Requires FINANCE_AZURE_COST_SCOPE."""

from __future__ import annotations

import os
import re
import time
from datetime import datetime, timezone

import requests

from _aws_cost_explorer import period_bounds

AZURE_COST_MANAGEMENT_SCOPE = "https://management.azure.com/.default"
AZURE_COST_QUERY_API_VERSION = "2023-11-01"
AZURE_COST_QUERY_CLIENT_TYPE = "bcgov-platform-services-registry"
RETRYABLE_STATUS = {408, 429, 502, 503, 504}
SCOPE_FAIL_STATUS = {400, 401, 403, 404}
MAX_ATTEMPTS = 8


_SUBSCRIPTION_ID = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.I)


def azure_cost_scope_from_env() -> str:
    raw = (os.getenv("FINANCE_AZURE_COST_SCOPE") or "").strip()
    if not raw:
        return ""
    if raw.startswith("/"):
        return raw
    if raw.startswith(("providers/", "subscriptions/")):
        return f"/{raw}"
    if _SUBSCRIPTION_ID.match(raw):
        return f"/subscriptions/{raw}"
    return f"/providers/Microsoft.Management/managementGroups/{raw}"


def azure_cost_query_url(scope_path: str) -> str:
    scope = scope_path if scope_path.startswith("/") else f"/{scope_path}"
    return (
        f"https://management.azure.com{scope}/providers/Microsoft.CostManagement/query"
        f"?api-version={AZURE_COST_QUERY_API_VERSION}"
    )


def azure_cost_query_body(year: int, month: int, now: datetime | None = None) -> dict:
    start, _end, end_day = period_bounds(year, month)
    today = now or datetime.now(timezone.utc)
    if year == today.year and month == today.month:
        end_day = f"{today.year}-{today.month:02d}-{today.day:02d}"
    return {
        "type": "ActualCost",
        "timeframe": "Custom",
        "timePeriod": {"from": f"{start}T00:00:00Z", "to": f"{end_day}T23:59:59Z"},
        "dataset": {
            "granularity": "None",
            "aggregation": {"totalCost": {"name": "Cost", "function": "Sum"}},
            "grouping": [
                {"type": "Dimension", "name": "SubscriptionId"},
                {"type": "Dimension", "name": "ServiceName"},
            ],
        },
    }


def _column_index(columns: list[str], *names: str) -> int:
    wanted = {name.lower() for name in names}
    for index, column in enumerate(columns):
        if column.lower() in wanted:
            return index
    return -1


def _payload_table(payload: dict) -> tuple[list[str], list, str | None]:
    properties = payload.get("properties") or {}
    columns = [str(col.get("name") or "") for col in (properties.get("columns") or []) if isinstance(col, dict)]
    next_link = properties.get("nextLink") or payload.get("nextLink")
    payload_rows = properties.get("rows") or []
    return columns, payload_rows, next_link if isinstance(next_link, str) and next_link else None


def _require_azure_query_columns(
    payload_rows: list,
    cost_idx: int,
    service_idx: int,
    currency_idx: int,
    subscription_idx: int,
) -> None:
    if not payload_rows:
        return
    missing = [
        name
        for name, index in (
            ("Cost", cost_idx),
            ("ServiceName", service_idx),
            ("Currency", currency_idx),
            ("SubscriptionId", subscription_idx),
        )
        if index < 0
    ]
    if missing:
        raise RuntimeError(f"Azure Cost Management response is missing required column(s): {', '.join(missing)}.")


def _cell(row: list, index: int, default: object = "") -> object:
    return row[index] if index >= 0 else default


def _azure_row_from_cells(
    row: object,
    cost_idx: int,
    service_idx: int,
    subscription_idx: int,
    currency_idx: int,
    year: int,
    month: int,
) -> dict | None:
    if not isinstance(row, list):
        return None
    amount = float(_cell(row, cost_idx, 0))
    service_line = str(_cell(row, service_idx))
    account_identifier = str(_cell(row, subscription_idx))
    currency = str(_cell(row, currency_idx)).strip()
    if not account_identifier or not service_line or amount == 0 or not currency:
        return None
    return {
        "accountIdentifier": account_identifier,
        "serviceLine": service_line,
        "amount": amount,
        "currency": currency,
        "year": year,
        "month": month,
    }


def parse_azure_cost_query_payload(payload: dict, year: int, month: int) -> tuple[list[dict], str | None]:
    columns, payload_rows, next_link = _payload_table(payload)
    cost_idx = _column_index(columns, "Cost", "PreTaxCost")
    service_idx = _column_index(columns, "ServiceName")
    currency_idx = _column_index(columns, "Currency")
    subscription_idx = _column_index(columns, "SubscriptionId", "SubscriptionID")
    _require_azure_query_columns(payload_rows, cost_idx, service_idx, currency_idx, subscription_idx)

    rows: list[dict] = []
    for row in payload_rows:
        parsed = _azure_row_from_cells(row, cost_idx, service_idx, subscription_idx, currency_idx, year, month)
        if parsed:
            rows.append(parsed)
    return rows, next_link


def _retry_delay_seconds(response: requests.Response, attempt: int) -> float:
    retry_after_ms = response.headers.get("retry-after-ms")
    if retry_after_ms:
        try:
            return min(float(retry_after_ms) / 1000.0, 60.0)
        except ValueError:
            pass
    retry_after = response.headers.get("retry-after")
    if retry_after:
        try:
            return min(float(retry_after), 60.0)
        except ValueError:
            pass
    if response.status_code == 429:
        return min(10.0 * (2 ** (attempt - 1)), 60.0)
    return min(2 ** (attempt - 1), 30.0)


def _azure_access_token() -> str:
    passed = (os.getenv("AZURE_ACCESS_TOKEN") or "").strip()
    if passed:
        return passed
    tenant = os.getenv("AZURE_TENANT_ID")
    client_id = os.getenv("AZURE_CLIENT_ID")
    secret = os.getenv("AZURE_CLIENT_SECRET")
    if not tenant or not client_id or not secret:
        raise RuntimeError(
            "Unable to acquire an Azure management token. Configure AZURE_CLIENT_ID / AZURE_TENANT_ID / AZURE_CLIENT_SECRET."
        )
    from azure.identity import ClientSecretCredential

    credential = ClientSecretCredential(tenant_id=tenant, client_id=client_id, client_secret=secret)
    token = credential.get_token(AZURE_COST_MANAGEMENT_SCOPE)
    if not token or not token.token:
        raise RuntimeError("Unable to acquire an Azure management token.")
    return token.token


def _raise_azure_query_failure(response: requests.Response) -> None:
    status = response.status_code
    detail = response.text[:500]
    if status in SCOPE_FAIL_STATUS:
        raise RuntimeError(
            f"Azure estate cost scope is unavailable ({status}). Refusing per-subscription fallback. {detail}"
        )
    raise RuntimeError(f"Azure Cost Management query failed ({status}): {detail}")


def _post_azure_cost_query(url: str, access_token: str, body: dict) -> requests.Response:
    response = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        response = requests.post(
            url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
                "ClientType": AZURE_COST_QUERY_CLIENT_TYPE,
            },
            json=body,
            timeout=120,
        )
        if response.ok or response.status_code not in RETRYABLE_STATUS or attempt == MAX_ATTEMPTS:
            break
        time.sleep(_retry_delay_seconds(response, attempt))

    if response is None:
        raise RuntimeError("Azure Cost Management query produced no response.")
    if not response.ok:
        _raise_azure_query_failure(response)
    return response


def fetch_azure_cost_query_pages(year: int, month: int) -> list[dict]:
    scope = azure_cost_scope_from_env()
    if not scope:
        raise RuntimeError("FINANCE_AZURE_COST_SCOPE is required for estate Azure ingest.")

    access_token = _azure_access_token()
    body = azure_cost_query_body(year, month)
    url = azure_cost_query_url(scope)
    rows: list[dict] = []

    while url:
        response = _post_azure_cost_query(url, access_token, body)
        page_rows, next_link = parse_azure_cost_query_payload(response.json(), year, month)
        rows.extend(page_rows)
        url = next_link or ""

    if not rows:
        raise RuntimeError(f"Azure Cost Management returned no non-zero rows for {year}-{month}.")
    return rows
