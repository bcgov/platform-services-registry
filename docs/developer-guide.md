# Developer Guidelines

## Setting Up WSL (Windows users only)

WSL allows you to effortlessly incorporate a Linux environment into your Windows operating system. This method empowers developers to leverage the robust development tools of Linux while remaining within their Windows ecosystem.
For the installation instructions of WSL, please refer to the following links:

- [How to install Linux on Windows with WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Manual installation steps for older versions of WSL](https://learn.microsoft.com/en-us/windows/wsl/install-manual).

## Setting Up GitHub project repository

### Connecting to GitHub with SSH

For an enhanced method of authentication when interacting with GitHub repositories, employing an SSH key is highly advisable, as opposed to the less secure username and password authentication.
For detailed instructions, refer to the GitHub documentation:

- [Generating a New SSH Key and Adding it to the SSH Agent](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent).

### Cloning Repository

To clone a repository using SSH and set up essential Git configurations, you can execute the following shell commands:

```sh
# Clone the repository via SSH
git clone git@github.com:bcgov/platform-services-registry.git

# Change into the cloned repository directory
cd platform-services-registry
```

### GPG key signing

To ensure the legitimacy of Git commits, it is strongly recommended to sign them using a GPG key.
For step-by-step guidance, please consult the GitHub documentation:

- [Signing Commits](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification/signing-commits)
- [Adding a New GPG Key to Your GitHub Account](https://docs.github.com/en/github/authenticating-to-github/managing-commit-signature-verification/adding-a-new-gpg-key-to-your-github-account)

To enable GPG signing in Git, follow these steps in the repository:

```sh
# Define the signing key hash
git config user.signingkey "<hash>"

# Specify Git to sign commits and tags with GPG
git config commit.gpgsign true
git config tag.gpgsign true

# Set the GPG program for signing (if not already set)
git config gpg.program gpg
```

## Setting up the local development environment

- Using Linux or MacOS terminals is advised for the development of web applications and managing their pipelines.
- [`asdf`](https://asdf-vm.com/#/core-manage-asdf) is a tool to manage the required packages with specific versions.
- All the packages are defined in `tool-versions`.

### Installation

1. Install `asdf` according to the `asdf` installation guide.
   - https://asdf-vm.com/guide/getting-started.html#getting-started
1. Install `asdf` packages defined in `.tool-versions`.
   ```sh
   cat .tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin-add || true
   asdf plugin-add docker-compose https://github.com/virtualstaticvoid/asdf-docker-compose.git || true
   asdf plugin-update --all
   asdf install
   asdf reshim
   ```
1. Confirm the packages installed.
   ```sh
   asdf current
   ```
1. Install python packages.
   ```sh
   pip install -r requirements.txt
   ```
1. Install the pre-commit script.
   ```sh
   pre-commit install
   pre-commit install --hook-type commit-msg
   ```

## Setting Up GitHub Workspace

## Working on features

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
