"use client";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PreviousButton from "@/components/buttons/Previous";
import { useSession } from "next-auth/react";
import CreateModal from "@/components/modal/CreatePrivateCloud";
import ReturnModal from "@/components/modal/Return";
import { useRouter } from "next/navigation";
import { CreateRequestPublicBodySchema } from "@/schema";
import ProjectDescriptionPublic from "@/components/form/ProjectDescriptionPublic";
import TeamContacts from "@/components/form/TeamContacts";
import Budget from "@/components/form/Budget";
import AccountCoding from "@/components/form/AccountCoding";

export default function Page() {
  const { data: session, status } = useSession({
    required: true
  });

  const router = useRouter();

  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    resolver: zodResolver(CreateRequestPublicBodySchema)
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    console.log(data);
    try {
      const response = await fetch("/api/public-cloud/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      console.log("response", response);

      if (!response.ok) {
        throw new Error("Network response was not ok for create request");
      }

      const result = await response.json();
      console.log("Success:", result);

      setOpenCreate(false);
      setOpenReturn(true);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const secondTechLeadOnClick = () => {
    setSecondTechLead(!secondTechLead);
    if (secondTechLead) {
      methods.unregister("secondaryTechnicalLead");
    }
  };
  return (
    <div>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(() => setOpenCreate(true))}>
          <div className="space-y-12">
            <ProjectDescriptionPublic disabled={false} />
            <TeamContacts
              disabled={false}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Budget disabled={false} />
            <AccountCoding disabled={false} />
          </div>
          <div className="mt-16 flex items-center justify-start gap-x-6">
            <PreviousButton />
            <button
              type="submit"
              className="flex mr-20 rounded-md bg-bcorange px-4 py-2.5 font-bcsans text-bcblue text-sm tracking-[.2em] shadow-sm hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              SUBMIT REQUEST
            </button>
          </div>
        </form>
      </FormProvider>
      <CreateModal
        open={openCreate}
        setOpen={setOpenCreate}
        handleSubmit={methods.handleSubmit(onSubmit)}
        isLoading={isLoading}
      />
      <ReturnModal
        open={openReturn}
        setOpen={setOpenReturn}
        redirectUrl="/public-cloud/requests"
      />
    </div>
  );
}
