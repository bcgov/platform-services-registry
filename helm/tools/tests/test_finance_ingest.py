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
        self.assertTrue("SSO token expired" in error)


class ProviderIsolationTests(unittest.TestCase):
    def test_aws_fetch_failure_still_persists_azure(self):
        def fetch(provider, year, month):
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
        with self.assertRaisesRegex(RuntimeError, "EUR"):
            _to_ingest_lines([{"accountIdentifier": "a", "serviceLine": "x", "amount": 1, "currency": "EUR"}])


if __name__ == "__main__":
    unittest.main()
