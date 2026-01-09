import { Link, Text } from '@react-email/components';

export default function Support() {
  return (
    <Text>
      Answers to common questions are available in our{' '}
      <Link className="mt-0 h-4" href={`https://developer.gov.bc.ca/docs/default/component/public-cloud-techdocs`}>
        technical documentation
      </Link>
      . For additional assistance, please submit a support request through the{' '}
      <Link className="mt-0 h-4" href={`https://citz-do.atlassian.net/servicedesk/customer/portal/3`}>
        JSM support portal
      </Link>
      .
    </Text>
  );
}
