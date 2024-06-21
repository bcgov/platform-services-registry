import { Heading, Text } from '@react-email/components';

type Budget = {
  dev: number;
  test: number;
  prod: number;
  tools: number;
};

type EnvironmentsEnabled = { production: boolean; test: boolean; development: boolean; tools: boolean };

export default function ProviderDetails({
  provider,
  accountCoding,
  budget = { dev: 0, test: 0, prod: 0, tools: 0 },
  environmentsEnabled,
}: {
  provider: string;
  accountCoding: string;
  budget: Budget;
  environmentsEnabled: EnvironmentsEnabled;
}) {
  const totalBudget =
    (environmentsEnabled.development ? budget.dev : 0) +
    (environmentsEnabled.test ? budget.test : 0) +
    (environmentsEnabled.production ? budget.prod : 0) +
    (environmentsEnabled.tools ? budget.tools : 0);

  return (
    <div>
      <Text className="text-lg font-bold">Landing Zone Details</Text>
      <div>
        <div>
          <Text className="mb-0 font-semibold">Provider </Text>
          <Text className="mt-0">{provider}</Text>
        </div>

        <Text className="font-semibold mt-2">Budget</Text>
        <div>
          {environmentsEnabled.development && (
            <Text className="mt-0 mb-1">
              <b>Dev:</b> USD ${budget.dev.toFixed(2)}
            </Text>
          )}
          {environmentsEnabled.test && (
            <Text className="mt-0 mb-1">
              <b>Test:</b> USD ${budget.test.toFixed(2)}
            </Text>
          )}
          {environmentsEnabled.production && (
            <Text className="mt-0 mb-1">
              <b>Prod:</b> USD ${budget.prod.toFixed(2)}
            </Text>
          )}
          {environmentsEnabled.tools && (
            <Text className="mt-0 mb-3">
              <b>Tools:</b> USD ${budget.tools.toFixed(2)}
            </Text>
          )}
          <Text className="mt-0">
            <b>Total:</b> USD ${totalBudget.toFixed(2)}
          </Text>
        </div>
        <Text className="font-semibold mt-2 mb-0">Account Coding</Text>
        <Text className="mt-0">{accountCoding}</Text>
      </div>
    </div>
  );
}
