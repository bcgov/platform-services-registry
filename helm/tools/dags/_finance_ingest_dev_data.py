"""Dev billing rows. Dev has no cloud bill, so rows are generated: real account /
subscription IDs from the registry, invented amounts.

Only public_cloud_finance_ingest_dev imports this. Test and prod use the default
Cost Explorer / Cost Management fetch in _finance_ingest.
"""

from __future__ import annotations

import calendar
import hashlib
import math
from datetime import datetime, timezone

import requests

PROVIDERS = ("AWS_LZA", "AZURE")
V1_PRODUCTS_PAGE_SIZE = 500

# (service line, relative weight, share of accounts that use it). Names match what
# Cost Explorer SERVICE / Cost Management ServiceName return so the UI looks real.
SERVICE_CATALOG: dict[str, list[tuple[str, float, float]]] = {
    "AWS_LZA": [
        ("Amazon Elastic Compute Cloud - Compute", 1.00, 0.85),
        ("Amazon Relational Database Service", 0.70, 0.55),
        ("Amazon Simple Storage Service", 0.25, 0.95),
        ("Amazon Virtual Private Cloud", 0.18, 0.90),
        ("EC2 - Other", 0.22, 0.80),
        ("AmazonCloudWatch", 0.10, 0.90),
        ("AWS Lambda", 0.08, 0.60),
        ("Amazon Elastic Container Service for Kubernetes", 0.45, 0.25),
        ("Amazon Elastic Load Balancing", 0.12, 0.60),
        ("AWS Key Management Service", 0.03, 0.95),
        ("Amazon GuardDuty", 0.04, 0.70),
        ("AWS Config", 0.03, 0.70),
        ("Amazon Route 53", 0.02, 0.50),
        ("AWS Secrets Manager", 0.02, 0.55),
        ("Amazon DynamoDB", 0.10, 0.30),
        ("Amazon OpenSearch Service", 0.60, 0.10),
        ("AWS Glue", 0.20, 0.15),
        ("Amazon SageMaker", 0.90, 0.05),
        ("AWS Support (Business)", 0.10, 0.20),
        ("Tax", 0.05, 0.40),
    ],
    "AZURE": [
        ("Virtual Machines", 1.00, 0.80),
        ("Storage", 0.25, 0.95),
        ("Azure App Service", 0.45, 0.50),
        ("Azure Database for PostgreSQL", 0.60, 0.45),
        ("SQL Database", 0.70, 0.30),
        ("Azure Kubernetes Service", 0.40, 0.25),
        ("Virtual Network", 0.12, 0.90),
        ("Bandwidth", 0.08, 0.85),
        ("Log Analytics", 0.15, 0.85),
        ("Azure Monitor", 0.06, 0.70),
        ("Key Vault", 0.02, 0.90),
        ("Azure DNS", 0.01, 0.60),
        ("Backup", 0.10, 0.50),
        ("Azure Front Door Service", 0.20, 0.15),
        ("Container Registry", 0.05, 0.40),
        ("Azure Cognitive Search", 0.50, 0.08),
        ("Azure OpenAI Service", 0.80, 0.10),
        ("Load Balancer", 0.06, 0.55),
        ("Microsoft Defender for Cloud", 0.07, 0.60),
        ("Azure Functions", 0.05, 0.45),
    ],
}

# Track the local seed forecast defaults (CA$5k Azure / CA$4k AWS per product, see
# seed/seed-forecast-local.ts). Azure is one subscription; AWS LZA is usually two
# accounts billed in USD (~CA$1.37). sigma 0.35 keeps most accounts near forecast.
SEED_FORECAST_AZURE_CAD = 5000.0
SEED_FORECAST_AWS_CAD = 4000.0
USD_CAD = 1.37
AWS_ACCOUNTS_PER_PRODUCT = 2
SPEND_MEDIAN = {
    "AWS_LZA": SEED_FORECAST_AWS_CAD / USD_CAD / AWS_ACCOUNTS_PER_PRODUCT,
    "AZURE": SEED_FORECAST_AZURE_CAD,
}
SPEND_SIGMA = 0.35
# Almost all accounts existed at FY start (April). A few onboard later in the year.
LATE_ONBOARD_SHARE = 0.08
FY_START_MONTH = 4


class HashRng:
    """Deterministic [0, 1) stream from sha256. Not for secrets; only invented billing amounts."""

    def __init__(self, seed: str):
        self._seed = seed
        self._n = 0

    def random(self) -> float:
        self._n += 1
        digest = hashlib.sha256(f"{self._seed}:{self._n}".encode()).digest()
        return int.from_bytes(digest[:8], "big") / 2**64

    def uniform(self, low: float, high: float) -> float:
        return low + (high - low) * self.random()

    def randint(self, low: int, high: int) -> int:
        return low + int(self.random() * (high - low + 1)) % (high - low + 1)

    def choice(self, seq):
        return seq[int(self.random() * len(seq)) % len(seq)]

    def lognormvariate(self, mu: float, sigma: float) -> float:
        unit = max(self.random(), 1e-12)
        angle = self.random()
        normal = math.sqrt(-2.0 * math.log(unit)) * math.cos(math.tau * angle)
        return math.exp(mu + sigma * normal)


def _account_start_month(rng: HashRng, now: datetime) -> tuple[int, int]:
    fy_start_year = now.year if now.month >= FY_START_MONTH else now.year - 1
    last = now.month if now.month >= FY_START_MONTH else now.month + 12
    if rng.random() >= LATE_ONBOARD_SHARE or last <= FY_START_MONTH:
        return fy_start_year, FY_START_MONTH
    pick = rng.randint(FY_START_MONTH + 1, last)
    if pick <= 12:
        return fy_start_year, pick
    return fy_start_year + 1, pick - 12


def _account_profile(provider: str, identifier: str, now: datetime) -> dict:
    """Stable per-account shape: which services, how big, when it started."""
    rng = HashRng(f"profile:{provider}:{identifier}")
    services = [
        (name, weight * rng.uniform(0.4, 1.8))
        for name, weight, adoption in SERVICE_CATALOG[provider]
        if rng.random() < adoption
    ]
    if not services:
        services = [SERVICE_CATALOG[provider][0][:2]]
    start_year, start_month = _account_start_month(rng, now)
    return {
        "base": rng.lognormvariate(math.log(SPEND_MEDIAN[provider]), SPEND_SIGMA),
        "services": services,
        "growth": rng.uniform(-0.02, 0.03),
        "seasonality": rng.uniform(0.0, 0.12),
        "phase": rng.uniform(0, 12),
        "noise": rng.uniform(0.05, 0.18),
        "start_year": start_year,
        "start_month": start_month,
        "idle_chance": 0.03 if rng.random() < 0.3 else 0.0,
        "spike_chance": 0.04,
        "credit_chance": 0.08,
    }


def _month_multiplier(profile: dict, year: int, month: int, rng: HashRng) -> float:
    months_from_epoch = (year - 2026) * 12 + (month - 1)
    trend = (1.0 + profile["growth"]) ** months_from_epoch
    seasonal = 1.0 + profile["seasonality"] * math.sin((month + profile["phase"]) / 12 * math.tau)
    noise = rng.uniform(1.0 - profile["noise"], 1.0 + profile["noise"])
    return trend * seasonal * noise


def _partial_month_fraction(year: int, month: int, now: datetime) -> float:
    if (year, month) != (now.year, now.month):
        return 1.0
    return max(now.day, 1) / calendar.monthrange(year, month)[1]


def generate_dev_rows(
    provider: str,
    year: int,
    month: int,
    account_ids: list[str],
    now: datetime | None = None,
) -> list[dict]:
    """Deterministic per account / month so re-ingest is stable; current month is prorated by day."""
    currency = "CAD" if provider == "AZURE" else "USD"
    now = now or datetime.now(timezone.utc)
    fraction = _partial_month_fraction(year, month, now)
    rows: list[dict] = []
    for account_id in account_ids:
        identifier = account_id.strip()
        if not identifier:
            continue
        profile = _account_profile(provider, identifier, now)
        if (year, month) < (profile["start_year"], profile["start_month"]):
            continue
        rng = HashRng(f"month:{provider}:{identifier}:{year}-{month:02d}")
        if rng.random() < profile["idle_chance"]:
            continue

        total_weight = sum(weight for _name, weight in profile["services"])
        monthly_total = profile["base"] * _month_multiplier(profile, year, month, rng) * fraction
        spike_service = rng.choice(profile["services"])[0] if rng.random() < profile["spike_chance"] else None

        for name, weight in profile["services"]:
            amount = monthly_total * weight / total_weight * rng.uniform(0.7, 1.35)
            if name == spike_service:
                amount *= rng.uniform(1.4, 2.2)
            if amount < 0.01:
                continue
            rows.append(
                {
                    "accountIdentifier": identifier,
                    "serviceLine": name,
                    "amount": round(amount, 2),
                    "currency": currency,
                    "year": year,
                    "month": month,
                }
            )

        if rng.random() < profile["credit_chance"] and monthly_total > 0:
            credit_name = "Savings Plans for AWS Compute usage" if provider == "AWS_LZA" else "Azure Reservation"
            rows.append(
                {
                    "accountIdentifier": identifier,
                    "serviceLine": credit_name,
                    "amount": round(-monthly_total * rng.uniform(0.03, 0.08), 2),
                    "currency": currency,
                    "year": year,
                    "month": month,
                }
            )
    return rows


def account_ids_from_products(products: list, ids: dict[str, list[str]] | None = None) -> dict[str, list[str]]:
    """Flatten v1 product `accountId` links into provider -> unique identifiers."""
    ids = ids if ids is not None else {provider: [] for provider in PROVIDERS}
    for product in products:
        if not isinstance(product, dict):
            continue
        for link in product.get("accountId") or []:
            if not isinstance(link, dict):
                continue
            provider = link.get("provider")
            identifier = str(link.get("accountIdentifier") or "").strip()
            if provider in ids and identifier and identifier not in ids[provider]:
                ids[provider].append(identifier)
    return ids


def fetch_registry_account_ids(session: requests.Session, base_url: str, headers: dict) -> dict[str, list[str]]:
    """Page GET /api/v1/public-cloud/products (active) and collect account / subscription IDs."""
    url = f"{base_url.rstrip('/')}/api/v1/public-cloud/products"
    ids: dict[str, list[str]] = {provider: [] for provider in PROVIDERS}
    page = 1
    while True:
        response = session.get(
            url,
            headers=headers,
            params={"page": page, "pageSize": V1_PRODUCTS_PAGE_SIZE, "status": "ACTIVE"},
            timeout=60,
        )
        response.raise_for_status()
        payload = response.json()
        products = payload.get("data") if isinstance(payload, dict) else None
        if not isinstance(products, list) or not products:
            return ids
        account_ids_from_products(products, ids)
        if len(products) < V1_PRODUCTS_PAGE_SIZE:
            return ids
        page += 1


def make_dev_fetch_rows():
    """`fetch_rows` for trigger_finance_ingest. Loads account IDs once per DAG run; never calls cloud APIs."""
    cache: dict[str, dict[str, list[str]]] = {}

    def fetch_rows(provider: str, year: int, month: int, ctx: dict) -> list[dict]:
        if "ids" not in cache:
            cache["ids"] = fetch_registry_account_ids(ctx["session"], ctx["base_url"], ctx["headers"])
        return generate_dev_rows(provider, year, month, cache["ids"].get(provider, []))

    return fetch_rows
