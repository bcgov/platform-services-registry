import { Heading, Link, Text, Hr } from '@react-email/components';
import { formatFullName } from '@/helpers/user';
import { PrivateCloudProductDetail } from '@/types/private-cloud';
import { PublicCloudProductDetail } from '@/types/public-cloud';

interface Props {
  product: Pick<
    PrivateCloudProductDetail,
    | 'licencePlate'
    | 'name'
    | 'description'
    | 'ministry'
    | 'projectOwner'
    | 'primaryTechnicalLead'
    | 'secondaryTechnicalLead'
  > &
    Partial<Pick<PublicCloudProductDetail, 'expenseAuthority'>>;
}

export default function ProductDetails({ product }: Props) {
  const {
    licencePlate,
    name,
    description,
    ministry,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    expenseAuthority,
  } = product;

  return (
    <>
      <Hr className="my-4" />
      <Heading className="text-lg">Product Details</Heading>
      <div>
        <Text className="mb-2 font-semibold h-4">Product Name: </Text>
        <Text className="mt-1 h-fit">{name}</Text>
        <Text className="mb-2 font-semibold h-4">Product Description: </Text>
        <Text className="mt-1 h-fit">{description}</Text>
        <Text className="mb-2 font-semibold h-4">Licence Plate: </Text>
        <Text className="mt-0 mb-2 h-4">{licencePlate}</Text>
        <Text className="mb-2 font-semibold h-4">Ministry: </Text>
        <Text className="mt-1 h-4">{ministry}</Text>
        <Text className="mb-2 font-semibold h-4">Product Owner: </Text>
        <Text className="mt-1 mb-2 h-4">{formatFullName(projectOwner)}</Text>
        <Link className="mt-0 h-4" href={`mailto:${projectOwner.email}`}>
          {projectOwner.email}
        </Link>
        <Text className="mb-2 font-semibold h-4">Technical Lead: </Text>
        <Text className="mt-0 mb-2 h-4">{formatFullName(primaryTechnicalLead)}</Text>
        <Link className="mt-0 h-4" href={`mailto:${primaryTechnicalLead.email}`}>
          {primaryTechnicalLead.email}
        </Link>
        {secondaryTechnicalLead && (
          <div>
            <Text className="mb-2 font-semibold h-4">Secondary Technical Lead: </Text>
            <Text className="mt-0 mb-2 h-4">{formatFullName(secondaryTechnicalLead)}</Text>
            <Link className="mt-0 h-4" href={`mailto:${secondaryTechnicalLead.email}`}>
              {secondaryTechnicalLead.email}
            </Link>
          </div>
        )}
        {expenseAuthority && (
          <div>
            <Text className="mb-2 font-semibold h-4">Expense Authority: </Text>
            <Text className="mt-0 mb-2 h-4">{formatFullName(expenseAuthority)}</Text>
            <Link className="mt-0 h-4" href={`mailto:${expenseAuthority.email}`}>
              {expenseAuthority.email}
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
