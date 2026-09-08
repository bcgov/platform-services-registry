import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

DAGS = Path(__file__).resolve().parents[1] / "dags"
if str(DAGS) not in sys.path:
    sys.path.insert(0, str(DAGS))

from _finance_ingest import (  # noqa: E402
    _ingest_provider_period,
    _raise_if_provider_failures,
    _rows_or_fetch_failure,
    _to_ingest_lines,
    current_calendar_month,
    previous_complete_month,
)
from _finance_ingest_dev_data import (  # noqa: E402
    account_ids_from_products,
    generate_dev_rows,
    make_dev_fetch_rows,
)


class DummyResponse:
    def __init__(self, ok=True, status_code=200, text="ok"):
        self.ok = ok
        self.status_code = status_code
        self.text = text
        self.headers = {}


class RecordingSession:
    def __init__(self, response=None):
        self.posts = []
        self.response = response or DummyResponse()

    def post(self, url, headers=None, json=None, timeout=None):
        self.posts.append(json)
        return self.response


class RowsOrFetchFailureTests(unittest.TestCase):
    def test_empty_month_becomes_empty_rows(self):
        with patch("_finance_ingest._fetch_provider_rows", side_effect=RuntimeError("no non-zero rows")):
            rows, error = _rows_or_fetch_failure("AWS_LZA", 2026, 4)
        self.assertEqual(rows, [])
        self.assertEqual(error, "")

    def test_sso_failure_does_not_raise(self):
        with patch("_finance_ingest._fetch_provider_rows", side_effect=RuntimeError("SSO token expired")):
            rows, error = _rows_or_fetch_failure("AWS_LZA", 2026, 7)
        self.assertIsNone(rows)
        self.assertRegex(error, r"SSO token expired")

    def test_non_runtime_fetch_error_is_isolated(self):
        with patch("_finance_ingest._fetch_provider_rows", side_effect=ConnectionError("endpoint timed out")):
            rows, error = _rows_or_fetch_failure("AWS_LZA", 2026, 7)
        self.assertIsNone(rows)
        self.assertRegex(error, r"endpoint timed out")


class ProviderIsolationTests(unittest.TestCase):
    def test_aws_fetch_failure_still_persists_azure(self):
        def fetch(provider, year, month, ctx=None):
            if provider == "AWS_LZA":
                raise RuntimeError("Cost Explorer SSO died")
            return [{"accountIdentifier": "sub-1", "serviceLine": "Virtual Machines", "amount": 9, "currency": "CAD"}]

        session = RecordingSession()
        with patch("_finance_ingest._fetch_provider_rows", side_effect=fetch):
            aws = _ingest_provider_period(session, "http://registry/lines", {}, "AWS_LZA", 2026, 7)
            azure = _ingest_provider_period(session, "http://registry/lines", {}, "AZURE", 2026, 7)

        self.assertEqual(aws["status"], "fetch_failed")
        self.assertEqual(azure["status"], "ok")
        self.assertEqual(len(session.posts), 1)
        self.assertEqual(session.posts[0]["provider"], "AZURE")
        self.assertEqual(session.posts[0]["lines"][0]["amount"], 9)

        with self.assertRaisesRegex(RuntimeError, "AWS_LZA 2026-7"):
            _raise_if_provider_failures([aws, azure])

    def test_empty_aws_month_still_posts_zero_lines(self):
        session = RecordingSession()
        with patch("_finance_ingest._fetch_provider_rows", side_effect=RuntimeError("no non-zero rows")):
            result = _ingest_provider_period(session, "http://registry/lines", {}, "AWS_LZA", 2026, 4)

        self.assertEqual(result["status"], "ok")
        self.assertEqual(session.posts[0]["lines"], [])


class CalendarMonthTests(unittest.TestCase):
    def test_current_and_previous_complete(self):
        today = datetime(2026, 8, 15, tzinfo=timezone.utc)
        self.assertEqual(current_calendar_month(today), (2026, 8))
        self.assertEqual(previous_complete_month(today), (2026, 7))


class ToIngestLinesTests(unittest.TestCase):
    def test_rejects_unsupported_currency(self):
        row = {"accountIdentifier": "a", "serviceLine": "x", "amount": 1, "currency": "EUR"}
        with self.assertRaisesRegex(RuntimeError, "EUR"):
            _to_ingest_lines([row])


class DevDataTests(unittest.TestCase):
    def test_dev_fetch_rows_uses_registry_account_ids_and_skips_cloud_fetch(self):
        session = RecordingSession()
        ids = {"AWS_LZA": ["111122223333"], "AZURE": []}
        with (
            patch("_finance_ingest._fetch_provider_rows") as fetch,
            patch("_finance_ingest_dev_data.fetch_registry_account_ids", return_value=ids) as registry,
        ):
            fetch_rows = make_dev_fetch_rows()
            ctx = {"session": session, "base_url": "http://registry", "headers": {}}
            aws = _ingest_provider_period(session, "http://registry/lines", {}, "AWS_LZA", 2026, 9, fetch_rows, ctx)
            azure = _ingest_provider_period(session, "http://registry/lines", {}, "AZURE", 2026, 9, fetch_rows, ctx)

        fetch.assert_not_called()
        registry.assert_called_once()
        self.assertEqual(aws["status"], "ok")
        self.assertEqual(azure["status"], "ok")
        self.assertEqual(session.posts[0]["lines"][0]["accountIdentifier"], "111122223333")
        self.assertGreater(session.posts[0]["lines"][0]["amount"], 0)
        self.assertEqual(session.posts[1]["lines"], [])

    def test_default_fetch_is_real_cloud_apis(self):
        session = RecordingSession()
        with patch("_finance_ingest._fetch_provider_rows", return_value=[]) as fetch:
            _ingest_provider_period(session, "http://registry/lines", {}, "AZURE", 2026, 7)
        fetch.assert_called_once()

    def test_dev_rows_are_empty_without_ids(self):
        self.assertEqual(generate_dev_rows("AZURE", 2026, 7, []), [])

    def test_dev_rows_are_deterministic_and_varied(self):
        ids = [f"{100000000000 + i}" for i in range(40)]
        now = datetime(2026, 9, 15, tzinfo=timezone.utc)
        first = generate_dev_rows("AWS_LZA", 2026, 9, ids, now=now)
        second = generate_dev_rows("AWS_LZA", 2026, 9, ids, now=now)
        self.assertEqual(first, second)

        services = {row["serviceLine"] for row in first}
        self.assertGreater(len(services), 8)
        self.assertTrue(all(row["currency"] == "USD" for row in first))
        per_account = {}
        for row in first:
            per_account.setdefault(row["accountIdentifier"], []).append(row["amount"])
        self.assertGreater(len(per_account), 30)
        self.assertTrue(all(len(amounts) >= 2 for amounts in per_account.values()))
        totals = sorted(sum(amounts) for amounts in per_account.values())
        self.assertGreater(totals[-1] / max(totals[0], 1), 2)

        azure = generate_dev_rows("AZURE", 2026, 9, ids, now=now)
        self.assertTrue(all(row["currency"] == "CAD" for row in azure))
        self.assertTrue({row["serviceLine"] for row in azure}.isdisjoint(services))

    def test_dev_rows_most_accounts_existed_in_april_few_onboard_later(self):
        ids = [f"{100000000000 + i}" for i in range(80)]
        now = datetime(2026, 9, 15, tzinfo=timezone.utc)
        april = {row["accountIdentifier"] for row in generate_dev_rows("AZURE", 2026, 4, ids, now=now)}
        july = {row["accountIdentifier"] for row in generate_dev_rows("AZURE", 2026, 7, ids, now=now)}
        september = {row["accountIdentifier"] for row in generate_dev_rows("AZURE", 2026, 9, ids, now=now)}
        self.assertGreater(len(april), 60)
        self.assertGreaterEqual(len(july), len(april) - 5)
        self.assertGreaterEqual(len(september), len(july) - 5)
        self.assertLess(len(april), len(september))

    def test_dev_rows_prorate_current_month(self):
        ids = ["111122223333"]
        late = generate_dev_rows("AWS_LZA", 2026, 9, ids, now=datetime(2026, 9, 28, tzinfo=timezone.utc))
        early = generate_dev_rows("AWS_LZA", 2026, 9, ids, now=datetime(2026, 9, 3, tzinfo=timezone.utc))
        self.assertGreater(sum(abs(r["amount"]) for r in late), sum(abs(r["amount"]) for r in early) * 5)

    def test_account_ids_flatten_v1_products_by_provider(self):
        products = [
            {
                "licencePlate": "abc123",
                "provider": "AWS_LZA",
                "accountId": [
                    {"provider": "AWS_LZA", "accountIdentifier": "111122223333", "environment": "production"},
                    {"provider": "AWS_LZA", "accountIdentifier": " 111122223333 "},
                    {"provider": "AWS_LZA", "accountIdentifier": "444455556666", "environment": "development"},
                ],
            },
            {
                "licencePlate": "def456",
                "provider": "AZURE",
                "accountId": [{"provider": "AZURE", "accountIdentifier": "sub-1"}],
            },
            {
                "licencePlate": "ghi789",
                "provider": "AWS",
                "accountId": [{"provider": "AWS", "accountIdentifier": "classic"}],
            },
            {"licencePlate": "jkl012", "provider": "AZURE", "accountId": []},
            "not-a-product",
        ]
        ids = account_ids_from_products(products)
        self.assertEqual(ids, {"AWS_LZA": ["111122223333", "444455556666"], "AZURE": ["sub-1"]})


if __name__ == "__main__":
    unittest.main()
