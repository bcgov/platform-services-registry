import { mergeAzureSubscriptions, normalizeStoredAzureSubscriptions } from './subscriptions';

describe('normalizeStoredAzureSubscriptions', () => {
  it('keeps valid subscription rows', () => {
    expect(
      normalizeStoredAzureSubscriptions([
        { environment: 'development', name: 'abc123-dev', subscriptionId: 'sub-1' },
        { environment: 'bogus', name: 'x', subscriptionId: 'sub-2' },
        { environment: 'production', name: '', subscriptionId: 'sub-3' },
      ]),
    ).toEqual([{ environment: 'development', name: 'abc123-dev', subscriptionId: 'sub-1' }]);
  });
});

describe('mergeAzureSubscriptions', () => {
  it('merges by environment with resolved overwriting existing', () => {
    const merged = mergeAzureSubscriptions(
      [{ environment: 'development', name: 'old-dev', subscriptionId: 'old' }],
      [
        { environment: 'development', name: 'new-dev', subscriptionId: 'new' },
        { environment: 'production', name: 'prod', subscriptionId: 'prod-id' },
      ],
    );

    expect(merged).toEqual([
      { environment: 'production', name: 'prod', subscriptionId: 'prod-id' },
      { environment: 'development', name: 'new-dev', subscriptionId: 'new' },
    ]);
  });
});
