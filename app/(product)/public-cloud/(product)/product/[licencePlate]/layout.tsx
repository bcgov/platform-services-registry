import prisma from '@/core/prisma';

export default async function Layout({
  params,
  edit,
  decision,
}: {
  params: { licencePlate: string };
  edit: React.ReactNode;
  decision: React.ReactNode;
}) {
  const data = await prisma.publicCloudRequest.findFirst({
    where: {
      licencePlate: params.licencePlate,
      active: true,
    },
  });

  return <div className="mt-6">{!data ? edit : decision}</div>;
}
