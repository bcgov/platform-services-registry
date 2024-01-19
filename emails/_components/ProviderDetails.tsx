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
      <Heading className="text-lg">Landing Zone Details</Heading>
      <div>
        <Text className="mb-1 font-semibold">Provider </Text>
        <Text>{provider}</Text>

        <Text className="font-semibold mt-2">Budget</Text>
        <div>
          <Text>Dev: USD ${budget.dev.toFixed(2)}</Text>
          <Text>Test: USD ${budget.test.toFixed(2)}</Text>
          <Text>Prod: USD ${budget.prod.toFixed(2)}</Text>
          <Text>Tools: USD ${budget.tools.toFixed(2)}</Text>
          <Text>Total: USD ${totalBudget.toFixed(2)}</Text>
        </div>
        <Text className="font-semibold mt-2">Account Coding</Text>
        <Text>{accountCoding}</Text>
      </div>
    </div>
  );
}
