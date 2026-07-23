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
    | 'organization'
    | 'projectOwner'
    | 'primaryTechnicalLead'
    | 'secondaryTechnicalLead'
    | 'repositories'
  > &
    Partial<Pick<PublicCloudProductDetail, 'expenseAuthority'>>;
}

export default function ProductDetails({ product }: Props) {
  const {
    licencePlate,
    name,
    description,
    organization,
    projectOwner,
    primaryTechnicalLead,
    secondaryTechnicalLead,
    repositories,
    expenseAuthority,
  } = product;

  return (
    <>
      <Hr className="my-4" />
      <Heading className="text-lg">Product details</Heading>
      <div>
        <Text className="mb-2 font-semibold h-4">Product name: </Text>
        <Text className="mt-1 h-fit">{name}</Text>
        <Text className="mb-2 font-semibold h-4">Product description: </Text>
        <Text className="mt-1 h-fit">{description}</Text>
        <Text className="mb-2 font-semibold h-4">Licence plate: </Text>
        <Text className="mt-0 mb-2 h-4">{licencePlate}</Text>
        <div className="my-4">
          <Text className="mb-2 h-4 font-semibold">Repositories:</Text>

          {repositories?.length ? (
            <div>
              {repositories.map(({ url }) => (
                <Text key={url} className="my-1">
                  <Link href={url}>{url}</Link>
                </Text>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-solid border-amber-500 bg-amber-50 px-4 py-3">
              <Text className="m-0 font-semibold text-amber-900">
                Action required: Repository information is missing
              </Text>

              <Text className="mb-0 mt-2 text-amber-900">
                No repository URLs are currently associated with this product. Please update the product in the Product
                Registry and add all applicable source-code, infrastructure, and GitOps repository URLs as soon as
                possible.
              </Text>
            </div>
          )}
        </div>
        <Text className="mb-2 font-semibold h-4">Ministry: </Text>
        <Text className="mt-1 h-4">{organization.name}</Text>
        <Text className="mb-2 font-semibold h-4">Product owner: </Text>
        <Text className="mt-1 mb-2 h-4">{formatFullName(projectOwner)}</Text>
        <Link className="mt-0 h-4" href={`mailto:${projectOwner.email}`}>
          {projectOwner.email}
        </Link>
        <Text className="mb-2 font-semibold h-4">Technical lead: </Text>
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
