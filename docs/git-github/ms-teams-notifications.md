# MS Teams Deployment Notifications (via n8n + Relay)

To facilitate efficient communication of deployment actions, we use **MS Teams notifications via n8n and the Relay app** to notify developers and stakeholders about deployment status and provide links to relevant changes.

---

## Prerequisites

-   You must be an admin of this repository.
-   You must have access to the target MS Teams channel.
-   You must have access to n8n: https://n8n.developer.gov.bc.ca
-   You must have permission to install or access the **Relay** app in MS Teams.

---

## 1. Add the Relay App to the MS Teams Channel

To install the Relay app:

1. Open **Microsoft Teams**
2. Click **Apps** in the sidebar
3. Search for **Relay**
4. Click **Add**
5. Select the channel(s) that should receive webhook notifications

> If you do not see the Relay app, contact the Developer Experience / Workflows teams.
> It may take up to 24 hours for the app to appear.

---

## 2. Configure the n8n Workflow

1. Log in to https://n8n.developer.gov.bc.ca using your IDIR account
2. Open your webhook workflow
3. Double-click the **DevX Message Connector** node
4. Click the ✏️ icon next to **Credential**
5. Paste your MS Teams channel link
    - In Teams: click channel → **Copy link**
6. Save and exit

### Payload Configuration (Important)

Set the **Payload** to Expression mode and use:

```js
{
    {
        ({
            title: $json.body.title || 'Deployment notification',
            body: $json.body.body || $json.body.text,
        });
    }
}
```

#### This supports:

```
title/body (new format)
text (legacy format)
```

---

## 3. Test the Webhook

1. Open the **Webhook** node in n8n
2. Click **_Listen for test event_**
3. Send a test request:

```
curl -X POST "https://n8n.developer.gov.bc.ca/webhook-test/<workflow-id>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "🚀 Test deployment notification",
    "body": "This is a test message from n8n to MS Teams."
  }'
```

4. Confirm the message appears in the Teams channel

---

## 4. Publish the Workflow

Once testing is complete:

1. Click Publish in n8n
2. Use the Production URL

**Important:**

> Use `/webhook/<workflow-id>`

> Do NOT use `/webhook-test/<workflow-id>`

---

## 5. Configure GitHub Secret

1. Go to `GitHub → Settings → Secrets and variables → Actions`
2. Add or update the following secret: `N8N_MSTEAMS_WEBHOOK_URL` <!-- pragma: allowlist secret -->

> Value:
> `https://n8n.developer.gov.bc.ca/webhook/<workflow-id>`

---

## 6. Update GitHub Actions

```
- name: Notify MS Teams on Failure
  if: failure()
  uses: ./.github/actions/rocketchat-notification
  with:
    webhook-url: ${{ secrets.N8N_MSTEAMS_WEBHOOK_URL }}
    data: |
      {
        "title": "⚠️ Deployment failed",
        "body": "Investigate: https://github.com/bcgov/platform-services-registry/"
      }
```

---

## 7. Other Systems (Airflow, Jobs, etc.)

Send payloads in this format:

```
{
  "title": "⚠️ Alert",
  "body": "Something happened"
}
```
