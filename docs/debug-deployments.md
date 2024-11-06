# Debugging Helm Deployment Failure Issues

## Error: UPGRADE FAILED: another operation (install/upgrade/rollback) is in progress

This error typically occurs when multiple operations—like install, upgrade, or rollback—are initiated within a short timeframe. Here’s how to resolve it:

1. Log in to the OCP namespace.
2. In the left sidebar, select **Helm**.
3. Navigate to the **Helm Releases** tab and locate the target release.
4. Open the **Revision History** tab.
5. Identify the most recent successful release (Status: _Deployed_).
6. Click the three dots icon on the right and choose **Rollback**.
7. Wait for the rollback to complete.
8. Rerun the failed GitHub Action deployment pipeline.
