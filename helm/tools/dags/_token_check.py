import requests
from typing import Any

from typing import Any


def is_all_booleans_true(data: Any, path: str = "") -> bool:
    if isinstance(data, dict):
        for key, value in data.items():
            full_path = f"{path}.{key}" if path else key
            if not is_all_booleans_true(value, full_path):
                return False
        return True
    elif isinstance(data, bool):
        return data
    else:
        return False


def call_token_check_api(base_url: str):
    token_check_url = f"{base_url}/api/token-check"
    response = requests.get(token_check_url)

    if response.status_code != 200:
        response.raise_for_status()

    try:
        data = response.json()
    except ValueError:
        raise ValueError("Failed to parse JSON response")

    if not is_all_booleans_true(data):
        raise ValueError("One or more credentials or token checks failed")

    print("All credential and token checks passed successfully.")
