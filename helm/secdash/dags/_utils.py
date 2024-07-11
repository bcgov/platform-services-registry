from projects import get_mongo_db
from bson.objectid import ObjectId
import hashlib


def keys_exist(element, *keys):
    '''
    Check if nested keys exist in a dictionary.

    Parameters:
    - element (dict): The dictionary to check for nested keys.
    - *keys: Variable number of keys to check for existence.

    Returns:
    - bool: True if all keys exist, False otherwise.

    Raises:
    - TypeError: If the input element is not a dictionary.
    - ValueError: If an insufficient number of keys are provided.
    '''

    if element is None:
        return False
    if not isinstance(element, dict):
        return False
    if len(keys) == 0:
        return False

    _element = element
    for key in keys:
        try:
            if _element[key] is None:
                return False
            _element = _element[key]
        except KeyError:
            return False

    return True


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


def get_email_hash(email):
    return hashlib.md5(email.lower().encode('utf-8')).hexdigest()


def fetch_unique_emails(mongo_conn_id):
    try:
        db = get_mongo_db(mongo_conn_id)
        projects_collection = db["PrivateCloudProject"]
        users_collection = db["User"]
        query = {"status": "ACTIVE"}
        projection = {"_id": 0, "projectOwnerId": 1, "primaryTechnicalLeadId": 1, "secondaryTechnicalLeadId": 1}
        projects = list(projects_collection.find(query, projection))

        unique_ids = set()
        for project in projects:
            if project.get('projectOwnerId'):
                unique_ids.add(str(project['projectOwnerId']))
            if project.get('primaryTechnicalLeadId'):
                unique_ids.add(str(project['primaryTechnicalLeadId']))
            if project.get('secondaryTechnicalLeadId'):
                unique_ids.add(str(project['secondaryTechnicalLeadId']))

            unique_emails = []
            if unique_ids:
                user_criteria = {'_id': {'$in': [ObjectId(id) for id in unique_ids]}}
                users = users_collection.find(user_criteria)
                unique_emails = [user['email'] for user in users if 'email' in user]

        return unique_emails
    except Exception as e:
        print(f"[fetch_unique_emails] Error: {e}")
        return []
