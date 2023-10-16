import { clear } from "console";
import React, { useEffect, useState } from "react";
import { useFormContext, Controller } from "react-hook-form";

const commonComponents = [
  { name: "addressAndGeolocation", label: "Address and Geolocation" },
  {
    name: "workflowManagement",
    label: "Workflow Management (similar to Camunda)",
  },
  {
    name: "formDesignAndSubmission",
    label: "Form Design and Submission (similar to CHEFS, Gravity, Orbeon)",
  },
  {
    name: "identityManagement",
    label: "Identity management (user authentication and authorization)",
  },
  {
    name: "paymentServices",
    label:
      "Payment services (i.e. collection, processing, reconciliation, ledger management)",
  },
  {
    name: "documentManagement",
    label:
      "Document Management (file storage and transfer, PDF and other document generation)",
  },
  {
    name: "endUserNotificationAndSubscription",
    label:
      "End user notification and subscription service (email, text messages, automated phone calls, in-app pop up messages)",
  },
  { name: "publishing", label: "Publishing (web content management)" },
  {
    name: "businessIntelligence",
    label:
      "Business Intelligence Dashboard and Metrics reporting (i.e. diagrams and pie charts, report generation)",
  },
];

export default function CommonComponents({ disabled }: { disabled?: boolean }) {
  const {
    register,
    formState: { errors },
    setValue,
    control,
    clearErrors,
    watch,
  } = useFormContext();

  const noServices = watch("commonComponents.noServices");

  useEffect(() => {
    if (noServices) {
      // set every common component to false
      commonComponents.forEach(({ name }) => {
        setValue(`commonComponents.${name}.implemented`, false);
        setValue(`commonComponents.${name}.planningToUse`, false);
      });
    }
  }, [noServices, setValue]);

  // const handleCheckboxChange = (name, field) => {
  //   setValue(`commonComponents.${name}.${field}`, true);
  //   setValue(
  //     `commonComponents.${name}.${
  //       field === "implemented" ? "planningToUse" : "implemented"
  //     }`,
  //     false
  //   );
  // };

  const handleCheckboxChange = (
    name: string,
    field: string,
    checked: boolean
  ) => {
    setValue(`commonComponents.${name}.${field}`, checked);
    // Uncheck the other checkbox if this one is checked
    if (checked) {
      setValue(
        `commonComponents.${name}.${
          field === "implemented" ? "planningToUse" : "implemented"
        }`,
        false
      );
    }
    setValue("commonComponents.noServices", false);
    clearErrors("commonComponents.noServices");
  };

  // const watchedCommonComponents = watch("commonComponents");

  // // Check whether "planningToUse" or "implemented" is checked and uncheck the other
  // useEffect(() => {
  //   commonComponents.forEach(({ name }) => {
  //     const componentState = watchedCommonComponents?.[name];

  //     console.log("componentState");
  //     console.log(componentState);

  //     if (componentState) {
  //       if (componentState.planningToUse) {
  //         setValue(`commonComponents.${name}.implemented`, false);
  //       }
  //       if (componentState.implemented) {
  //         setValue(`commonComponents.${name}.planningToUse`, false);
  //       }
  //     }
  //   });
  // }, [watchedCommonComponents, setValue]);

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
                  disabled={disabled}
                  id="none"
                  type="checkbox"
                  {...register("commonComponents.noServices")}
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
                  Please select &quot;The app does not use any of these
                  services&quot; if you are not using any of common components
                  below
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
                    <Controller
                      name={`commonComponents.${name}.implemented`}
                      control={control}
                      defaultValue={false}
                      render={({ field }) => (
                        <input
                          disabled={disabled}
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) =>
                            handleCheckboxChange(
                              name,
                              "implemented",
                              e.target.checked
                            )
                          }
                        />
                      )}
                    />
                    {/* <input
                      id={name}
                      type="checkbox"
                      {...register(`commonComponents.${name}.implemented`)}
                      className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    /> */}
                    <label
                      htmlFor={`${name}-implemented`}
                      className="font-bcsans text-base ml-3 block font-medium leading-6 text-gray-900"
                    >
                      Implemented
                    </label>
                  </div>
                  <div className="flex items-center">
                    <Controller
                      name={`commonComponents.${name}.planningToUse`}
                      control={control}
                      defaultValue={false}
                      disabled={disabled}
                      render={({ field }) => (
                        <input
                          disabled={disabled}
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) =>
                            handleCheckboxChange(
                              name,
                              "planningToUse",
                              e.target.checked
                            )
                          }
                        />
                      )}
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
                disabled={disabled}
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
