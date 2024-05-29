#!/bin/bash

# Initialize a new array to hold the modified file paths
modified_files=""

# Iterate over the original array and modify each file path
for file in "$@"; do
    # Remove the 'app/' prefix
    file_without_prefix="${file#app/}"
    # Append the modified file path to the new string with a space
    modified_files+="$file_without_prefix "
done

# shellcheck disable=SC2086
cd app && npx eslint --fix $modified_files
