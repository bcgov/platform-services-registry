import { useFormContext, Controller } from "react-hook-form";
import { Question } from "@/components/assets/question";

export default function BudgetInput({
  disabled,
  title,
  name
}: {
  disabled: boolean;
  title: string;
  name: string;
}) {
  const {
    register,
    formState: { errors }
  } = useFormContext();

  return (
    <div className="relative mb-3">
      <label
        htmlFor="street-address"
        className="block text-sm font-medium leading-6 text-gray-900"
      >
        {title}
      </label>
      <input
        disabled={disabled}
        defaultValue={50}
        type="number"
        className="mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
        placeholder={"Enter amount here"}
        {...register(name, {
          valueAsNumber: true
        })}
      />

      <Question />
    </div>
  );
}
