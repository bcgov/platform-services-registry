#!/bin/bash

asdf plugin add database-tools https://github.com/egose/asdf-database-tools.git
asdf install database-tools

tmp_dir="tmp/backup"

mkdir -p "$tmp_dir"

pod_name=$(oc get pods | grep pltsvc-db-backup- | awk '{print $1}')

if [ -z "$pod_name" ]; then
    echo "No pod found matching 'pltsvc-db-backup-'"
    exit 1
fi

echo "Pod name: $pod_name"

# Get the most recent file from the backup directory in the pod
recent_file=$(oc exec "$pod_name" -- sh -c 'ls -t backup | head -n 1')

if [ -z "$recent_file" ]; then
    echo "No files found in /backup directory of the pod"
    exit 1
fi

echo "Most recent file: $recent_file"

# Copy the most recent back file to unarchive into the sandbox database
oc cp "$pod_name:backup/$recent_file" "$tmp_dir/$recent_file"
mongo-unarchive --uri="mongodb://mongodb:mongodb@localhost:27017/?authSource=admin" --db=pltsvc --local-path="$tmp_dir" # pragma: allowlist secret
