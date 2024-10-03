import { QuotaUpgradeResourceDetail, ResourceType, Env } from '@prisma/client';
import { Heading, Link, Text, Hr } from '@react-email/components';
import _groupBy from 'lodash-es/groupBy';
import _orderBy from 'lodash-es/orderBy';
import { formatCpu, formatMemory } from '@/helpers/resource-metrics';

export default function QuotaUpgradeResources({
  resourceDetailList,
}: {
  resourceDetailList: QuotaUpgradeResourceDetail[];
}) {
  if (resourceDetailList.length === 0) return <></>;

  const orderedResources = _orderBy(resourceDetailList, ['env', 'resourceType'], ['asc', 'asc']);
  const groupsByEnv = _groupBy(orderedResources, 'env');

  return (
    <>
      <Hr className="my-4" />
      <Heading className="text-lg mb-0 text-black">Quota Upgrade Resources</Heading>
      {Object.values(Env).map((env, index) => {
        const items = groupsByEnv[env];
        if (!items) return null;

        return (
          <div key={index}>
            <Heading className="text-base mb-0 text-black">Environment: {env}</Heading>
            {items.map((item, index2) => {
              const formatter = item.resourceType === ResourceType.cpu ? formatCpu : formatMemory;

              return (
                <div key={index2}>
                  <Text className="mt-4 mb-0 font-semibold h-4">Resource</Text>
                  <Text className="mt-0 mb-0">{item.resourceType}</Text>
                  <Text className="mt-4 mb-0 font-semibold h-4">Allocation</Text>
                  <Text className="mt-2 mb-0">
                    Request: {formatter(item.allocation.request)} / Limit: {formatter(item.allocation.limit)}
                  </Text>
                  <Text className="mt-4 mb-0 font-semibold h-4">Deployment</Text>
                  <Text className="mt-2 mb-0">
                    Request: {formatter(item.deployment.request)} / Limit: {formatter(item.deployment.limit)} / Usage:{' '}
                    {formatter(item.deployment.usage)}
                  </Text>
                </div>
              );
            })}
          </div>
        );
      })}
    </>
  );
}
