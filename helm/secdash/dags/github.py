import requests
import re


def extract_owner_repo(url):
    pattern = r'^https://github\.com/([^/]+)/([^/]+)'
    match = re.match(pattern, url)

    if match:
        owner = match.group(1)
        repo = match.group(2)
        return owner, repo
    else:
        return None, None


class GitHubAPI:
    def __init__(self, gh_token):
        self.gh_token = gh_token
        self.base_url = "https://api.github.com"
        self.headers = {
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {gh_token}",
            "X-GitHub-Api-Version": "2022-11-28"
        }

    def make_request(self, endpoint, method="GET"):
        url = f"{self.base_url}/{endpoint}"
        response = requests.request(method, url, headers=self.headers, timeout=2)
        return response

    def get_default_branch(self, owner, repo):
        if not owner or not repo:
            print("Error: Insufficient arguments. Usage: get_default_branch(<owner>, <repo>)")
            return None

        endpoint = f"repos/{owner}/{repo}"
        response = self.make_request(endpoint)

        if response.status_code != 200:
            print(f"GitHub API error: {response.status_code}")
            return None

        default_branch = response.json().get("default_branch")
        return default_branch

    def get_sha(self, owner, repo, ref):
        if not owner or not repo or not ref:
            print("Error: Insufficient arguments. Usage: get_sha(<owner>, <repo>, <ref>)")
            return None

        endpoint = f"repos/{owner}/{repo}/commits/{ref}"
        response = self.make_request(endpoint)

        if response.status_code != 200:
            print(f"GitHub API error: {response.status_code}")
            return None

        sha = response.json().get("sha")
        return sha

# Example usage
# gh_token = "your_github_token"
# github_api = GitHubAPI(gh_token)

# default_branch = github_api.get_default_branch("owner_name", "repo_name")
# print(f"Default Branch: {default_branch}")

# commit_sha = github_api.get_sha("owner_name", "repo_name", "main")
# print(f"Commit SHA: {commit_sha}")
