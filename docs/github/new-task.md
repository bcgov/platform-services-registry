# New Task branch

1. Create a `feature` branch.
   ```sh
   git checkout -b "feat/1091"
   ```
1. Make sure the branch is rebased onto `main` branch.
   ```sh
   git pull origin main --rebase
   ```
1. Make changes to complete the task.
1. Make a commit with the changes.
   ```sh
   git add .
   git commit -m "feat(1091): add new page" # `pre-commit` hooks will be triggered to ensure the code quality.
   git pull origin main --rebase
   ```
1. Push the commit to the remote repository.
   ```sh
   git push
   ```
1. Make a PR from the feature branch into the target branch via UI.
1. Wait until the checks pass before requesting the peer review via UI.
1. Once the PR is approved, merge the PR via UI.
