"use client";

import { useState, useEffect } from "react";
import AsyncAutocomplete from "@/components/form/AsyncAutocomplete";
import SecondTechLeadButton from "@/components/buttons/SecondTechLeadButton";
import { set, useForm, useFormContext, UseFormRegister } from "react-hook-form";
import { CreateRequestBodySchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import classNames from "@/components/utils/classnames";
import CommonComponents from "@/components/form/CommonComponents";
import PreviousButton from "@/components/buttons/Previous";
import { useSession } from "next-auth/react";
import CreateModal from "@/components/modal/Create";
import { redirect } from "next/navigation";

export default function Page() {
  const { data: session, status } = useSession({
    required: true,
  });

  const [open, setOpen] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    setError,
    setFocus,
    clearErrors,
    unregister,
    trigger,
  } = useForm({
    resolver: zodResolver(CreateRequestBodySchema),
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    console.log(data);
    try {
      const response = await fetch("/api/requests/private-cloud/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      console.log("response", response);

      if (!response.ok) {
        throw new Error("Network response was not ok for create request");
      }

      const result = await response.json();

      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error);
    }

    setIsLoading(false);
    redirect("/private-cloud/requests");
  };

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      unregister("secondaryTechnicalLead");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(() => setOpen(true))}>
        <div className="space-y-12">
          <div className="border-b border-gray-900/10 pb-14">
            <h1 className="font-bcsans text-xl lg:text-2xl 2xl:text-4xl font-semibold leading-7 text-gray-900 mb-8 lg:mt-20">
              Private Cloud OpenShift Platform - Project Set Provisioning
              Request
            </h1>
            <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
              1. Product Description
            </h2>
            <p className="font-bcsans text-base leading-6 mt-5">
              If this is your first time on the <b>OpenShift platform</b> you
              need to book an alignment meeting with the Platform Services team.
              Reach out to <b>Faisal Hamood</b> to get started.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="col-span-full">
                <label
                  htmlFor="street-address"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Product Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Enter product name"
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    {...register("name")}
                  />
                </div>
                <p
                  className={classNames(
                    errors.name ? "text-red-400" : "",
                    "mt-3 text-sm leading-6 text-gray-600"
                  )}
                >
                  Please provide a descriptibe product name with no acronyms
                </p>
              </div>

              <div className="col-span-full">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Description
                </label>
                <div className="mt-2">
                  <textarea
                    id="about"
                    placeholder="Enter a description..."
                    {...register("description")}
                    rows={3}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    // defaultValue={""}
                  />
                </div>
                <p
                  className={classNames(
                    errors.description ? "text-red-400" : "",
                    "mt-3 text-sm leading-6 text-gray-600"
                  )}
                >
                  Tell us more about your product
                </p>
              </div>
              <div className="sm:col-span-3">
                <label
                  htmlFor="ministry"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Ministry
                </label>
                <div className="mt-2">
                  <select
                    // name="ministry"
                    // id="first-name"
                    // autoComplete="given-name"

                    {...register("ministry")}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Ministry</option>
                    <option>CITZ</option>
                    <option>PSA</option>
                    <option>HLTH</option>
                  </select>

                  <p
                    className={classNames(
                      errors.ministry ? "text-red-400" : "",
                      "mt-3 text-sm leading-6 text-gray-600"
                    )}
                  >
                    Select the government ministry that this product belongs to
                  </p>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm font-medium leading-6 text-gray-900"
                >
                  Cluster
                </label>
                <div className="mt-2">
                  <select
                    {...register("cluster")}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  >
                    <option value="">Select Cluster</option>
                    <option>SILVER</option>
                    <option>GOLD</option>
                    <option>KLAB</option>
                  </select>
                  <p
                    className={classNames(
                      errors.cluster ? "text-red-400" : "",
                      "mt-3 text-sm leading-6 text-gray-600"
                    )}
                  >
                    Select your cluster Select CLAB or KLAB for testing purposes
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
              2. Team Contacts
            </h2>

            <div className="mt-6 2xl:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">
              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
                    Product Owner (PO)
                  </h3>
                  <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
                    Tell us about the Product Owner (PO). This is typically the
                    business owner of the application. We will use this
                    information to contact them with any non-technical
                    questions. Please use only IDIR linked email address below.
                  </p>
                </div>
                <AsyncAutocomplete
                  name="projectOwner"
                  className="mt-8"
                  label="Product Owner Email"
                  placeHolder="Search project owner's IDIR email address"
                  control={control}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  setError={setError}
                  clearErrors={clearErrors}
                />
              </div>

              <div className="flex flex-col justify-between">
                <div>
                  <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
                    Technical Lead (TL)
                  </h3>
                  <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
                    This is typically the DevOps specialist. We use this
                    information to contact them with technical questions or
                    notify them about platform events. You require a Primary
                    Technical Lead, a Secondary Technical Lead is optional.
                    Please use only IDIR linked email address below.
                  </p>
                </div>
                <AsyncAutocomplete
                  name="primaryTechnicalLead"
                  className="mt-8"
                  label="Technical Lead Email"
                  placeHolder="Search project owner's IDIR email address"
                  control={control}
                  register={register}
                  errors={errors}
                  setValue={setValue}
                  setError={setError}
                  clearErrors={clearErrors}
                />
              </div>

              <div className="mt-6 flex flex-col justify-between sm:col-start-2">
                <SecondTechLeadButton
                  clicked={secondTechLead}
                  onClick={secondTechLeadOnClick}
                />

                {secondTechLead ? (
                  <div className="mt-6">
                    <div>
                      <h3 className="font-bcsans text-base 2xl:text-xl font-semibold leading-7 text-gray-900">
                        Technical Lead (TL)
                      </h3>
                      <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
                        This is typically the DevOps specialist. We use this
                        information to contact them with technical questions or
                        notify them about platform events. You require a Primary
                        Technical Lead, a Secondary Technical Lead is optional.
                        Please use only IDIR linked email address below.
                      </p>
                    </div>
                    <AsyncAutocomplete
                      name="secondaryTechnicalLead"
                      className="mt-8"
                      label="Technical Lead Email"
                      placeHolder="Search project owner's IDIR email address"
                      control={control}
                      register={register}
                      errors={errors}
                      setValue={setValue}
                      setError={setError}
                      clearErrors={clearErrors}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="">
            <h2 className="font-bcsans text-base lg:text-lg 2xl:text-2xl font-semibold leading-6 text-gray-900 2xl:mt-14">
              3. Common Components
            </h2>
            <p className="font-bcsans mt-4 text-base leading-6 text-gray-600">
              Please indicate what services you expect to utilize as part of
              your product.
            </p>

            <div className="mt-12 space-y-10 ">
              <CommonComponents
                register={register}
                errors={errors}
                setValue={setValue}
                setError={setError}
                clearErrors={clearErrors}
              />
            </div>
          </div>
        </div>

        <div className="mt-16 flex items-center justify-start gap-x-6">
          <PreviousButton />
          {/* <SubmitButton /> */}
          <button
            type="submit"
            className="flex mr-20 rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            SUBMIT REQUEST
          </button>
        </div>
      </form>
      <CreateModal
        open={open}
        setOpen={setOpen}
        handleSubmit={handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
    </div>
  );
}
