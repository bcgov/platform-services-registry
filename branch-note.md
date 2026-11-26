# AI Usage tab on Fabric embed tokens

This note explains the new embedding branch and what changes in your AI Usage PRs.

## TL;DR

`feat/DEVXT-3238` adds **app-owns-data** embedding: the registry server signs in to Power BI as a
service principal and gives the browser a short-lived embed token. Users no longer need a Power BI
login or licence, and the report filters are built on the server instead of in the browser.

Once 3238 is merged, your PRs only need to handle what users see:

- **#8264:** swap the `<iframe>` for a fetch to the new API, rendered with `<FabricReportEmbed>`.
- **#8421:** your toggle now passes a report key (`team` or `quality`) to the same fetch. The URL
  config and the repository/username parsing move out of your branch, because 3238 already does
  that work on the server.
- **Public cloud:** add the same tab and page, which is a few lines.

## What `feat/DEVXT-3238` provides

The branch is based on `main` and has no UI yet.

### API

```
GET /api/private-cloud/products/{licencePlate}/ai-usage-embed/{reportKey}
GET /api/public-cloud/products/{licencePlate}/ai-usage-embed/{reportKey}
  reportKey: 'team' | 'quality'
```

| Status | Meaning |
| --- | --- |
| 200 `{ available: false }` | The product has nothing to filter on: no GitHub usernames (`team`) or no parseable GitHub repository URLs (`quality`). Show an empty state. |
| 200 `{ available: true, reportId, embedUrl, embedToken, expiration, filters }` | Ready to embed. Pass the whole object to `<FabricReportEmbed>`. |
| 401 | The user can't view this product (same rule as the product page). |
| 404 | Fabric or this report isn't configured, for example missing env vars. |
| 500 | Power BI or Entra call failed. The `error` string holds the detail. |

The responses send `Cache-Control: no-store`, because each one contains a token that expires in
about an hour.

### Client pieces

| Import | What it is |
| --- | --- |
| `getPrivateCloudProductAiUsageEmbed(licencePlate, reportKey)` from `@/services/backend/private-cloud/products` | Fetcher (axios), returns `AiUsageEmbedInfo`. |
| `getPublicCloudProductAiUsageEmbed(licencePlate, reportKey)` from `@/services/backend/public-cloud/products` | Same, for public cloud. |
| `AiUsageEmbedInfo`, `AiUsageReportKey` from `@/types/fabric` | Response and report-key types. |
| `FabricReportEmbed` from `@/components/fabric/FabricReportEmbed` (default export) | Renders the report. Props are `info` (the `available: true` response) and `onReload` (called when the user clicks "Reload" after the token expires). |

How to use `FabricReportEmbed`:

- **Client only:** load it with `next/dynamic(..., { ssr: false })`, because `powerbi-client`
  touches `window` on import.
- **Key it by `info.embedToken`:** the component fixes its embed config at mount, so a new token
  needs a remount.
- **Expiry is built in:** when the token expires, it shows a "Reload" prompt and calls
  `onReload`. Use your query's `refetch` for that.
- **Filters are built in:** it applies the server's filters and hides the filter pane and page
  navigation, which matches the old URL flags.

The Power BI packages (`powerbi-client`, `powerbi-client-react`) and the CSP `frame-src` change
are also in 3238, so you don't need to add them.

### Filters (server-side)

- **`team`:** `ai_credit_usage[username] IN (…)` using the GitHub usernames of the owner, both tech
  leads and all members. Usernames are trimmed, de-duplicated and validated with your regex.
- **`quality`:** `ai_credit_usage[organization] IN (…)` **and** `ai_credit_usage[repository] IN (…)`,
  parsed from the product's repository URLs (`github.com/<org>/<repo>…`). This replaces your
  last-path-segment parsing, which read `…/repo/tree/main` as a repo named `main`.

## Changes to your branches

After 3238 merges, rebase `feat/DEVXT-3107` onto `main`, then `feat/DEVXT-3144` onto that.

### `feat/DEVXT-3107` (#8264)

- **`app/types/private-cloud.ts`:** 3238 contains an identical change, so after the rebase it
  should disappear from your diff. Drop it if it doesn't.
- **`ai-usage/page.tsx`:** remove the hard-coded workspace and report IDs, the username/filter
  string building, the "Open full dashboard" link and the `<iframe>`. Replace them with the fetch
  and `<FabricReportEmbed>`. The demo component below shows the pattern.
- **`layout.tsx`:** no change. The AI USAGE tab stays as it is.

### `feat/DEVXT-3144` (#8421)

- **Remove the URL settings:** delete `POWER_BI_TEAM_METRICS_URL` and `POWER_BI_CODE_QUALITY_URL`
  from `config.ts`, `app/api/info/route.ts` and `states/global.ts`. Report IDs are now server-only
  env vars.
- **Remove client-side parsing from `ai-usage/page.tsx`:** the repository and username parsing,
  URL validation and `filter=` string building all go.
- **Keep the toggle:** pass its value as the `reportKey` instead.

### New: public cloud

- **`app/app/public-cloud/products/(product)/[licencePlate]/layout.tsx`:** add an AI USAGE tab.
- **`.../[licencePlate]/ai-usage/page.tsx`:** add a page.

It's easiest if the page body becomes a shared component that takes `cloud` as a prop, like the
demo below.

## Reference: demo implementation

This is a working local demo used to test 3238 end to end. Adapt the styling, wording and
structure as you like. It isn't meant to be merged as-is.

`app/components/fabric/AiUsageReports.tsx`:

```tsx
'use client';

import { Alert, Loader, SegmentedControl } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import dynamic from 'next/dynamic';
import { ReactNode, useState } from 'react';
import { getPrivateCloudProductAiUsageEmbed } from '@/services/backend/private-cloud/products';
import { getPublicCloudProductAiUsageEmbed } from '@/services/backend/public-cloud/products';
import { AiUsageReportKey } from '@/types/fabric';

// powerbi-client touches `window` on import, so it can only load in the browser.
const FabricReportEmbed = dynamic(() => import('./FabricReportEmbed'), { ssr: false, loading: () => <Loader /> });

const fetchers = {
  private: getPrivateCloudProductAiUsageEmbed,
  public: getPublicCloudProductAiUsageEmbed,
};

const views: Record<AiUsageReportKey, { label: string; heading: string; description: string; empty: string }> = {
  team: {
    label: 'Team Metrics',
    heading: 'Team AI Usage Metrics',
    description: 'Showing telemetry for team on project: ',
    empty: 'There are no valid GitHub usernames associated with the team members for this project.',
  },
  quality: {
    label: 'Code Quality',
    heading: 'Code Quality AI Usage Metrics',
    description: 'Showing code quality metrics for repositories on project: ',
    empty: 'No valid repositories configured. Add GitHub repository URLs to this product to view code quality metrics.',
  },
};

function getErrorMessage(error: unknown) {
  if (isAxiosError(error) && typeof error.response?.data?.error === 'string') {
    return error.response.data.error;
  }

  return 'Unable to load the AI usage report. Please try again later.';
}

export default function AiUsageReports({ cloud, licencePlate }: { cloud: 'private' | 'public'; licencePlate: string }) {
  const [view, setView] = useState<AiUsageReportKey>('team');
  const { heading, description, empty } = views[view];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['aiUsageEmbed', cloud, licencePlate, view],
    queryFn: () => fetchers[cloud](licencePlate, view),
    enabled: !!licencePlate,
    // Embed tokens expire, so fetch a fresh one each time a view is shown rather than reusing a cached one.
    gcTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  let content: ReactNode;

  if (isLoading) {
    content = <Loader />;
  } else if (isError || !data) {
    content = (
      <Alert color="red" title="Report unavailable">
        {getErrorMessage(error)}
      </Alert>
    );
  } else if (!data.available) {
    content = <Alert color="blue">{empty}</Alert>;
  } else {
    content = <FabricReportEmbed key={data.embedToken} info={data} onReload={() => refetch()} />;
  }

  return (
    <div className="rounded-lg bg-white p-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="m-0 text-2xl font-semibold text-bcblue">{heading}</h2>
          <SegmentedControl
            aria-label="AI usage view"
            value={view}
            onChange={(value) => setView(value as AiUsageReportKey)}
            data={Object.entries(views).map(([value, { label }]) => ({ value, label }))}
          />
        </div>
        <p className="mt-2 text-gray-600">
          {description}
          <strong className="text-black">{licencePlate}</strong>
        </p>
      </div>
      {content}
    </div>
  );
}
```

Each cloud's `ai-usage/page.tsx` (use `cloud="public"` on the public side):

```tsx
'use client';

import { useParams } from 'next/navigation';
import AiUsageReports from '@/components/fabric/AiUsageReports';

export default function AiUsagePage() {
  const { licencePlate } = useParams<{ licencePlate: string }>();
  return <AiUsageReports cloud="private" licencePlate={licencePlate} />;
}
```

Tab entry for each `layout.tsx`:

```ts
{
  label: 'AI USAGE',
  name: 'ai-usage',
  href: `/public-cloud/products/${licencePlate}/ai-usage`,
},
```

## Running it locally

Add these to `app/.env.local`. Ask me for the values if you need them

```
FABRIC_TENANT_ID=
FABRIC_CLIENT_ID=
FABRIC_CLIENT_SECRET=
FABRIC_WORKSPACE_ID=
FABRIC_AI_USAGE_TEAM_REPORT_ID=
FABRIC_AI_USAGE_CODE_QUALITY_REPORT_ID=
```

Then open a product's AI USAGE tab. To check the API on its own, call
`/api/private-cloud/products/<licencePlate>/ai-usage-embed/team` while logged in.

## Notes

- **Shared report data:** filtering is for display, not access control. An embed token can read
  the report's whole semantic model, so a determined user could see other teams' rows. We've
  accepted this for now. Row-level security can be added later in `services/fabric.ts` without UI
  changes.
- **Cross-organization matches:** the code-quality report uses two independent filters
  (organization, repository). A product with repositories in several organizations could also
  match same-named repositories across those organizations.
- **Token expiry:** tokens last up to about an hour. There's no silent refresh yet, so users get a
  "Reload" prompt instead.
- **Deployment:** Vault needs all six `FABRIC_*` keys in every environment before 3238 deploys.
  That's being handled separately.
