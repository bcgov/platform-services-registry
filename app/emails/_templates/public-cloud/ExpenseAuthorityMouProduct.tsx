import { Heading, Text, Link } from '@react-email/components';
import * as React from 'react';
import { BASE_URL } from '@/config';
import Closing from '@/emails/_components/Closing';
import Layout from '@/emails/_components/layout/Layout';
import ProductDetails from '@/emails/_components/ProductDetails';
import { PublicCloudProductDetail } from '@/types/public-cloud';

interface Props {
  product: PublicCloudProductDetail;
}

export default function ExpenseAuthorityMouProductTemplate({ product }: Props) {
  if (!product) return <></>;

  const {
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
    licencePlate,
    billing,
  } = product;

  const { accountCoding } = billing;

  return (
    <Layout>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <Heading className="text-lg">Expense Authority eMOU request</Heading>
        <Text>Hi {expenseAuthority?.firstName},</Text>
        <Text className="">
          You have an <span className="font-bold">Electronic Memorandum of Understanding (eMOU)</span> signing request
          for the product <span className="font-bold">{name}</span> on the Public Cloud.
        </Text>
        <Link href={`${BASE_URL}/public-cloud/products/${licencePlate}/edit`}>
          Please click this link to access the request page.
        </Link>
      </div>
      <div className="pb-6 mt-4 mb-4 border-solid border-0 border-b-1 border-slate-300">
        <ProductDetails
          name={name}
          description={description}
          ministry={ministry}
          po={projectOwner}
          tl1={primaryTechnicalLead}
          tl2={secondaryTechnicalLead}
          expenseAuthority={expenseAuthority}
          licencePlate={licencePlate}
        />
        <div>
          <Text className="mb-2 font-semibold h-4">Account Coding:</Text>
          <Text className="mt-0 mb-2 h-4">{accountCoding}</Text>
        </div>
      </div>
      <div>
        <Closing email="Cloud.Pathfinder@gov.bc.ca" team={'Cloud Pathfinder Team'} />
      </div>
    </Layout>
  );
}
