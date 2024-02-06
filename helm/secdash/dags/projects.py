import os
import json
import shutil
import urllib
from datetime import timedelta, datetime
import requests
from airflow.providers.mongo.hooks.mongo import MongoHook
from github import GitHubAPI, extract_owner_repo


shared_directory = '/opt/airflow/shared'


def split_array(original_array, num_subarrays):
    """
    Split an array into a specified number of subarrays.

    Parameters:
    - original_array: The original array to be split.
    - num_subarrays: The desired number of subarrays.

    Returns:
    A list of subarrays, where each subarray is a portion of the original array.
    """

    array_length = len(original_array)
    subarray_size = array_length // max(num_subarrays, 1)
    remainder = array_length % max(num_subarrays, 1)

    subarrays = [original_array[i * subarray_size:(i + 1) * subarray_size] for i in range(num_subarrays)]

    # Distribute the remainder elements to the first few subarrays
    for i in range(remainder):
        subarrays[i].append(original_array[num_subarrays * subarray_size + i])

    return subarrays


def get_mongo_db(mongo_conn_id):
    """
    Connect to MongoDB using the specified connection ID.

    Parameters:
    - mongo_conn_id: The connection ID for MongoDB.

    Returns:
    The MongoDB database named 'pltsvc'.
    """

    hook = MongoHook(conn_id=mongo_conn_id)
    client = hook.get_conn()
    print(f"Connected to MongoDB - {client.server_info()}")
    return client.pltsvc


def fetch_zap_projects(mongo_conn_id, concurrency, **context):
    """
    Fetch active projects from MongoDB, retrieve information about their hosts,
    and push the results into XCom.

    Parameters:
    - mongo_conn_id: The connection ID for MongoDB.
    - concurrency: The number of subarrays for parallel processing.
    - **context: Additional context parameters.

    Note: This function assumes the existence of a 'get_mongo_db' function.

    Raises:
    - Any exceptions that occur during the execution.

    """

    try:
        db = get_mongo_db(mongo_conn_id)
        projects = db.PrivateCloudProject.find({"status": "ACTIVE"}, projection={
                                               "_id": False, "licencePlate": True, "cluster": True})
        result = []

        for project in projects:
            cluster = ''
            token = ''

            if project['cluster'] == 'SILVER':
                cluster = 'silver'
                token = os.environ['OC_TOKEN_SILVER']
            elif project['cluster'] == 'GOLD':
                cluster = 'gold'
                token = os.environ['OC_TOKEN_GOLD']
            elif project['cluster'] == 'KLAB':
                cluster = 'klab'
                token = os.environ['OC_TOKEN_KLAB']
            else:
                continue

            headers = {"Authorization": f"Bearer {token}"}
            apiUrl = f"https://api.{cluster}.devops.gov.bc.ca:6443/apis/route.openshift.io/v1"
            url = f"{apiUrl}/namespaces/{project['licencePlate']}-prod/routes"
            response = requests.get(url, headers=headers)
            if response.status_code == 200:
                data = response.json()
                for item in data['items']:
                    host = item['spec']['host']
                    available = True
                    status_code = 500

                    try:
                        print(f"head: {host}")
                        avail_res = requests.head(f"https://{host}", timeout=3)
                        status_code = avail_res.status_code
                        print(f"{host}: {status_code}")
                        available = status_code != 503
                    except Exception as e:
                        print(f"{host}: {e}")
                        available = False

                    if available == False:
                        db.PrivateCloudProjectZapResult.replace_one(
                            {
                                'licencePlate': project['licencePlate'],
                                'cluster': cluster,
                                'host': host
                            },
                            {
                                'licencePlate': project['licencePlate'],
                                'cluster': cluster,
                                'host': host,
                                'scannedAt': datetime.now(),
                                'available': False
                            },
                            True  # Create one if it does not exist
                        )
                        continue

                    # Distribute workload evenly by assigning a host per project
                    result.append(
                        {
                            'licencePlate': project['licencePlate'],
                            'cluster': project['cluster'],
                            'hosts': [host]
                        }
                    )

        result_subarrays = split_array(result, concurrency)
        task_instance = context['task_instance']
        for i, subarray in enumerate(result_subarrays, start=1):
            task_instance.xcom_push(key=str(i), value=json.dumps(subarray))

        # Delete documents older than two_days_ago
        two_days_ago = datetime.now() - timedelta(days=2)
        db.PrivateCloudProjectZapResult.delete_many({'scannedAt': {'$lt': two_days_ago}})
        shutil.rmtree(f"{shared_directory}/zapscan/{mongo_conn_id}")

    except Exception as e:
        print(f"[fetch_zap_projects] Error: {e}")


def load_zap_results(mongo_conn_id):
    """
    Load Zap scan results into MongoDB.

    Parameters:
    - mongo_conn_id: The connection ID for MongoDB.

    Raises:
    - Any exceptions that occur during the execution.

    """

    try:
        db = get_mongo_db(mongo_conn_id)

        report_directory = f"{shared_directory}/zapscan/{mongo_conn_id}"

        subdirectories = [
            os.path.join(report_directory, d) for d in os.listdir(report_directory) if os.path.isdir(os.path.join(report_directory, d))
        ]

        for subdirectory in subdirectories:
            print(f"Processing files in subdirectory: {subdirectory}")
            doc = {}
            for foldername, subfolders, filenames in os.walk(subdirectory):
                for filename in filenames:
                    file_path = os.path.join(foldername, filename)

                    with open(file_path, 'r') as file:
                        content = file.read().replace('\n', '').replace('\t', '')
                        if filename == 'report.html':
                            doc['html'] = content
                        elif filename == 'report.json':
                            doc['json'] = json.loads(content)
                        elif filename == 'detail.json':
                            details = json.loads(content)
                            doc['licencePlate'] = details['licencePlate']
                            doc['cluster'] = details['cluster']
                            doc['host'] = details['host']

            doc['scannedAt'] = datetime.now()
            doc['available'] = True

            if doc['licencePlate'] is not None:
                db.PrivateCloudProjectZapResult.replace_one({
                    'licencePlate': doc['licencePlate'],
                    'cluster': doc['cluster'],
                    'host': doc['host']},
                    doc,
                    True  # Create one if it does not exist
                )

    except Exception as e:
        print(f"[load_zap_results] Error: {e}")


def fetch_sonarscan_projects(mongo_conn_id, concurrency, gh_token, **context):
    """
    Fetch active projects from MongoDB, retrieve information about their codebase repository URLs,
    and push the results into XCom.

    Parameters:
    - mongo_conn_id: The connection ID for MongoDB.
    - concurrency: The number of subarrays for parallel processing.
    - **context: Additional context parameters.

    Note: This function assumes the existence of a 'get_mongo_db' function.

    Raises:
    - Any exceptions that occur during the execution.

    """

    try:
        db = get_mongo_db(mongo_conn_id)
        projects = db.SecurityConfig.find(
            {
                "$expr": {
                    "$gt": [{"$size": "$repositories"}, 0]
                }
            }, projection={"_id": False, "licencePlate": True, "context": True, "repositories": True})
        result = []

        for project in projects:
            for repository in project["repositories"]:
                prev_result = db.SonarScanResult.find_one({
                    'licencePlate': project['licencePlate'],
                    'context': project['context'],
                    'url': repository['url']},
                    projection={"_id": False, "sha": True},
                )

                if prev_result is None:
                    print(f"{repository['url']}: Has not been scanned yet.")
                    result.append({
                        'licencePlate': project['licencePlate'],
                        'context': project['context'],
                        'repositories': [{
                            'url': repository['url'],
                            'sha': ''
                        }]
                    })
                    continue

                try:
                    owner, repo = extract_owner_repo(repository['url'])
                    github_api = GitHubAPI(gh_token)
                    default_branch = github_api.get_default_branch(owner, repo)
                    commit_sha = github_api.get_sha(owner, repo, default_branch)

                    if prev_result["sha"] == commit_sha:
                        print(f"{repository['url']}: No changes detected. Skipping the update..")
                        continue

                    result.append({
                        'licencePlate': project['licencePlate'],
                        'context': project['context'],
                        'repositories': [{
                            'url': repository['url'],
                            'sha': commit_sha
                        }]
                    })
                except Exception as e:
                    print(f"{repository['url']}: {e}")

        task_instance = context['task_instance']
        result_subarrays = split_array(result, concurrency)
        for i, subarray in enumerate(result_subarrays, start=1):
            task_instance.xcom_push(key=str(i), value=json.dumps(subarray))

        # Delete documents older than two_days_ago
        two_days_ago = datetime.now() - timedelta(days=2)
        db.SonarScanResult.delete_many({'scannedAt': {'$lt': two_days_ago}})

        shutil.rmtree(f"{shared_directory}/sonarscan/{mongo_conn_id}")

    except Exception as e:
        print(f"[fetch_sonarscan_projects] Error: {e}")


def load_sonarscan_results(mongo_conn_id):
    """
    Load SonarScan results into MongoDB.

    Parameters:
    - mongo_conn_id: The connection ID for MongoDB.

    Raises:
    - Any exceptions that occur during the execution.

    """

    try:
        db = get_mongo_db(mongo_conn_id)

        report_directory = f"{shared_directory}/sonarscan/{mongo_conn_id}"

        subdirectories = [
            os.path.join(report_directory, d) for d in os.listdir(report_directory) if os.path.isdir(os.path.join(report_directory, d))
        ]

        for subdirectory in subdirectories:
            print(f"Processing files in subdirectory: {subdirectory}")
            file_path = os.path.join(subdirectory, 'detail.json')
            with open(file_path, 'r') as file:
                content = file.read().replace('\n', '').replace('\t', '')
                doc = json.loads(content)
                doc['scannedAt'] = datetime.now()

                db.SonarScanResult.replace_one({
                    'licencePlate': doc['licencePlate'],
                    'context': doc['context'],
                    'url': doc['url']},
                    doc,
                    True  # Create one if it does not exist
                )

    except Exception as e:
        print(f"[load_sonarscan_results] Error: {e}")


def fetch_load_acs_projects(mongo_conn_id):
    try:
        db = get_mongo_db(mongo_conn_id)
        projects = db.PrivateCloudProject.find({"status": "ACTIVE"}, projection={
                                               "_id": False, "licencePlate": True, "cluster": True})

        for project in projects:
            cluster = project["cluster"]
            licencePlate = project["licencePlate"]

            base_url = "https://acs.developer.gov.bc.ca"
            token = os.environ['ACS_TOKEN']

            if cluster in ["CLAB", "KLAB", "KLAB2"]:
                base_url = "https://acs-lab.developer.gov.bc.ca"
                token = os.environ['ACS_LAB_TOKEN']

            api_url = f"{base_url}/v1"
            ui_query = f"s[Cluster][0]={cluster}&s[Namespace][0]={licencePlate}-prod"
            violation_url = f"{base_url}/main/violations?{ui_query}"
            image_url = f"{base_url}/main/vulnerability-management/images?{ui_query}"

            result = {'cluster': cluster, 'licencePlate': licencePlate,
                      "violationUrl": violation_url, "imageUrl": image_url}

            headers = {"Authorization": f"Bearer {token}"}
            query_param = urllib.parse.quote(f'cluster:"{cluster}"+namespace:"{licencePlate}-prod"')

            # Collect alerts data
            alerts_url = f"{api_url}/alerts?query={query_param}"
            alerts_response = requests.get(alerts_url, headers=headers)
            if alerts_response.status_code == 200:
                data = alerts_response.json()
                if data["alerts"] is None:
                    continue
                result["alerts"] = data["alerts"]
            else:
                continue

            # Collect images data
            images_url = f"{api_url}/images?query={query_param}"
            images_response = requests.get(images_url, headers=headers)

            if images_response.status_code == 200:
                data = images_response.json()
                if data["images"] is None:
                    continue
                result["images"] = data["images"]
            else:
                continue

            result['scannedAt'] = datetime.now()

            db.AcsResult.replace_one({
                'cluster': cluster,
                'licencePlate': licencePlate},
                result,
                True  # Create one if it does not exist
            )

        # Delete documents older than two_days_ago
        two_days_ago = datetime.now() - timedelta(days=2)
        db.AcsResult.delete_many({'scannedAt': {'$lt': two_days_ago}})

    except Exception as e:
        print(f"[fetch_load_acs_projects] Error: {e}")
