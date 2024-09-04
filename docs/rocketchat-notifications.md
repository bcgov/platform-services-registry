# RocketChat Deployment Notifications Setup

To facilitate efficient communication of deployment actions, we have set up a notification bot to notify developers and stakeholders about the status of our deployments, as well as provide a convenient link to the changes made.

## Prerequisites

- You must be an admin of this repository.
- You must be a member of the `#app-dev-team` RocketChat channel.

## Setting Up and Updating the Notification Bot

### 1. Create a RocketChat Webhook

To create a webhook in RocketChat for deployment notifications:

1. Open RocketChat and click on the **vertical 3-dot menu** at the top-left of the application.
2. Select **Workspace** under the **Administration** heading.
3. At the top-right, click the **New** button to create a new integration.
4. Ensure that the **Enabled** toggle is switched on to activate this integration.
5. Fill in the **Integration Name** with a descriptive name (e.g., "App Deployment Notification").
6. In the **Post to Channel** field, enter `#app-dev-team`.
7. In the **Post As** field, enter your own username or another account name for clarity.
8. Set the **Alias** to `app-dev-deployment` to identify the source of the notification.
9. To help differentiate automated bot messages from user-generated messages, you can:
   - Add an emoji (e.g., `:robot:`) in the **Emoji** field, which will replace the default avatar.
   - Alternatively, use a custom avatar by inserting an image URL (e.g., `https://i.imgur.com/7U3Yv1e.png`).
10. Once the fields are filled, click **Save** at the bottom-right to create the integration.

### 2. Update the Repository to Use the Webhook

After setting up the webhook in RocketChat, you need to update your repository to use it:

1. Navigate to the **Settings** tab of this repository on GitHub.
2. Click on the **Environments** menu.
3. Under the **Environment Secrets** section, update the `ROCKETCHAT_WEBHOOK_URL` with the new webhook URL from RocketChat.
