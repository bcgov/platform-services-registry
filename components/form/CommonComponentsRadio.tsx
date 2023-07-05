import { useState } from "react";
import { CommonComponentsInputSchema } from "@/schema";

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

export default function CommonComponents({ register, errors, unregister }) {
  const [checkToggle, setCheckToggle] = useState(true);

  const onClickHandler = (event) => {
    // if (event.target.checked) {
    // unregister(`commonComponents.${event.target.name}`);
    console.log(event.target.name);
    console.log(event.target.checked);
    console.log(event.target.value);
    // unregister(event.target.name);
    // }
  };

  return (
    <fieldset>
      <div className="space-y-5">
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
                  type="radio"
                  value={"IMPLEMENTED"}
                  defaultChecked={false}
                  {...register(`commonComponents.${name}`)}
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
                  type="radio"
                  value={"PLANNING_TO_USE"}
                  defaultChecked={false}
                  {...register(`commonComponents.${name}`)}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor={`${name}-planning`}
                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                >
                  Planning to use
                </label>
              </div>
              {/* <div className="flex items-center">
                <input
                  id={name}
                  name={name}
                  type="radio"
                  value={"NOT_USING"}
                  defaultChecked={true}
                  {...register(`commonComponents.${name}`)}
                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                />
                <label
                  htmlFor={`${name}-planning`}
                  className="ml-3 block text-sm font-medium leading-6 text-gray-900"
                >
                  Not using
                </label>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </fieldset>
  );
}
