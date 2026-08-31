import sys
import unittest
from datetime import datetime, timezone
from pathlib import Path

DAGS = Path(__file__).resolve().parents[1] / "dags"
if str(DAGS) not in sys.path:
    sys.path.insert(0, str(DAGS))

from _azure_cost_query import azure_cost_query_body, parse_azure_cost_query_payload  # noqa: E402

SUB = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"


def query_payload(columns: list[str], rows: list, next_link: str | None = None, top_level_next: str | None = None):
    properties = {"columns": [{"name": name} for name in columns], "rows": rows}
    if next_link:
        properties["nextLink"] = next_link
    payload = {"properties": properties}
    if top_level_next:
        payload["nextLink"] = top_level_next
    return payload


class ParseAzureCostQueryPayloadTests(unittest.TestCase):
    def test_estate_subscription_id_and_next_link(self):
        rows, next_link = parse_azure_cost_query_payload(
            query_payload(
                ["Cost", "ServiceName", "Currency", "SubscriptionId"],
                [[12.5, "Virtual Machines", "CAD", SUB], [0, "Storage", "CAD", SUB]],
                next_link="https://management.azure.com/next",
            ),
            2026,
            7,
        )
        self.assertEqual(next_link, "https://management.azure.com/next")
        self.assertEqual(
            rows,
            [
                {
                    "accountIdentifier": SUB,
                    "serviceLine": "Virtual Machines",
                    "amount": 12.5,
                    "currency": "CAD",
                    "year": 2026,
                    "month": 7,
                }
            ],
        )

    def test_reads_next_link_from_payload_root(self):
        _rows, next_link = parse_azure_cost_query_payload(
            query_payload(
                ["Cost", "ServiceName", "Currency", "SubscriptionId"],
                [[1, "Bandwidth", "USD", SUB]],
                top_level_next="https://management.azure.com/root-next",
            ),
            2026,
            7,
        )
        self.assertEqual(next_link, "https://management.azure.com/root-next")

    def test_empty_month_is_empty_rows(self):
        rows, next_link = parse_azure_cost_query_payload(
            query_payload(["Cost", "ServiceName", "Currency", "SubscriptionId"], []),
            2026,
            4,
        )
        self.assertEqual(rows, [])
        self.assertIsNone(next_link)

    def test_missing_currency_column_raises(self):
        with self.assertRaisesRegex(RuntimeError, "Currency"):
            parse_azure_cost_query_payload(
                query_payload(["Cost", "ServiceName", "SubscriptionId"], [[1, "Virtual Machines", SUB]]),
                2026,
                7,
            )

    def test_missing_subscription_id_column_raises(self):
        with self.assertRaisesRegex(RuntimeError, "SubscriptionId"):
            parse_azure_cost_query_payload(
                query_payload(["Cost", "ServiceName", "Currency"], [[1, "Virtual Machines", "CAD"]]),
                2026,
                7,
            )

    def test_skips_empty_currency_and_zero_amount(self):
        rows, _next_link = parse_azure_cost_query_payload(
            query_payload(
                ["PreTaxCost", "ServiceName", "Currency", "SubscriptionID"],
                [
                    [3, "Storage", "", SUB],
                    [0, "Virtual Machines", "CAD", SUB],
                    [4, "Bandwidth", "CAD", SUB],
                ],
            ),
            2026,
            7,
        )
        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["serviceLine"], "Bandwidth")
        self.assertEqual(rows[0]["amount"], 4)


class AzureCostQueryBodyTests(unittest.TestCase):
    def test_clamps_current_month_end_to_today(self):
        body = azure_cost_query_body(2026, 8, now=datetime(2026, 8, 15, tzinfo=timezone.utc))
        self.assertEqual(body["timePeriod"]["from"], "2026-08-01T00:00:00Z")
        self.assertEqual(body["timePeriod"]["to"], "2026-08-15T23:59:59Z")

    def test_keeps_closed_month_through_last_day(self):
        body = azure_cost_query_body(2026, 7, now=datetime(2026, 8, 15, tzinfo=timezone.utc))
        self.assertEqual(body["timePeriod"]["to"], "2026-07-31T23:59:59Z")


if __name__ == "__main__":
    unittest.main()
