"use client";

import { useState } from "react";

import { useForm } from "react-hook-form";
import { EditRequestBodySchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import CommonComponents from "@/components/form/CommonComponents";
import PreviousButton from "@/components/buttons/Previous";
import { useSession } from "next-auth/react";
import CreateModal from "@/components/modal/Create";
import { useRouter } from "next/navigation";
import ProjectDescription from "@/components/form/ProjectDescription";
import TeamContacts from "@/components/form/TeamContacts";
import Quotas from "@/components/form/Quotas";

export default function Page() {
  const { data: session, status } = useSession({
    required: true,
  });

  const { push } = useRouter();

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
    resolver: zodResolver(EditRequestBodySchema),
  });

  console.log("WATCH")
  console.log(watch());

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
    push("/private-cloud/products");
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
          <ProjectDescription register={register} errors={errors} />
          <TeamContacts
            register={register}
            errors={errors}
            setValue={setValue}
            setError={setError}
            clearErrors={clearErrors}
            secondTechLead={secondTechLead}
            secondTechLeadOnClick={secondTechLeadOnClick}
            control={control}
          />
          <Quotas register={register} errors={errors} licensePlate="ac4r5" />
        </div>
        <div className="mt-16 flex items-center justify-start gap-x-6">
          <PreviousButton />
          <button
            type="submit"
            className="flex mr-20 rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            APPROVE REQUEST
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
