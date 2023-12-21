#!/bin/bash

echo "hit entrypoint..."

echo "$PROJECTS"

while read -r proj; do
    echo "$proj"
    licencePlate=$(echo "$proj" | jq -r '.licencePlate')
    cluster=$(echo "$proj" | jq -r '.cluster')
    hosts=$(echo "$proj" | jq -r '.hosts[]')

    while read -r host; do
        folder="$cluster-$licencePlate-$host"
        report_path="reports/$folder"
        mkdir -p "/zap/wrk/$report_path"
        zap-baseline.py -t "https://$host" -J "$report_path/report.json" -w "$report_path/report.md" -r "$report_path/report.html"
        echo "{\"licencePlate\":\"$licencePlate\",\"cluster\":\"$cluster\",\"host\":\"$host\"}" > "/zap/wrk/$report_path/detail.json"
    done <<< "$hosts"
done < <(echo "$PROJECTS" | jq -c '.[]')

ls -al /zap/wrk/reports
