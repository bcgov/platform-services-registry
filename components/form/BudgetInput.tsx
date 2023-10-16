import { useFormContext, Controller } from "react-hook-form";
import { Question } from "@/components/assets/question";

export default function BudgetInput({
    disabled,
    title,
    name,
}: {
    disabled: boolean;
    title: string;
    name: string;
}) {
    const {
        control
    } = useFormContext();
    return (
        <div className="relative mb-3" data-te-input-wrapper-init>
        <p className="font-bcsans text-base leading-6 mb-2">
            {title}
        </p>
        <Controller
            name={name}
            control={control}
            defaultValue=""
            render={({ field }) => <input
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                id={name}
                placeholder={"Enter amount here"}
                {...field}
            />}
        />
        <Question />
        <label
            htmlFor="dev-budget"
            className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
        >
        </label>                    
    </div>
    );
}