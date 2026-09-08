"""AWS LZA Cost Explorer fetch for finance ingest. Estate query; us-east-1 only."""

from __future__ import annotations

import calendar
import os

AWS_LINKED_ACCOUNT_CHUNK = 100


def period_bounds(year: int, month: int) -> tuple[str, str, str]:
    start = f"{year}-{month:02d}-01"
    if month == 12:
        end = f"{year + 1}-01-01"
    else:
        end = f"{year}-{month + 1:02d}-01"
    last_day = calendar.monthrange(year, month)[1]
    end_day = f"{year}-{month:02d}-{last_day:02d}"
    return start, end, end_day


def chunk_linked_account_ids(account_ids: list[str] | None) -> list[list[str] | None]:
    if account_ids is None:
        return [None]
    if len(account_ids) == 0:
        return []
    return [account_ids[i : i + AWS_LINKED_ACCOUNT_CHUNK] for i in range(0, len(account_ids), AWS_LINKED_ACCOUNT_CHUNK)]


def _row_from_cost_group(group: dict, year: int, month: int) -> dict | None:
    keys = group.get("Keys") or []
    if len(keys) < 2:
        return None
    account_identifier, service_line = keys[0], keys[1]
    metrics = (group.get("Metrics") or {}).get("UnblendedCost") or {}
    amount = float(metrics.get("Amount") or 0)
    if not account_identifier or not service_line or amount == 0:
        return None
    return {
        "accountIdentifier": account_identifier,
        "serviceLine": service_line,
        "amount": amount,
        "currency": metrics.get("Unit") or "USD",
        "year": year,
        "month": month,
    }


def collect_rows(response: dict, year: int, month: int) -> list[dict]:
    rows: list[dict] = []
    for result in response.get("ResultsByTime") or []:
        for group in result.get("Groups") or []:
            row = _row_from_cost_group(group, year, month)
            if row:
                rows.append(row)
    return rows


def fetch_aws_cost_explorer_rows(year: int, month: int, linked_account_ids: list[str] | None = None) -> list[dict]:
    import boto3

    region = os.getenv("FINANCE_AWS_REGION") or "us-east-1"
    client = boto3.client("ce", region_name=region)
    start, end, _end_day = period_bounds(year, month)
    rows: list[dict] = []

    for account_chunk in chunk_linked_account_ids(linked_account_ids):
        token = None
        while True:
            kwargs = {
                "TimePeriod": {"Start": start, "End": end},
                "Granularity": "MONTHLY",
                "Metrics": ["UnblendedCost"],
                "GroupBy": [
                    {"Type": "DIMENSION", "Key": "LINKED_ACCOUNT"},
                    {"Type": "DIMENSION", "Key": "SERVICE"},
                ],
            }
            if account_chunk:
                kwargs["Filter"] = {"Dimensions": {"Key": "LINKED_ACCOUNT", "Values": account_chunk}}
            if token:
                kwargs["NextPageToken"] = token
            response = client.get_cost_and_usage(**kwargs)
            rows.extend(collect_rows(response, year, month))
            token = response.get("NextPageToken")
            if not token:
                break

    if not rows:
        raise RuntimeError(f"AWS_LZA Cost Explorer returned no non-zero rows for {year}-{month}.")
    return rows
