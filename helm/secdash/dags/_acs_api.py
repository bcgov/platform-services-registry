import os
import re
import urllib
import requests
from _utils import keys_exist


def get_acs_context(cluster):
    base_url = "https://acs.developer.gov.bc.ca"
    token = os.environ['ACS_TOKEN']

    if cluster in ["CLAB", "KLAB", "KLAB2"]:
        base_url = "https://acs-lab.developer.gov.bc.ca"
        token = os.environ['ACS_LAB_TOKEN']

    api_url = f"{base_url}/v1"
    headers = {"Authorization": f"Bearer {token}"}

    return base_url, api_url, headers


def get_search_params(cluster, licencePlate):
    ui_search_param = f"s[Cluster][0]={cluster}&s[Namespace][0]={licencePlate}-prod"
    api_search_param = "query=" + urllib.parse.quote(f'Cluster:"{cluster}"+Namespace:"{licencePlate}-prod"')

    return ui_search_param, api_search_param


def extract_image_label_urls(cluster, licencePlate):
    base_url, api_url, headers = get_acs_context(cluster)
    ui_search_param, api_search_param = get_search_params(cluster, licencePlate)

    result = []

    images_url = f"{api_url}/images?{api_search_param}"
    try:
        images_response = requests.get(images_url, headers=headers, timeout=2)
    except:
        return result

    if images_response.status_code != 200:
        return result

    images_data = images_response.json()
    if not keys_exist(images_data, "images"):
        return result

    url_pattern = re.compile(r'(?:git|ssh|https?|git@[-\w.]+):(\/\/)?(.*?)$', re.IGNORECASE)

    for image in images_data["images"]:
        image_url = f"{api_url}/images/{image['id']}"
        print(f"Querying image_url... {image_url}")

        try:
            image_response = requests.get(image_url, headers=headers, timeout=2)
        except:
            continue

        if image_response.status_code != 200:
            continue

        image_data = image_response.json()
        if keys_exist(image_data, "metadata", "v1", "labels"):
            # Iterate through labels to find URL string values
            # Reference URLs for label values:
            # - https://docs.okd.io/latest/cicd/builds/managing-build-output.html#builds-output-image-labels_managing-build-output
            # - https://learn.microsoft.com/en-us/javascript/api/%40azure/container-registry/ociannotations?view=azure-node-latest#@azure-container-registry-ociannotations-org-opencontainers-image-source
            # - https://learn.microsoft.com/en-us/javascript/api/%40azure/container-registry/ociannotations?view=azure-node-latest#@azure-container-registry-ociannotations-org-opencontainers-image-url
            labels = image_data["metadata"]["v1"]["labels"]
            for key, value in labels.items():
                if re.match(url_pattern, value):
                    lower_url = value.lower()
                    print(f"Found URL... {lower_url}")
                    result.append(lower_url)

    return list(set(result))


def extract_github_bcgov_urls(cluster, licencePlate):
    print(f"Extracting {cluster}/{licencePlate}...")

    all_urls = extract_image_label_urls(cluster, licencePlate)

    github_https_pattern = r'^https:\/\/github\.com\/bcgov\/[a-zA-Z0-9_-]+$'
    github_ssh_pattern = r'^git@github\.com:bcgov\/([a-zA-Z0-9_-]+)\.git$'

    result = []
    for url in all_urls:
        if re.match(github_https_pattern, url):
            result.append(url)
        else:
            match = re.match(github_ssh_pattern, url)
            if match:
                repo_name = match.group(1)
                https_url = f'https://github.com/bcgov/{repo_name}'
                result.append(https_url)

    return list(set(result))
