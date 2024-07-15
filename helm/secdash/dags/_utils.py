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


def generate_md5_hash(data):
    return hashlib.md5(data.lower().encode('utf-8')).hexdigest()
