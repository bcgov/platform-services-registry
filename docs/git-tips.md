# Git Tips

## How to create a clean PR

In certain scenarios, it becomes necessary to refine commit history and generate a pristine pull request for the target branch. While [Git rebase](https://docs.github.com/en/get-started/using-git/about-git-rebase) is a useful tool for this purpose, its application can be less straightforward, especially when the working branch incorporates changes from other pull requests.

To address this, a practical workaround involves resetting all commits on the base branch. Here's a simple guide to follow:

1. Confirm that you are on the working branch with a cluttered commit history.
2. Create a new branch:

   ```sh
   git checkout -b <new-branch>
   ```

3. Pull Changes from the Base Branch:

   ```sh
   git pull origin <base-branch> --no-rebase
   ```

   - Resolve any merge conflicts and commit the changes.

4. Reset all commits based on the base branch (usually the default repository branch):
   ```sh
   git reset --soft origin/<base-branch>
   ```

- For instance:

  ```sh
  git checkout -b feat/1234-1
  git pull origin main --no-rebase
  git add .
  git commit -m "chore(0000): temporary message"
  git reset --soft origin/main
  git add .
  git commit -m "feat(0000): <commit-message>"
  ```
