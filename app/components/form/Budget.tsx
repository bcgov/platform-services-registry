import { Alert } from '@mantine/core';
import { Provider } from '@prisma/client';
import { IconInfoCircle } from '@tabler/icons-react';
import _sumBy from 'lodash-es/sumBy';
import { useFormContext } from 'react-hook-form';
import BudgetInput from '@/components/form/BudgetInput';
import ExternalLink from '@/components/generic/button/ExternalLink';
import { cn } from '@/utils';

export default function Budget({ disabled }: { disabled?: boolean }) {
  const {
    formState: { errors },
    watch,
  } = useFormContext();

  const provider = watch('provider', null);
  const budget = watch('budget', {});
  const environmentsEnabled = watch('environmentsEnabled', {});

  const values = [];
  if (environmentsEnabled.development) values.push(budget.dev);
  if (environmentsEnabled.test) values.push(budget.test);
  if (environmentsEnabled.production) values.push(budget.prod);
  if (environmentsEnabled.tools) values.push(budget.tools);

  const totalBudget = _sumBy(values, (val) => {
    const num = Number(val);
    return isNaN(num) ? 0 : num;
  });

  const formattedTotalBudget = parseFloat(totalBudget.toFixed(2));

  let calculatorLink = null;
  let calculatorNote = null;

  switch (provider) {
    case Provider.AWS:
    case Provider.AWS_LZA:
      calculatorLink = <ExternalLink href="https://calculator.aws/#/">AWS Cost Calculator</ExternalLink>;
      break;
    case Provider.AZURE:
      calculatorLink = (
        <ExternalLink href="https://azure.microsoft.com/en-ca/pricing/calculator">
          Azure Pricing Calculator
        </ExternalLink>
      );
      break;
  }

  if (calculatorLink) calculatorNote = <span>&nbsp;&#40;Try the {calculatorLink} to get an estimate&#41;</span>;

  return (
    <div className="">
      <p className="text-base leading-6 mt-5">
        Please indicate your estimated monthly budget{calculatorNote}. Provide an estimated average monthly spend
        allocated to your cloud service usage for this project. As a part of this request, you will be provisioned with
        four accounts - Dev, Test, Prod and Tools. Please specify the estimate for each of these accounts.{' '}
        <b>
          Please note that this estimate are projected numbers that will only be used to send your team a warning when
          the monthly spend reaches 80% of your estimated budget.
        </b>
      </p>

      <Alert variant="light" color="blue" title="" icon={<IconInfoCircle />} className="mt-1">
        There will be a base charge of USD 200 to 300 per month for each project set created
      </Alert>

      <div className="mt-5 grid grid-cols-1 gap-x-24 gap-y-6 sm:grid-cols-2">
        <BudgetInput
          disabled={disabled || !environmentsEnabled.development}
          title={'Estimated average monthly spend - Development account'}
          name={'budget.dev'}
        />
        <BudgetInput
          disabled={disabled || !environmentsEnabled.test}
          title={'Estimated average monthly spend - Test account'}
          name={'budget.test'}
        />
        <BudgetInput
          disabled={disabled || !environmentsEnabled.production}
          title={'Estimated average monthly spend - Production account'}
          name={'budget.prod'}
        />
        <BudgetInput
          disabled={disabled || !environmentsEnabled.tools}
          title={'Estimated average monthly spend - Tool account '}
          name={'budget.tools'}
        />
        <div className="relative mb-3" data-te-input-wrapper-init>
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
            Total estimated average monthly spend
          </label>
          <input
            type="number"
            className="bg-neutral-200 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            id="total"
            placeholder="Value populated from Dev+Test+Prod+Tools"
            disabled={true}
            value={formattedTotalBudget}
          />
          <span className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"></span>
          {Object.keys(errors.budget || {}).length > 0 && (
            <p className={cn(errors.budget ? 'text-red-400' : 'text-gray-600', 'mt-3 text-sm leading-6')}>
              Budget is required, Every value should be no less than USD 50
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
