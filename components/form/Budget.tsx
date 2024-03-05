import { useFormContext } from 'react-hook-form';
import classNames from '@/utils/classnames';
import BudgetInput from '@/components/form/BudgetInput';

export default function Budget({ disabled }: { disabled?: boolean }) {
  const {
    formState: { errors },
    watch,
  } = useFormContext();

  const budget = watch('budget', {});

  const totalBudget = [budget.dev, budget.test, budget.prod, budget.tools]
    .map((value) => Number(value) || 0)
    .reduce((sum, value) => sum + value, 0);

  const formattedTotalBudget = parseFloat(totalBudget.toFixed(2));

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        4. Project Budget
      </h2>
      <p className="font-bcsans text-base leading-6 mt-5">
        Please indicate your estimated monthly budget &#40;Try the{' '}
        <a
          className="text-blue-500 hover:text-blue-400"
          href={'https://calculator.aws/#/'}
          target="_blank"
          rel="noopener noreferrer"
        >
          AWS Cost Calculator
        </a>{' '}
        to get an estimate&#41;. Provide an estimated average monthly spend allocated to your cloud service usage for
        this project. As a part of this request, you will be provisioned with four accounts - Dev, Test, Prod and Tools.
        Please specify the estimate for each of these accounts.{' '}
        <b>
          Please note that this estimate are projected numbers that will only be used to send your team a warning when
          the monthly spend reaches 80% of your estimated budget.
        </b>
      </p>
      <p className="bg-blue-50 mt-8 py-2 px-5 rounded-3xl flex font-bcsans text-sm text-blue-700">
        There will be a base charge of USD 400 to 600 per month for each project set created
      </p>
      <div className="mt-5 grid grid-cols-1 gap-x-24 gap-y-6 sm:grid-cols-2">
        <BudgetInput
          disabled={disabled}
          title={'Estimated average monthly spend - Development Account'}
          name={'budget.dev'}
        />
        <BudgetInput
          disabled={disabled}
          title={'Estimated average monthly spend - Test Account'}
          name={'budget.test'}
        />
        <BudgetInput
          disabled={disabled}
          title={'Estimated average monthly spend - Production Account'}
          name={'budget.prod'}
        />
        <BudgetInput
          disabled={disabled}
          title={'Estimated average monthly spend - Tool Account '}
          name={'budget.tools'}
        />
        <div className="relative mb-3" data-te-input-wrapper-init>
          <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-1">
            Total Estimated average monthly spend
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
            <p className={classNames(errors.budget ? 'text-red-400' : '', 'mt-3 text-sm leading-6 text-gray-600')}>
              Budget is required, Every value should be no less than USD 50
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
