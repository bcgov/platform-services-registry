# Debugging Helm Deployment Failure Issues

## Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress

This error usually occurs when multiple Helm operations—install, upgrade, or rollback—are triggered in quick succession. Here’s how to resolve it:

### Using the OCP UI

1. Log in to the OCP namespace.
2. From the left sidebar, select **Helm**.
3. Go to the **Helm Releases** tab and find the target release.
4. Open the **Revision History** tab.
5. Locate the most recent successful release (Status: _Deployed_).
6. Click the three dots on the right and select **Rollback**.
7. Wait for the rollback to finish.
8. Rerun the failed GitHub Action deployment pipeline.

### Using the CLI

1. **Check the current status** of the release:

   ```bash
   helm status pltsvc
   ```

2. **List all revisions** for the `pltsvc` release:

   ```bash
   helm history pltsvc
   ```

   This command displays the release history, showing revision numbers and statuses such as `DEPLOYED`, `FAILED`, or `SUPERSEDED`.

3. **Identify the last successful release**:
   Look for the latest revision with a `DEPLOYED` status.

4. **Rollback to the desired revision**:

   ```bash
   helm rollback pltsvc <revision_number>
   ```

   Replace `<revision_number>` with the number of the last successful revision.

5. **Verify the rollback** by checking the release status:
   ```bash
   helm status pltsvc
   ```
