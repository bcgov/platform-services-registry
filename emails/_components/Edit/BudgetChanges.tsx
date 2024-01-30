import { Heading, Text } from '@react-email/components';

type Budget = { dev: number; test: number; prod: number; tools: number };
type BudgetKey = keyof Budget;

export default function BudgetChanges({
  budgetCurrent,
  budgetRequested,
  accountCodingCurrent,
  accountCodingRequested,
}: {
  budgetCurrent: Budget;
  budgetRequested: Budget;
  accountCodingCurrent: string;
  accountCodingRequested: string;
}) {
  const budgetChanged = (Object.keys(budgetCurrent) as BudgetKey[]).some(
    (key) => budgetCurrent[key] !== budgetRequested[key],
  );

  return (
    <div>
      {budgetChanged && (
        <>
          <Heading className="text-lg text-black mb-2">Budget Changes</Heading>
          {(Object.keys(budgetCurrent) as BudgetKey[]).map((key) => {
            const currentValue = budgetCurrent[key];
            const requestedValue = budgetRequested[key];

            if (currentValue !== requestedValue) {
              return (
                <div key={key} className="mb-4">
                  <Text className="font-semibold">{key.toUpperCase()} Budget</Text>
                  <Text className="mt-0 mb-0">Current: USD ${currentValue.toFixed(2)}</Text>
                  <Text className="mt-0 mb-0">Updated: USD ${requestedValue.toFixed(2)}</Text>
                </div>
              );
            }
            return null;
          })}
        </>
      )}

      {accountCodingCurrent !== accountCodingRequested && (
        <>
          <Heading className="text-lg text-black mb-2">Account Coding Changes</Heading>
          <div>
            <Text className="mb-0">Current Account Coding: {accountCodingCurrent}</Text>
            <Text className="mt-0 mb-0">Updated Account Coding: {accountCodingRequested}</Text>
          </div>
        </>
      )}
    </div>
  );
}
