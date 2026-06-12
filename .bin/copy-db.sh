#!/bin/bash

set -o allexport
eval "$(sed -E '/^\s*($|#)/d; s/^/export /' app/.env.local 2>/dev/null)" >/dev/null 2>&1
set +o allexport

echo "DATABASE_URL is $DATABASE_URL"

base_url_with_db="${DATABASE_URL%%\?*}"
url="${base_url_with_db%/*}"
database="${base_url_with_db##*/}"

tmp_dir="tmp/backup"

mkdir -p "$tmp_dir"

pod_name=$(oc get pods | grep pltsvc-db-backup- | awk '{print $1}')

if [[ -z $pod_name ]]; then
    echo "No pod found matching 'pltsvc-db-backup-'" >&2
    exit 1
fi

echo "Pod name: $pod_name"

# Get the most recent file from the backup directory in the pod
recent_file=$(oc exec "$pod_name" -- sh -c 'ls -t backup | head -n 1')

if [[ -z $recent_file ]]; then
    echo "No files found in /backup directory of the pod" >&2
    exit 1
fi

echo "Most recent file: $recent_file"

# Copy the most recent back file to unarchive into the sandbox database
# Verify file size before and after copy to detect incomplete transfers
pod_file_size=$(oc exec "$pod_name" -- sh -c "stat -c %s backup/$recent_file 2>/dev/null")
echo "Source file size: $pod_file_size bytes"

oc cp "$pod_name:backup/$recent_file" "$tmp_dir/$recent_file"

# Verify the copy was successful
if [[ ! -f "$tmp_dir/$recent_file" ]]; then
    echo "Error: Failed to copy file from pod" >&2
    exit 1
fi

local_file_size=$(stat -f%z "$tmp_dir/$recent_file" 2>/dev/null || stat -c %s "$tmp_dir/$recent_file" 2>/dev/null)
echo "Local file size: $local_file_size bytes"

if [[ $pod_file_size != "$local_file_size" ]]; then
    echo "Error: File sizes don't match. Copy may be incomplete." >&2
    echo "Expected: $pod_file_size bytes, Got: $local_file_size bytes" >&2
    rm -f "$tmp_dir/$recent_file"
    exit 1
fi

echo "File copy verified. Starting mongo-unarchive..."
mongo-unarchive --uri="$url/?authSource=admin" --db="$database" --local-path="$tmp_dir"
