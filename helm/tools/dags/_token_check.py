import requests


def _validate_all_true(data, path=""):

    if isinstance(data, dict):
        for key, value in data.items():
            full_path = f"{path}.{key}" if path else key
            _validate_all_true(value, full_path)
    elif isinstance(data, bool):
        if not data:
            raise Exception(f"Validation failed: {path} is False")
    else:
        raise Exception(f"Unexpected value type at {path}: {type(data).__name__}")


def call_token_check_api(base_url: str, **kwargs):

    token_check_url = f"{base_url}/api/token-check"
    response = requests.get(token_check_url)

    if response.status_code != 200:
        raise Exception(f"Token check failed: {response.status_code} - {response.text}")

    try:
        data = response.json()
    except ValueError:
        raise Exception("Failed to parse JSON response")

    _validate_all_true(data)
    print("All credential and token checks passed successfully.")
