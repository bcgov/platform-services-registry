# Renovate Bot PR Review

Renovate Bot is our tool for automatically updating dependencies. However, a manual PR review process is necessary when the bot creates PRs for dependency updates.

## Review Criteria

When reviewing a Renovate Bot PR, consider the following to assess whether it's safe to merge into the main branch:

1. **Area of Usage**
   Identify where the tool or package is used:

   - Application production
   - Application development
   - Sandbox services
   - Terraform
   - Helm charts
   - Continuous integration/Code quality
   - Low-level tools

2. **Functionality**
   Understand what the tool or package does within the identified area.

3. **Upgrade Level**
   Determine the upgrade type: major, minor, or patch.

4. **Pipeline Checks**
   Review if any checks are related to the changes and ensure they pass.

Based on these criteria, assess the risk to decide whether to merge the PR.

## Handling Failed Checks

If a pipeline check fails after an upgrade, it indicates a potential breaking change. Investigate the specific failed check and review the detailed error message to identify the root cause. If a codebase change is required, check out the PR branch locally to debug and make the necessary updates directly on the PR branch.
