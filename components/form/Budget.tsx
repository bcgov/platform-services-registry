import { useFormContext, useWatch } from "react-hook-form";
import {Question} from "@/components/assets/question";

export default function Budget({
    disabled
}: {
    disabled: boolean;
}) {
    const {
        register,
        formState: { errors },
        control
    } = useFormContext();

    const sumBudget = useWatch({
        control,
        name: "budget",
        defaultValue: "0",
    })

    return (
        <div className="border-b border-gray-900/10 pb-14">
            <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
                3. Project Budget
            </h2>
            <p className="font-bcsans text-base leading-6 mt-5">
                Please indicate your estimated monthly budget &#40;Try the
                <a className="text-blue-600 dark:text-blue-500 hover:underline" href={"https://www.thoughtco.com/html-code-for-common-symbols-and-signs-2654021"}> AWS Cost Calculator </a>
                to get an estimate&#41;. Provide an estimated average monthly spend allocated to your cloud service usage for this project. As a part of this request, you will be provisioned with four accounts - Dev, Test, Prod and Tools. Please specify the estimate for each of these accounts. <b>Please note that this estimate are projected numbers that will only be used to send your team a warning when the monthly spend reaches 80% of your estimated budget.</b>
            </p>
            <p className="bg-blue-50 mt-8 py-2 px-5 rounded-3xl flex font-bcsans text-sm text-blue-700">
                There will be a base charge of CAD 400 to 600 per month for each project set created
            </p>
            <div className="mt-5 grid grid-cols-1 gap-x-24 gap-y-8 sm:grid-cols-2">
                <div className="relative mb-3" data-te-input-wrapper-init>
                    <p className="font-bcsans text-base leading-6 mb-2">
                        Estimated average monthly spend - Development Account
                    </p>
                    <input
                        type="number"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        id="dev-budget"
                        placeholder="Enter amount here"
                        {...register("budget.dev")}
                    />
                    <Question/>
                    <label
                        htmlFor="dev-budget"
                        className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                    >
                    </label>
                </div>

                <div className="relative mb-3" data-te-input-wrapper-init>
                    <p className="font-bcsans text-base leading-6 mb-2">
                        Estimated average monthly spend - Test Account
                    </p>
                    <input
                        type="number"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        id="test-budget"
                        placeholder="Enter amount here"
                        {...register("budget.test")}
                    />
                    <Question/>
                    <label
                        htmlFor="test-budget"
                        className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                    >
                    </label>
                </div>
                <div className="relative mb-3" data-te-input-wrapper-init>
                    <p className="font-bcsans text-base leading-6 mb-2">
                        Estimated average monthly spend - Production Account
                    </p>
                    <input
                        type="number"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        id="prod-budget"
                        placeholder="Enter amount here"
                        {...register("budget.prod")}
                    />
                    <Question/>
                    <label
                        htmlFor="prod-budget"
                        className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                    >
                    </label>
                </div>
                <div className="relative mb-3" data-te-input-wrapper-init>
                    <p className="font-bcsans text-base leading-6 mb-2">
                        Estimated average monthly spend - Tool Account
                    </p>
                    <input
                        type="number"
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        id="tool-budget"
                        placeholder="Enter amount here"
                        {...register("budget.tool")}
                    />
                    <Question/>
                    <label
                        htmlFor="tool-budget"
                        className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                    >
                    </label>
                </div>
                <div className="relative mb-3" data-te-input-wrapper-init>
                    <p className="font-bcsans text-base leading-6 mb-2">
                        Total Estimated average monthly spend
                    </p>
                    <input
                        type="number"
                        className="bg-neutral-200 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                        id="dev-budget"
                        placeholder="Value populated from Dev+Test+Prod+Tools"
                        disabled={true}
                        value={Number(sumBudget.dev) + Number(sumBudget.test) + Number(sumBudget.prod) + Number(sumBudget.tool)}
                    />
                    <Question/>
                    <label
                        htmlFor="dev-budget"
                        className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
                    >
                    </label>
                </div>
            </div>
        </div>
    );
}