import os
import json
import shutil
from datetime import timedelta, datetime
import requests
from airflow.providers.mongo.hooks.mongo import MongoHook
from _github import GitHubAPI, extract_owner_repo
from _utils import split_array
from _acs_api import get_acs_context, get_search_params, extract_github_bcgov_urls

shared_directory = "/opt/airflow/shared"


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

        # Delete documents older than two_days_ago
        two_days_ago = datetime.now() - timedelta(days=2)
        db.PrivateCloudProjectZapResult.delete_many({"scannedAt": {"$lt": two_days_ago}})
        shutil.rmtree(f"{shared_directory}/zapscan/{mongo_conn_id}")

        projects = db.PrivateCloudProject.find(
            {"status": "ACTIVE"}, projection={"_id": False, "licencePlate": True, "cluster": True}
        )
        result = []

        for project in projects:
            cluster = ""
            token = ""

            if project["cluster"] == "SILVER":
                cluster = "silver"
                token = os.environ["OC_TOKEN_SILVER"]
            elif project["cluster"] == "GOLD":
                cluster = "gold"
                token = os.environ["OC_TOKEN_GOLD"]
            elif project["cluster"] == "KLAB":
                cluster = "klab"
                token = os.environ["OC_TOKEN_KLAB"]
            else:
                continue

            headers = {"Authorization": f"Bearer {token}"}
            apiUrl = f"https://api.{cluster}.devops.gov.bc.ca:6443/apis/route.openshift.io/v1"
            url = f"{apiUrl}/namespaces/{project['licencePlate']}-prod/routes"

            try:
                response = requests.get(url, headers=headers, timeout=2)
            except:
                continue

            if response.status_code == 200:
                data = response.json()
                for item in data["items"]:
                    host = item["spec"]["host"]
                    available = True
                    status_code = 500

                    try:
                        print(f"head: {host}")
                        avail_res = requests.head(f"https://{host}", timeout=2)
                        status_code = avail_res.status_code
                        print(f"{host}: {status_code}")
                        available = status_code != 503
                    except Exception as e:
                        print(f"{host}: {e}")
                        available = False

                    if available == False:
                        db.PrivateCloudProjectZapResult.replace_one(
                            {"licencePlate": project["licencePlate"], "cluster": cluster, "host": host},
                            {
                                "licencePlate": project["licencePlate"],
                                "cluster": cluster,
                                "host": host,
                                "scannedAt": datetime.now(),
                                "available": False,
                            },
                            True,  # Create one if it does not exist
                        )
                        continue

                    # Distribute workload evenly by assigning a host per project
                    result.append(
                        {"licencePlate": project["licencePlate"], "cluster": project["cluster"], "hosts": [host]}
                    )

        result_subarrays = split_array(result, concurrency)
        task_instance = context["task_instance"]
        for i, subarray in enumerate(result_subarrays, start=1):
            task_instance.xcom_push(key=str(i), value=json.dumps(subarray))

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
            os.path.join(report_directory, d)
            for d in os.listdir(report_directory)
            if os.path.isdir(os.path.join(report_directory, d))
        ]

        for subdirectory in subdirectories:
            print(f"Processing files in subdirectory: {subdirectory}")
            doc = {}
            for foldername, subfolders, filenames in os.walk(subdirectory):
                for filename in filenames:
                    file_path = os.path.join(foldername, filename)

                    with open(file_path, "r") as file:
                        content = file.read().replace("\n", "").replace("\t", "")
                        if filename == "report.html":
                            doc["html"] = content
                        elif filename == "report.json":
                            doc["json"] = json.loads(content)
                        elif filename == "detail.json":
                            details = json.loads(content)
                            doc["licencePlate"] = details["licencePlate"]
                            doc["cluster"] = details["cluster"]
                            doc["host"] = details["host"]

            doc["scannedAt"] = datetime.now()
            doc["available"] = True

            if doc["licencePlate"] is not None:
                db.PrivateCloudProjectZapResult.replace_one(
                    {"licencePlate": doc["licencePlate"], "cluster": doc["cluster"], "host": doc["host"]},
                    doc,
                    True,  # Create one if it does not exist
                )

    except Exception as e:
        print(f"[load_zap_results] Error: {e}")


def fetch_sonarscan_projects(mongo_conn_id, concurrency, gh_token, **context):
    """
    Fetches active projects from MongoDB, retrieves information about their codebase repository URLs,
    and pushes the results into XCom.

    Parameters:
    - mongo_conn_id (str): The connection ID for MongoDB.
    - concurrency (int): The number of subarrays for parallel processing.
    - gh_token (str): GitHub API token for accessing repository information.
    - **context: Additional context parameters.

    Note: This function assumes the existence of a 'get_mongo_db' function.

    Raises:
    - Any exceptions that occur during the execution.
    """

    try:
        # Establish MongoDB connection
        db = get_mongo_db(mongo_conn_id)

        # Delete documents older than two days ago
        two_days_ago = datetime.now() - timedelta(days=2)
        db.SonarScanResult.delete_many({"scannedAt": {"$lt": two_days_ago}})

        # Remove directory related to SonarScan
        shutil.rmtree(f"{shared_directory}/sonarscan/{mongo_conn_id}")

        # Initialize list for storing URL candidates
        candidates = []

        # Collect URLs from ACS images
        print("Start collecting URLs from ACS images.")
        projects = db.PrivateCloudProject.find(
            {"status": "ACTIVE"}, projection={"_id": False, "licencePlate": True, "cluster": True}
        )
        for project in projects:
            urls_from_acs = extract_github_bcgov_urls(project["cluster"], project["licencePlate"])
            for url in urls_from_acs:
                candidates.append(
                    {
                        "context": "PRIVATE",
                        "clusterOrProvider": project["cluster"],
                        "licencePlate": project["licencePlate"],
                        "url": url,
                        "source": "ACS",
                    }
                )

        # Count ACS URLs found
        acsUrlCount = len(candidates)
        print(f"Found {acsUrlCount} URLs.")

        # Collect URLs from the project team
        print("Start collecting URLs from the project team")
        configs = db.SecurityConfig.find(
            {"$expr": {"$gt": [{"$size": "$repositories"}, 0]}},
            projection={
                "_id": False,
                "licencePlate": True,
                "context": True,
                "clusterOrProvider": True,
                "repositories": True,
            },
        )

        for config in configs:
            for repository in config["repositories"]:
                found_dict = next((can for can in candidates if can.get("url") == repository["url"]), None)
                if not found_dict:
                    candidates.append(
                        {
                            "context": config["context"],
                            "clusterOrProvider": config.get("clusterOrProvider", ""),
                            "licencePlate": config["licencePlate"],
                            "url": repository["url"],
                            "source": "USER",
                        }
                    )

        # Count team URLs found
        teamUrlCount = len(candidates) - acsUrlCount
        print(f"Found {teamUrlCount} URLs.")

        # Initialize list for storing results
        result = []
        github_api = GitHubAPI(gh_token)

        # Iterate over candidates to check repositories
        for candy in candidates:
            print(f"Checking {candy['url']}...")

            try:
                # Get the commit SHA of the default branch
                owner, repo = extract_owner_repo(candy["url"])
                default_branch = github_api.get_default_branch(owner, repo)
                commit_sha = github_api.get_sha(owner, repo, default_branch)

                # Find the previous scan result in the database
                prev_result = db.SonarScanResult.find_one(
                    {"licencePlate": candy["licencePlate"], "context": candy["context"], "url": candy["url"]},
                    projection={"_id": False, "sha": True},
                )

                # If the previous SHA matches the current one, skip the update
                if prev_result is not None and prev_result["sha"] == commit_sha:
                    print(f"{candy['url']}: No changes detected. Skipping the update..")
                    continue

                result.append(
                    {
                        "context": candy["context"],
                        "clusterOrProvider": candy["clusterOrProvider"],
                        "licencePlate": candy["licencePlate"],
                        "repositories": [
                            {
                                "url": candy["url"],
                                "sha": commit_sha,
                                "source": candy["source"],
                            }
                        ],
                    }
                )

            except Exception as e:
                print(f"{repository['url']}: {e}")

        # Push result to XCom
        task_instance = context["task_instance"]
        result_subarrays = split_array(result, concurrency)
        for i, subarray in enumerate(result_subarrays, start=1):
            task_instance.xcom_push(key=str(i), value=json.dumps(subarray))

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
            os.path.join(report_directory, d)
            for d in os.listdir(report_directory)
            if os.path.isdir(os.path.join(report_directory, d))
        ]

        for subdirectory in subdirectories:
            print(f"Processing files in subdirectory: {subdirectory}")

            # Read scan result first
            detail_file_path = os.path.join(subdirectory, "detail.json")
            with open(detail_file_path, "r") as file:
                content = file.read().replace("\n", "").replace("\t", "")
                doc = json.loads(content)
                doc["scannedAt"] = datetime.now()

            # Read targets line by line
            targets_file_path = os.path.join(subdirectory, "targets.json")
            with open(targets_file_path, "r") as file:
                for line in file:
                    context, clusterOrProvider, licencePlate, source = line.strip().split(",")

                target = {
                    "context": context,
                    "clusterOrProvider": clusterOrProvider,
                    "licencePlate": licencePlate,
                    "source": source,
                }

                db.SonarScanResult.replace_one(
                    {"licencePlate": licencePlate, "context": context, "url": doc["url"]},
                    {**doc, **target},
                    True,  # Create one if it does not exist
                )

    except Exception as e:
        print(f"[load_sonarscan_results] Error: {e}")


def fetch_load_acs_projects(mongo_conn_id):
    try:
        db = get_mongo_db(mongo_conn_id)

        # Delete documents older than two_days_ago
        two_days_ago = datetime.now() - timedelta(days=2)
        db.AcsResult.delete_many({"scannedAt": {"$lt": two_days_ago}})

        projects = db.PrivateCloudProject.find(
            {"status": "ACTIVE"}, projection={"_id": False, "licencePlate": True, "cluster": True}
        )

        for project in projects:
            cluster = project["cluster"]
            licencePlate = project["licencePlate"]

            base_url, api_url, headers = get_acs_context(cluster)
            ui_search_param, api_search_param = get_search_params(cluster, licencePlate)

            violation_url = f"{base_url}/main/violations?{ui_search_param}"
            image_url = f"{base_url}/main/vulnerability-management/images?{ui_search_param}"

            result = {
                "cluster": cluster,
                "licencePlate": licencePlate,
                "violationUrl": violation_url,
                "imageUrl": image_url,
            }

            # Collect alerts data
            alerts_url = f"{api_url}/alerts?{api_search_param}"
            try:
                alerts_response = requests.get(alerts_url, headers=headers, timeout=2)
            except:
                continue

            if alerts_response.status_code != 200:
                continue

            data = alerts_response.json()
            if data["alerts"] is None:
                continue
            result["alerts"] = data["alerts"]

            # Collect images data
            images_url = f"{api_url}/images?{api_search_param}"
            try:
                images_response = requests.get(images_url, headers=headers, timeout=2)
            except:
                continue

            if images_response.status_code != 200:
                continue

            data = images_response.json()
            if data["images"] is None:
                continue

            result["images"] = data["images"]
            result["scannedAt"] = datetime.now()

            db.AcsResult.replace_one(
                {"cluster": cluster, "licencePlate": licencePlate}, result, True  # Create one if it does not exist
            )

    except Exception as e:
        print(f"[fetch_load_acs_projects] Error: {e}")
