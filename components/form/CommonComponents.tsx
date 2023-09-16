import React, { useEffect, useState } from "react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors
} from "react-hook-form";
import classNames from "@/components/utils/classnames";

interface Props {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  errors: FieldErrors;
}

const commonComponents = [
  { name: "addressAndGeolocation", label: "Address and Geolocation" },
  {
    name: "workflowManagement",
    label: "Workflow Management (similar to Camunda)"
  },
  {
    name: "formDesignAndSubmission",
    label: "Form Design and Submission (similar to CHEFS, Gravity, Orbeon)"
  },
  {
    name: "identityManagement",
    label: "Identity management (user authentication and authorization)"
  },
  {
    name: "paymentServices",
    label:
      "Payment services (i.e. collection, processing, reconciliation, ledger management)"
  },
  {
    name: "documentManagement",
    label:
      "Document Management (file storage and transfer, PDF and other document generation)"
  },
  {
    name: "endUserNotificationAndSubscription",
    label:
      "End user notification and subscription service (email, text messages, automated phone calls, in-app pop up messages)"
  },
  { name: "publishing", label: "Publishing (web content management)" },
  {
    name: "businessIntelligence",
    label:
      "Business Intelligence Dashboard and Metrics reporting (i.e. diagrams and pie charts, report generation)"
  }
];

export default function CommonComponents({
  setValue,
  errors,
  setError,
  clearErrors,
  register
}: Props) {
  const [checkedState, setCheckedState] = useState<Record<string, string>>({});
  const [noneSelected, setNoneSelected] = useState<boolean>(false);

  const onClickHandler = (name: string, value: string) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [name]: prevState[name] === value ? "NOT_USING" : value
    }));
    setNoneSelected(false); // Whenever an option is clicked, make sure noneSelected is turned off
  };

  const onNoneSelected = () => {
    if (noneSelected) {
      setNoneSelected(false); // If already selected, deselect it
    } else {
      setCheckedState({}); // Clear all other selections
      setNoneSelected(true); // Set noneSelected to true
    }
  };

  useEffect(() => {
    Object.entries(checkedState).forEach(([name, value]) => {
      setValue(`commonComponents.${name}`, value);
    });
    setValue("commonComponents.noServices", noneSelected);
  }, [checkedState, noneSelected, setValue]);

  // // Validation check
  // useEffect(() => {
  //   // If all checkboxes are not selected and noneSelected is also false
  //   if (
  //     Object.values(checkedState).every(
  //       (value) => value !== "IMPLEMENTED" && value !== "PLANNING_TO_USE"
  //     ) &&
  //     !noneSelected
  //   ) {
  //     setError("commonComponents.noServices", {
  //       type: "manual",
  //       message: "Please select an option or 'no services'",
  //     });
  //   } else {
  //     clearErrors("commonComponents.noServices");
  //   }
  // }, [checkedState, noneSelected, setError, clearErrors]);

  return (
    <div className="border-b border-gray-900/10 pb-14">
      <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
        3. Common Components
      </h2>
      <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
        Please indicate what services you expect to utilize as part of your
        product.
      </p>
      <div className="mt-12 space-y-10 ">
        <fieldset>
          <div className="space-y-9">
            <div className="flex flex-col">
              <div className="flex items-center">
                <input
                  id="none"
                  name="none"
                  type="checkbox"
                  checked={noneSelected}
                  onChange={onNoneSelected}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor="none"
                  className="ml-4 font-bcsans font-semibold text-base text-gray-900"
                >
                  The app does not use any of these services
                </label>
              </div>
              {errors.commonComponents ? (
                <label
                  htmlFor="none"
                  className="ml-8 block text-sm font-medium leading-6 text-red-400 mt-2"
                >
                  Please select &quot;The app does not use any of these services&quot; if
                  you are not using any of common components below
                </label>
              ) : null}
            </div>
            {commonComponents.map(({ name, label }) => (
              <div className="relative flex flex-col" key={name}>
                <div className="text-sm leading-6">
                  <label
                    htmlFor={name}
                    className="font-bcsans font-semibold text-base text-gray-900"
                  >
                    {label}
                  </label>
                </div>
                <div className="flex items-center w-full sm:w-4/12 justify-between flex-wrap mt-3">
                  <div className="flex items-center">
                    <input
                      id={name}
                      name={name}
                      type="checkbox"
                      checked={checkedState[name] === "IMPLEMENTED"}
                      onChange={() => onClickHandler(name, "IMPLEMENTED")}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor={`${name}-implemented`}
                      className="font-bcsans text-base ml-3 block font-medium leading-6 text-gray-900"
                    >
                      Implemented
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id={name}
                      name={name}
                      type="checkbox"
                      checked={checkedState[name] === "PLANNING_TO_USE"}
                      onChange={() => onClickHandler(name, "PLANNING_TO_USE")}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                    <label
                      htmlFor={`${name}-planning`}
                      className="font-bcsans text-base ml-3 block font-medium leading-6 text-gray-900"
                    >
                      Planning to use
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="col-span-full mt-10">
            <label
              htmlFor="street-address"
              className="font-bcsans font-semibold text-base text-gray-900"
            >
              Other
            </label>
            <div className="mt-2">
              <input
                type="text"
                placeholder="Please specify any other common components used"
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                {...register("commonComponents.other")}
              />
            </div>
          </div>
        </fieldset>
      </div>
    </div>
  );
}
