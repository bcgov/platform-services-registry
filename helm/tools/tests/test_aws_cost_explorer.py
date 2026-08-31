import sys
import unittest
from pathlib import Path

DAGS = Path(__file__).resolve().parents[1] / "dags"
if str(DAGS) not in sys.path:
    sys.path.insert(0, str(DAGS))

from _aws_cost_explorer import chunk_linked_account_ids, collect_rows, period_bounds  # noqa: E402


def cost_group(account: str, service: str, amount: float, unit: str = "USD") -> dict:
    return {
        "Keys": [account, service],
        "Metrics": {"UnblendedCost": {"Amount": str(amount), "Unit": unit}},
    }


class ChunkLinkedAccountIdsTests(unittest.TestCase):
    def test_none_means_one_unfiltered_query(self):
        self.assertEqual(chunk_linked_account_ids(None), [None])

    def test_empty_list_means_no_queries(self):
        self.assertEqual(chunk_linked_account_ids([]), [])

    def test_splits_after_one_hundred(self):
        ids = [f"{index:012d}" for index in range(101)]
        chunks = chunk_linked_account_ids(ids)
        self.assertEqual(len(chunks), 2)
        self.assertEqual(len(chunks[0]), 100)
        self.assertEqual(chunks[1], [ids[100]])


class CollectRowsTests(unittest.TestCase):
    def test_keeps_non_zero_groups(self):
        rows = collect_rows(
            {
                "ResultsByTime": [
                    {
                        "Groups": [
                            cost_group("111122223333", "Amazon Elastic Compute Cloud - Compute", 12.5),
                            cost_group("111122223333", "Amazon Simple Storage Service", 0),
                        ]
                    }
                ]
            },
            2026,
            7,
        )
        self.assertEqual(
            rows,
            [
                {
                    "accountIdentifier": "111122223333",
                    "serviceLine": "Amazon Elastic Compute Cloud - Compute",
                    "amount": 12.5,
                    "currency": "USD",
                    "year": 2026,
                    "month": 7,
                }
            ],
        )

    def test_skips_short_keys_and_empty_results(self):
        self.assertEqual(collect_rows({"ResultsByTime": [{"Groups": [{"Keys": ["only-account"]}]}]}, 2026, 7), [])
        self.assertEqual(collect_rows({"ResultsByTime": []}, 2026, 7), [])
        self.assertEqual(collect_rows({}, 2026, 7), [])


class PeriodBoundsTests(unittest.TestCase):
    def test_july_and_december(self):
        self.assertEqual(period_bounds(2026, 7), ("2026-07-01", "2026-08-01", "2026-07-31"))
        self.assertEqual(period_bounds(2026, 12), ("2026-12-01", "2027-01-01", "2026-12-31"))


if __name__ == "__main__":
    unittest.main()
