# CI/CD Pipelines

## Release Tag Dispatch Workflow

When creating a new tag using the repository's default `GITHUB_TOKEN` to perform tasks on behalf of the GitHub Actions, events triggered by the `GITHUB_TOKEN` will not create a new workflow run. To address this behavior, we need to set up an `SSH Key` when fetching the repository in the pipeline.

1. Generate a new OpenSSH Key:

   ```sh
   ssh-keygen -t ed25519 -f id_ed25519 -N "" -q -C ""
   ```

   This command will generate a private key `id_ed25519` and a corresponding public key `id_ed25519.pub` in the working directory.

2. Add the private key to GitHub's `Secrets`, naming it `SSH_KEY` in the repository.
3. Add the public key to GitHub's `Deploy keys`, also naming it `SSH_KEY` in the repository.
4. In the GitHub Actions, specify the `ssh-key` option:

```sh
jobs:
  tag-changelog:
    runs-on: ubuntu-22.04
    steps:
    - uses: hmarr/debug-action@v2
    - uses: actions/checkout@v4
      with:
        ssh-key: ${{ secrets.SSH_KEY }}
        fetch-depth: 0
```
