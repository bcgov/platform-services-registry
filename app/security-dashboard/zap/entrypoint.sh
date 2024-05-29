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
CONTEXT=${CONTEXT:-local}

zap_path="/zap/wrk"
base_path="zapscan/$CONTEXT"
full_path="$zap_path/$base_path"
mkdir -p "$full_path"

while read -r proj; do
    echo "$proj"
    licencePlate=$(echo "$proj" | jq -r '.licencePlate')
    cluster=$(echo "$proj" | jq -r '.cluster')
    hosts=$(echo "$proj" | jq -r '.hosts[]')

    while read -r host; do
        folder="$cluster-$licencePlate-$host"
        report_path="$base_path/$folder"
        mkdir -p "$zap_path/$report_path"

        target="https://$host"
        echo ">> $target"
        zap-baseline.py -t "$target" -J "$report_path/report.json" -w "$report_path/report.md" -r "$report_path/report.html"
        echo "{\"licencePlate\":\"$licencePlate\",\"cluster\":\"$cluster\",\"host\":\"$host\"}" >"$zap_path/$report_path/detail.json"
    done <<<"$hosts"
done < <(echo "$PROJECTS" | jq -c '.[]')

ls -al "$full_path"
