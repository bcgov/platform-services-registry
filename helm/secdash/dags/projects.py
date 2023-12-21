import os
import json
import shutil
import datetime
import requests
from airflow.providers.mongo.hooks.mongo import MongoHook


def split_array(original_array, num_subarrays):
    array_length = len(original_array)
    subarray_size = array_length // max(num_subarrays, 1)
    remainder = array_length % max(num_subarrays, 1)

    subarrays = [original_array[i * subarray_size:(i + 1) * subarray_size] for i in range(num_subarrays)]

    # Distribute the remainder elements to the first few subarrays
    for i in range(remainder):
        subarrays[i].append(original_array[num_subarrays * subarray_size + i])

    return subarrays


target_directory = '/opt/airflow/shared/reports'


def get_mongo_db(mongo_conn_id):
    hook = MongoHook(conn_id=mongo_conn_id)
    client = hook.get_conn()
    print(f"Connected to MongoDB - {client.server_info()}")
    return client.pltsvc


def fetch_projects(mongo_conn_id, concurrency, **context):
    try:
        db = get_mongo_db(mongo_conn_id)
        projects = db.PrivateCloudProject.find({"status": "ACTIVE"}, projection={
                                               "_id": False, "licencePlate": True, "cluster": True})
        result = []

        for project in projects:
            cluster = ''
            token = ''

            if project['cluster'] == 'KLAB':
                cluster = 'klab'
                token = os.environ['OC_TOKEN_KLAB']
            else:
                continue

            headers = {"Authorization": f"Bearer {token}"}
            response = requests.get(f"https://api.{cluster}.devops.gov.bc.ca:6443/apis/route.openshift.io/v1/namespaces/{
                                    project['licencePlate']}-prod/routes", headers=headers)
            if response.status_code == 200:
                data = response.json()
                project['hosts'] = []
                for item in data['items']:
                    project['hosts'].append(item['spec']['host'])

                if len(project['hosts']) > 0:
                    result.append(project)

        result_subarrays = split_array(result, concurrency)
        task_instance = context['task_instance']
        for i, subarray in enumerate(result_subarrays, start=1):
            task_instance.xcom_push(key=str(i), value=json.dumps(subarray))

        shutil.rmtree(target_directory)

    except Exception as e:
        print(f"[fetch_projects] Error: {e}")


def load_zap_results(mongo_conn_id):
    try:
        db = get_mongo_db(mongo_conn_id)

        subdirectories = [os.path.join(target_directory, d) for d in os.listdir(
            target_directory) if os.path.isdir(os.path.join(target_directory, d))]
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

            doc['scannedAt'] = datetime.datetime.now()

            db.PrivateCloudProjectZapResult.replace_one({
                'licencePlate': doc['licencePlate'],
                'cluster': doc['cluster'],
                'host': doc['host']},
                doc,
                True  # Create one if it does not exist
            )

    except Exception as e:
        print(f"[load_zap_results] Error: {e}")
