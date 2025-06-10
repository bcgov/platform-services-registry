import requests


def _validate_all_true(data, path=""):
    if isinstance(data, dict):
        for key, value in data.items():
            full_path = f"{path}.{key}" if path else key
            _validate_all_true(value, full_path)
    elif isinstance(data, bool):
        if not data:
            raise ValueError(f"Validation failed: {path} is False")
    else:
        raise TypeError(f"Unexpected value type at {path}: {type(data).__name__}")


def call_token_check_api(base_url: str):
    token_check_url = f"{base_url}/api/token-check"
    response = requests.get(token_check_url)

    if response.status_code != 200:
        response.raise_for_status()

    try:
        data = response.json()
    except ValueError:
        raise ValueError("Failed to parse JSON response")

    _validate_all_true(data)
    print("All credential and token checks passed successfully.")
