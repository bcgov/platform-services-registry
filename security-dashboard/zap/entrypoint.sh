#!/bin/bash

echo "hit entrypoint..."

echo "$PROJECTS"
# An example:
# [
#     {
#         "licencePlate": "34w22a",
#         "cluster": "KLAB",
#         "hosts": [
#             "app1.34w22a-prod.apps.klab.devops.gov.bc.ca",
#             "app2.34w22a-prod.apps.klab.devops.gov.bc.ca"
#         ]
#     },
#     {
#         "licencePlate": "3744e3",
#         "cluster": "KLAB",
#         "hosts": [
#             "app1.3744e3-prod.apps.klab.devops.gov.bc.ca",
#             "app2.3744e3-prod.apps.klab.devops.gov.bc.ca"
#         ]
#     }
# ]

base_path="zap/$CONTEXT"
full_path="/zap/wrk/$base_path"
mkdir -p "$full_path"

while read -r proj; do
    echo "$proj"
    licencePlate=$(echo "$proj" | jq -r '.licencePlate')
    cluster=$(echo "$proj" | jq -r '.cluster')
    hosts=$(echo "$proj" | jq -r '.hosts[]')

    while read -r host; do
        folder="$cluster-$licencePlate-$host"
        report_path="$base_path/$folder"
        mkdir -p "/zap/wrk/$report_path"
        zap-baseline.py -t "https://$host" -J "$report_path/report.json" -w "$report_path/report.md" -r "$report_path/report.html"
        echo "{\"licencePlate\":\"$licencePlate\",\"cluster\":\"$cluster\",\"host\":\"$host\"}" > "/zap/wrk/$report_path/detail.json"
    done <<< "$hosts"
done < <(echo "$PROJECTS" | jq -c '.[]')

ls -al "$full_path"
