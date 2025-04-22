import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import _sumBy from 'lodash-es/sumBy';
import { ReactNode, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import ExternalLink from '@/components/generic/button/ExternalLink';
import FormDollarInput from '@/components/generic/input/FormDollarInput';
import HookFormDollarInput from '@/components/generic/input/HookFormDollarInput';
import { Provider } from '@/prisma/types';

export default function Budget({ disabled, mode }: { disabled?: boolean; mode?: 'create' | 'edit' }) {
  const {
    formState: { errors },
    setValue,
    watch,
  } = useFormContext();

  const provider = watch('provider', null);
  const budget = watch('budget', {});
  const environmentsEnabled = watch('environmentsEnabled', {});

  useEffect(() => {
    if (mode !== 'create') return;

    ['budget.dev', 'budget.test', 'budget.prod', 'budget.tools'].forEach((key) => {
      setValue(key, provider === Provider.AZURE ? 0 : 50, { shouldDirty: true });
    });
  }, [provider]);

  const values: number[] = [];
  if (environmentsEnabled.development) values.push(budget.dev);
  if (environmentsEnabled.test) values.push(budget.test);
  if (environmentsEnabled.production) values.push(budget.prod);
  if (environmentsEnabled.tools) values.push(budget.tools);

  const totalBudget = _sumBy(values, (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  });

  const formattedTotalBudget = parseFloat(totalBudget.toFixed(2));

  let calculatorLink: ReactNode = null;
  let calculatorNote: ReactNode = null;
  let alert: ReactNode = null;
  let currency = 'USD';

  switch (provider) {
    case Provider.AWS:
    case Provider.AWS_LZA:
      calculatorLink = <ExternalLink href="https://calculator.aws/#/">AWS Cost Calculator</ExternalLink>;
      alert = (
        <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />} className="mt-1">
          There will be a base charge of USD 200 to 300 per month for each project set created
        </Alert>
      );
      currency = 'USD';
      break;
    case Provider.AZURE:
      calculatorLink = (
        <ExternalLink href="https://azure.microsoft.com/en-ca/pricing/calculator">
          Azure Pricing Calculator
        </ExternalLink>
      );
      currency = 'CAD';
      break;
  }

  if (calculatorLink) calculatorNote = <span>&nbsp;&#40;Try the {calculatorLink} to get an estimate&#41;</span>;

  return (
    <div className="">
      <p className="text-base leading-6 mt-5">
        Please indicate your estimated monthly budget{calculatorNote}. Provide an estimated average monthly spend
        allocated to your cloud service usage for this project. As a part of this request, you will be provisioned with
        one to four accounts - Dev, Test, Prod and Tools. Please specify the estimate for each of these accounts.{' '}
        <b>
          Please note that this estimate are projected numbers that will only be used to send your team a warning when
          the monthly spend reaches 80% of your estimated budget.
        </b>
      </p>

      {alert}

      <div className="mt-5 grid grid-cols-1 gap-x-24 gap-y-6 sm:grid-cols-2">
        <HookFormDollarInput
          disabled={disabled || !environmentsEnabled.development}
          label="Estimated average monthly spend - Development account"
          name="budget.dev"
          currency={currency}
          options={{ valueAsNumber: true }}
        />

        <HookFormDollarInput
          disabled={disabled || !environmentsEnabled.test}
          label="Estimated average monthly spend - Test account"
          name="budget.test"
          currency={currency}
          options={{ valueAsNumber: true }}
        />

        <HookFormDollarInput
          disabled={disabled || !environmentsEnabled.production}
          label="Estimated average monthly spend - Production account"
          name="budget.prod"
          currency={currency}
          options={{ valueAsNumber: true }}
        />

        <HookFormDollarInput
          disabled={disabled || !environmentsEnabled.tools}
          label="Estimated average monthly spend - Tools account"
          name="budget.tools"
          currency={currency}
          options={{ valueAsNumber: true }}
        />

        <FormDollarInput
          disabled
          label="Total estimated average monthly spend"
          name="total-estimate"
          currency={currency}
          value={formattedTotalBudget}
        />
      </div>
    </div>
  );
}
