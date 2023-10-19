import { useFormContext, useWatch, Controller } from "react-hook-form";
import { Question } from "@/components/assets/question";
import { useEffect, useState } from "react";
import AccountCodingInput from "@/components/form/AccountCodingInput";
import classNames from "@/components/utils/classnames";

export default function AccountCoding({ disabled }: { disabled: boolean }) {
  const {
    formState: { errors },
    control,
    setValue,
    trigger,
    clearErrors,
    getValues,
    watch
  } = useFormContext();

  const accountCodingInitial = getValues("accountCoding");

  const [accountCoding, setAccountCoding] = useState({
    clientCode: "",
    serviceLine: "",
    projectCode: "",
    responsibilityCentre: "",
    standardObjectOfExpense: ""
  });

  useEffect(() => {
    setAccountCoding({
      clientCode: accountCodingInitial?.slice(0, 3),
      serviceLine: accountCodingInitial?.slice(3, 8),
      projectCode: accountCodingInitial?.slice(8, 15),
      responsibilityCentre: accountCodingInitial?.slice(15, 20),
      standardObjectOfExpense: accountCodingInitial?.slice(20, 24)
    });
  }, [accountCodingInitial]);

  if (typeof accountCodingInitial === "string") {
    console.log(accountCodingInitial.length);
  }

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        4. Billing (Account Coding)
      </h2>
      <p className="font-bcsans text-base leading-6 mt-5">
        Please refer to the Memorandum of Understanding (MoU) signed for this
        project to enter the information required below. Please make sure that
        the information entered below matches the account coding on the MoU for
        this project.{" "}
        <b>
          If the account coding is changed at any point, all charges in the
          current quarter will be applied to the new account coding.
        </b>
      </p>
      <div>
        <label htmlFor="name">Name:</label>
      </div>
      <div className="mt-5 grid grid-cols-1 gap-x-24 gap-y-6 sm:grid-cols-2">
        <AccountCodingInput
          title={"Client Code"}
          name={"clientCode"}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={3}
          placeholder={"Enter the client code here (e.g. 111)"}
        />
        <AccountCodingInput
          title={"Responsibility Centre (RC)"}
          name={"responsibilityCentre"}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={5}
          placeholder={"Enter the responsibility centre here (e.g. 22222)"}
        />
        <AccountCodingInput
          title={"Service Line (SL)"}
          name={"serviceLine"}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={5}
          placeholder={"Enter the service line here (e.g. 33333)"}
        />
        <AccountCodingInput
          title={"Standard Object of Expense (STOB)"}
          name={"standardObjectOfExpense"}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={4}
          placeholder={"Enter the STOB here (e.g. 4444)"}
        />
        <AccountCodingInput
          title={"Project Code"}
          name={"projectCode"}
          accountCoding={accountCoding}
          setAccountCoding={setAccountCoding}
          length={7}
          placeholder={"Enter the project code here (e.g. 7777777)"}
        />
      </div>

      <div className="relative mt-6 mb-3" data-te-input-wrapper-init>
        <p className="font-bcsans text-base leading-6 mb-2">Account Coding</p>
        <div className="bg-neutral-200 block w-full rounded-md py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-4 h-9">
          {Object.values(accountCoding).join(" ")}
        </div>

        {/* <Controller
          name="accountCoding"
          control={control}
          defaultValue={
            accountCodingInitial ? Object.values(accountCoding).join(" ") : ""
          }
          render={({ field }) => (
            <input
              type="text"
              className="bg-neutral-200 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              id="accountCoding"
              placeholder="Value populated from Client Code+Responsibility Centre (RC)+Service Line (SL)+Standard Object of Expense (STOB)+Project Code"
              disabled={true}
              value={Object.values(accountCoding).join(" ")}
              // onChange={(e) => {
              //   clearErrors("accountCoding"); // Clear previous errors

              //   // const valueWithoutSpaces = e.target.value.replace(/\s+/g, "");
              //   // field.onChange(valueWithoutSpaces); // Pass the value without spaces to React Hook Form

              //   trigger("accountCoding"); // Run validation for the 'accountCoding' field
              // }}
            />
          )}
        /> */}
        <Question />
        <label
          htmlFor="account-coding"
          className="pointer-events-none absolute left-3 top-0 mb-0 max-w-[90%] origin-[0_0] truncate pt-[0.37rem] leading-[1.6] text-neutral-500 transition-all duration-200 ease-out peer-focus:-translate-y-[0.9rem] peer-focus:scale-[0.8] peer-focus:text-primary peer-data-[te-input-state-active]:-translate-y-[0.9rem] peer-data-[te-input-state-active]:scale-[0.8] motion-reduce:transition-none dark:text-neutral-200 dark:peer-focus:text-primary"
        ></label>
        <p
          className={classNames(
            errors.accountCoding ? "text-red-400" : "",
            "mt-1 text-sm leading-6 text-gray-600 absolute"
          )}
        >
          {errors.accountCoding?.message?.toString()}
        </p>
      </div>
    </div>
  );
}
