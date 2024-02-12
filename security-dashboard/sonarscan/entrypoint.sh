#!/bin/bash

echo "hit entrypoint..."

echo "$PROJECTS"
# An example:
# [
#     {
#         "context": "PRIVATE",
#         "clusterOrProvider": "SILVER",
#         "licencePlate": "34w22a",
#         "repositories": [
#             {
#                 "url": "https://github.com/bcgov/platform-services-registry",
#                 "source": "USER"
#             },
#             {
#                 "url": "https://github.com/bcgov/platform-developer-docs",
#                 "source": "USER"
#             }
#         ]
#     },
#     {
#         "context": "PUBLIC",
#         "clusterOrProvider": "AWS",
#         "licencePlate": "3744e3",
#         "repositories": [
#             {
#                 "url": "https://github.com/bcgov/platform-services-registry-web",
#                 "source": "ACS"
#             },
#             {
#                 "url": "https://github.com/bcgov/platform-services-registry-api",
#                 "source": "ACS"
#             }
#         ]
#     }
# ]

# Makes an HTTP request using curl and outputs the HTTP status code and response data.
curl_http_code() {
    response=$(curl -s -w "%{http_code}" "${@:1}")
    if [ "${#response}" -lt 3 ]; then
        echo "500" ""
        return
    fi

    status_code=${response: -3}
    data=${response:0:-3}

    echo "$status_code" "$data"
}

# Retrieves the default branch of a GitHub repository using the GitHub API.
get_default_branch() {
    if [ "$#" -lt 2 ]; then exit 1; fi
    owner="$1"
    repo="$2"

    read -r status_code data < <(curl_http_code -X GET \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GH_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$owner/$repo")

    if [ "$status_code" -ne "200" ]; then
        echo ""
        return
    fi

    default_branch=$(echo "$data" | jq -r .default_branch)
    echo "$default_branch"
}

# Retrieves the last commit SHA of a GitHub repository using the GitHub API.
get_sha() {
    if [ "$#" -lt 2 ]; then exit 1; fi
    owner="$1"
    repo="$2"
    ref="$3"

    read -r status_code data < <(curl_http_code -X GET \
        -H "Accept: application/vnd.github+json" \
        -H "Authorization: Bearer $GH_TOKEN" \
        -H "X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$owner/$repo/commits/$ref")

    if [ "$status_code" -ne "200" ]; then
        echo ""
        return
    fi

    sha=$(echo "$data" | jq -r .sha)
    echo "$sha"
}

# Downloads a ZIP archive of a specific reference from a GitHub repository using the GitHub API.
download_repo() {
    if [ "$#" -lt 3 ]; then exit 1; fi
    owner="$1"
    repo="$2"
    ref="$3"

    filename="$owner-$repo.zip"

    wget --header="Accept: application/vnd.github+json" \
        --header="Authorization: Bearer $GH_TOKEN" \
        --header="X-GitHub-Api-Version: 2022-11-28" \
        "https://api.github.com/repos/$owner/$repo/zipball/$ref" \
        -O "$filename"

    echo "$filename"
}

# Extracts the owner and repository name from a GitHub URL.
extract_owner_repo() {
    if [[ $1 =~ ^https://github\.com/([^/]+)/([^/]+) ]]; then
        owner="${BASH_REMATCH[1]}"
        repo="${BASH_REMATCH[2]}"

        echo "$owner" "$repo"
    else
        echo "" ""
    fi
}

# Retrieves historical scan results for a specified project from a SonarQube server.
get_scan_result() {
    if [ "$#" -lt 1 ]; then exit 1; fi
    project_key="$1"

    seven_days_ago=$(date -u -d "@$(($(date -u +%s) - 7 * 24 * 60 * 60))" "+%Y-%m-%d")

    read -r status_code data < <(curl_http_code -X GET \
        -u "$SONARQUBE_USER:$SONARQUBE_PASS" \
        "$SONARQUBE_URL/api/measures/search_history?component=$project_key&metrics=bugs,vulnerabilities,sqale_index,duplicated_lines_density,ncloc,coverage,code_smells,reliability_rating,security_rating,sqale_rating&ps=100&from=$seven_days_ago")

    if [ "$status_code" -ne "200" ]; then
        echo ""
        return
    fi

    echo "$data"
}

CONTEXT=${CONTEXT:-local}

base_path="sonarscan/$CONTEXT"
full_path="/mnt/$base_path"
mkdir -p "$full_path"

# Loop through each project in the input
while read -r proj; do
    echo "$proj"

    # Extract project details from JSON using jq
    context=$(echo "$proj" | jq -r '.context')
    clusterOrProvider=$(echo "$proj" | jq -r '.clusterOrProvider // ""')
    licencePlate=$(echo "$proj" | jq -r '.licencePlate')
    repositories=$(echo "$proj" | jq -r '.repositories')

    if [ -z "$licencePlate" ] || [ -z "$context" ] || [ -z "$repositories" ]; then
        echo "Invalid project: Missing required information. Please provide values for licencePlate, context, and urls."
        continue
    fi

    # Loop through each repository in the project
    while read -r repo; do
        url=$(echo "$repo" | jq -r '.url')
        source=$(echo "$repo" | jq -r '.source')

        # Extract owner and repo from the repository URL
        read -r owner repo < <(extract_owner_repo "$url")

        # Get the default branch of the GitHub repository
        ref=$(get_default_branch "$owner" "$repo")
        curr_sha=$(get_sha "$owner" "$repo" "$ref")

        # Generate unique identifiers for the repository and folder
        repoid="$owner--$repo"
        folder="github-$repoid"
        repo_path="$full_path/$folder"
        mkdir -p "$repo_path"

        if [[ -f "$repo_path/detail.json" ]]; then
            prev_sha=$(<"$repo_path/detail.json" jq -r '.sha // ""')
            if [ "$prev_sha" == "$curr_sha" ]; then
                echo "${context},${clusterOrProvider},${licencePlate},${source}" >>"$repo_path/targets.json"
                continue
            fi
        fi

        # Download the repository ZIP file
        cd "$repo_path" || exit
        filename=$(download_repo "$owner" "$repo" "$ref")
        directory="${filename%.zip}"

        # Unzip the downloaded repository ZIP file
        unzip -q "$filename" -d "$directory"

        # shellcheck disable=SC2010
        first_directory=$(ls -l "$directory" | grep '^d' | awk '{print $NF}' | head -n 1)

        # Run SonarQube scan on the downloaded directory
        cd "$directory/$first_directory" || exit
        sonar-scanner -Dsonar.host.url="$SONARQUBE_URL" -Dsonar.login="$SONARQUBE_TOKEN" -Dsonar.projectKey="$repoid"

        # Fetch SonarQube scan results from the SonarQube server
        sleep 5
        read -r result < <(get_scan_result "$repoid")

        # Extract relevant metrics from the SonarQube scan results
        last_date=$(echo "$result" | jq -r '.measures[0].history[-1].date')
        bugs=$(echo "$result" | jq -r '.measures[] | select(.metric == "bugs") | .history[-1].value')
        vulnerabilities=$(echo "$result" | jq -r '.measures[] | select(.metric == "vulnerabilities") | .history[-1].value')
        sqale_index=$(echo "$result" | jq -r '.measures[] | select(.metric == "sqale_index") | .history[-1].value')
        duplicated_lines_density=$(echo "$result" | jq -r '.measures[] | select(.metric == "duplicated_lines_density") | .history[-1].value')
        ncloc=$(echo "$result" | jq -r '.measures[] | select(.metric == "ncloc") | .history[-1].value')
        coverage=$(echo "$result" | jq -r '.measures[] | select(.metric == "coverage") | .history[-1].value')
        code_smells=$(echo "$result" | jq -r '.measures[] | select(.metric == "code_smells") | .history[-1].value')
        reliability_rating=$(echo "$result" | jq -r '.measures[] | select(.metric == "reliability_rating") | .history[-1].value')
        security_rating=$(echo "$result" | jq -r '.measures[] | select(.metric == "security_rating") | .history[-1].value')
        sqale_rating=$(echo "$result" | jq -r '.measures[] | select(.metric == "sqale_rating") | .history[-1].value')

        # Store the project metadata along with the SonarQube scan results into the JSON file
        echo '{
            "url": "'"$url"'",
            "sha": "'"$curr_sha"'",
            "result": {
                "repoid": "'"$repoid"'",
                "last_date": "'"$last_date"'",
                "bugs": "'"$bugs"'",
                "vulnerabilities": "'"$vulnerabilities"'",
                "sqale_index": "'"$sqale_index"'",
                "duplicated_lines_density": "'"$duplicated_lines_density"'",
                "ncloc": "'"$ncloc"'",
                "coverage": "'"$coverage"'",
                "code_smells": "'"$code_smells"'",
                "reliability_rating": "'"$reliability_rating"'",
                "security_rating": "'"$security_rating"'",
                "sqale_rating": "'"$sqale_rating"'"
            }
        }' >"$repo_path/detail.json"

        echo "${context},${clusterOrProvider},${licencePlate},${source}" >>"$repo_path/targets.json"

        rm -rf "${repo_path:?}/${directory:?}"
        rm -rf "${repo_path:?}/${filename:?}"
    done < <(echo "$repositories" | jq -c '.[]')
done < <(echo "$PROJECTS" | jq -c '.[]')

ls -al "$full_path"
