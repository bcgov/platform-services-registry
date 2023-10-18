"use client";

import { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { PublicCloudEditRequestBodySchema } from "@/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import PreviousButton from "@/components/buttons/Previous";
import { useSession } from "next-auth/react";
import CreateModal from "@/components/modal/CreatePrivateCloud";
import ReturnModal from "@/components/modal/Return";
import { useRouter } from "next/navigation";
import ProjectDescription from "@/components/form/ProjectDescriptionPublic";
import TeamContacts from "@/components/form/TeamContacts";
import { useQuery } from "@tanstack/react-query";
import SubmitButton from "@/components/buttons/SubmitButton";
import { PublicCloudProjectWithUsers } from "@/app/api/public-cloud/project/[licencePlate]/route";
import { PublicCloudRequestWithCurrentAndRequestedProject } from "@/app/api/public-cloud/request/[id]/route";
import Budget from "@/components/form/Budget";
import AccountCoding from "@/components/form/AccountCoding";

async function fetchProject(
  licencePlate: string
): Promise<PublicCloudProjectWithUsers> {
  const res = await fetch(`/api/public-cloud/project/${licencePlate}`);
  if (!res.ok) {
    throw new Error("Network response was not ok for fetch project");
  }

  // Re format data to work with form
  const data = await res.json();

  // Secondaty technical lead should only be included if it exists
  if (data.secondaryTechnicalLead === null) {
    delete data.secondaryTechnicalLead;
  }

  return data;
}

async function fetchActiveRequest(
  licencePlate: string
): Promise<PublicCloudRequestWithCurrentAndRequestedProject> {
  const res = await fetch(`/api/public-cloud/active-request/${licencePlate}`);

  if (!res.ok) {
    throw new Error("Network response was not ok for fetch active request");
  }

  // Re format data to work with form
  const data = await res.json();
  console.log("Active request data", data);

  return data;
}

export default function EditProject({
  params
}: {
  params: { licencePlate: string };
}) {
  const { data: session, status } = useSession({
    required: true
  });

  const router = useRouter();

  const [openCreate, setOpenCreate] = useState(false);
  const [openReturn, setOpenReturn] = useState(false);
  const [isDisabled, setDisabled] = useState(false);
  const [secondTechLead, setSecondTechLead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { data } = useQuery<PublicCloudProjectWithUsers, Error>(
    ["project", params.licencePlate],
    () => fetchProject(params.licencePlate),
    {
      enabled: !!params.licencePlate
    }
  );

  const { data: requestData } = useQuery<
    PublicCloudRequestWithCurrentAndRequestedProject,
    Error
  >(
    ["request", params.licencePlate],
    () => fetchActiveRequest(params.licencePlate),
    {
      enabled: !!params.licencePlate,
      onError: (error) => {
        console.log("error", error);
        setDisabled(true);
      }
    }
  );

  const methods = useForm({
    resolver: zodResolver(PublicCloudEditRequestBodySchema),
    values: data
  });

  useEffect(() => {
    if (requestData) {
      setDisabled(true);
    }
  }, [requestData]);

  const onSubmit = async (data: any) => {
    console.log("SUBMIT", data);
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/public-cloud/edit/${params.licencePlate}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(data)
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok for create request");
      }

      setOpenCreate(false);
      setOpenReturn(true);
    } catch (error) {
      setIsLoading(false);
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
            <ProjectDescription disabled={isDisabled} />
            <TeamContacts
              disabled={isDisabled}
              secondTechLead={secondTechLead}
              secondTechLeadOnClick={secondTechLeadOnClick}
            />
            <Budget disabled={false} />
            <AccountCoding disabled={false} />
          </div>
          <div className="mt-16 flex items-center justify-start gap-x-6">
            <PreviousButton />
            {!isDisabled ? (
              <div className="flex items-center justify-start gap-x-6">
                <SubmitButton text="SUBMIT REQUEST" />
              </div>
            ) : null}
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
