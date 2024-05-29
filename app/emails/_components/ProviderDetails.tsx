import { Heading, Text } from '@react-email/components';

type Budget = {
  dev: number;
  test: number;
  prod: number;
  tools: number;
};

export default function ProviderDetails({
  provider,
  accountCoding,
  budget = { dev: 0, test: 0, prod: 0, tools: 0 },
}: {
  provider: string;
  accountCoding: string;
  budget: Budget;
}) {
  const totalBudget = budget.dev + budget.test + budget.prod + budget.tools;

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
          <Text className="mt-0 mb-1">
            <b>Dev:</b> USD ${budget.dev.toFixed(2)}
          </Text>
          <Text className="mt-0 mb-1">
            <b>Test:</b> USD ${budget.test.toFixed(2)}
          </Text>
          <Text className="mt-0 mb-1">
            <b>Prod:</b> USD ${budget.prod.toFixed(2)}
          </Text>
          <Text className="mt-0 mb-3">
            <b>Tools:</b> USD ${budget.tools.toFixed(2)}
          </Text>
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
