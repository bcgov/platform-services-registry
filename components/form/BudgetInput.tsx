import { useFormContext, Controller } from 'react-hook-form';
import { Question } from '@/components/assets/question';
import classNames from '@/components/utils/classnames';

export default function BudgetInput({ disabled, title, name }: { disabled?: boolean; title: string; name: string }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="relative mb-3">
      <label htmlFor="street-address" className="block text-sm font-medium leading-6 text-gray-900 mb-2">
        {title}
      </label>
      <input
        disabled={disabled}
        defaultValue={50}
        type="number"
        className={classNames(
          'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6',
          disabled
            ? 'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200 disabled:shadow-noneinvalid:border-pink-500 invalid:text-pink-600 focus:invalid:border-pink-500 focus:invalid:ring-pink-500'
            : '',
        )}
        placeholder={'Enter amount here'}
        {...register(name, {
          valueAsNumber: true,
        })}
      />
      <Question />
    </div>
  );
}
