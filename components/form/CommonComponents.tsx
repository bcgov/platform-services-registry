import React, { useEffect, useState } from "react";
import {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormSetError,
  UseFormClearErrors,
} from "react-hook-form";

interface Props {
  register: UseFormRegister<any>;
  setValue: UseFormSetValue<any>;
  setError: UseFormSetError<any>;
  clearErrors: UseFormClearErrors<any>;
  errors: FieldErrors;
}

const commonComponents = [
  { name: "addressAndGeolocation", label: "Address and Geolocation" },
  { name: "workflowManagement", label: "Workflow Management" },
  { name: "formDesignAndSubmission", label: "Form Design and Submission" },
  { name: "identityManagement", label: "Identity Management" },
  { name: "paymentServices", label: "Payment Services" },
  { name: "documentManagement", label: "Document Management" },
  {
    name: "endUserNotificationAndSubscription",
    label: "End User Notification and Subscription",
  },
  { name: "publishing", label: "Publishing" },
  { name: "businessIntelligence", label: "Business Intelligence" },
];

export default function CommonComponents({
  setValue,
  errors,
  setError,
  clearErrors,
}: Props) {
  const [checkedState, setCheckedState] = useState<Record<string, string>>({});
  const [noneSelected, setNoneSelected] = useState<boolean>(false);

  const onClickHandler = (name: string, value: string) => {
    setCheckedState((prevState) => ({
      ...prevState,
      [name]: prevState[name] === value ? "NOT_USING" : value,
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
    setValue("noneSelected", noneSelected);
  }, [checkedState, noneSelected, setValue]);

  // Validation check
  useEffect(() => {
    // If all checkboxes are not selected and noneSelected is also false
    if (
      Object.values(checkedState).every(
        (value) => value !== "IMPLEMENTED" && value !== "PLANNING_TO_USE"
      ) &&
      !noneSelected
    ) {
      setError("noSelection", {
        type: "manual",
        message: "Please select an option or 'no services'",
      });
    } else {
      clearErrors("noSelection");
    }
  }, [checkedState, noneSelected, setError, clearErrors]);

  return (
    <fieldset>
      <div className="space-y-5">
        <div className="flex items-center mt-8">
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
            className="ml-3 block text-sm font-medium leading-6 text-gray-900"
          >
            The app does not use any of these services
          </label>
        </div>
        {commonComponents.map(({ name, label }) => (
          <div className="relative flex flex-col" key={name}>
            <div className="text-sm leading-6">
              <label htmlFor={name} className="font-medium text-gray-900">
                {label}
              </label>
            </div>
            <div className="flex items-center mt-1 w-full sm:w-4/12 justify-between flex-wrap">
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
                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
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
                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                >
                  Planning to use
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
