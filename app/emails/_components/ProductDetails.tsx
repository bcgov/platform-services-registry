import { Heading, Link, Text, Hr, Section } from '@react-email/components';
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
          <Text
            style={{
              margin: '0 0 8px',
              fontSize: '14px',
              lineHeight: '24px',
              fontWeight: 600,
            }}
          >
            Repositories:
          </Text>

          {repositories?.length ? (
            <div>
              {repositories.map(({ url }) => (
                <Text key={url} className="my-1">
                  <Link href={url}>{url}</Link>
                </Text>
              ))}
            </div>
          ) : (
            <Section
              style={{
                boxSizing: 'border-box',
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                backgroundColor: '#fffbeb',
              }}
            >
              <Text
                style={{
                  margin: '0',
                  color: '#78350f',
                  fontSize: '14px',
                  lineHeight: '24px',
                  fontWeight: 600,
                }}
              >
                Action required: Repository information is missing
              </Text>

              <Text
                style={{
                  margin: '8px 0 0',
                  color: '#78350f',
                  fontSize: '14px',
                  lineHeight: '24px',
                }}
              >
                No repository URLs are currently associated with this product.
              </Text>

              <Text
                style={{
                  margin: '8px 0 0',
                  color: '#78350f',
                  fontSize: '14px',
                  lineHeight: '24px',
                }}
              >
                Please update your product in the Platform Product Registry by doing one of the following:
              </Text>

              <ul
                style={{
                  margin: '8px 0 0',
                  paddingLeft: '24px',
                  color: '#78350f',
                  fontSize: '14px',
                  lineHeight: '24px',
                }}
              >
                <li style={{ marginBottom: '4px' }}>Add the URL for any repository associated with your product</li>
                <li>
                  Select <strong>No</strong> for “Does this product have repositories?” if your product has no
                  associated repositories
                </li>
              </ul>

              <Text
                style={{
                  margin: '8px 0 0',
                  color: '#78350f',
                  fontSize: '14px',
                  lineHeight: '24px',
                }}
              >
                You will continue to receive reminders until you complete one of these options.
              </Text>
            </Section>
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
