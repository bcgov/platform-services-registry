import _startCase from 'lodash-es/startCase';
import ExternalLink from '@/components/generic/button/ExternalLink';

export default function QuotasDescription() {
  return (
    <>
      <p className="text-base leading-6 mt-5">
        Increasing your quota requires the Platform Services Team&rsquo;s approval, and must have supporting information
        as per our&nbsp;
        <ExternalLink href="https://developer.gov.bc.ca/docs/default/component/platform-developer-docs/docs/automation-and-resiliency/request-quota-adjustment-for-openshift-project-set/">
          quota adjustment documentation
        </ExternalLink>
        . Any quota increases without supporting information&nbsp;
        <span className="font-bold text-red-600 uppercase">will not</span> be processed.
      </p>
      <div className="text-base leading-6 mt-5">
        Your request for additional CPU, Memory, and Storage will be automatically approved if{' '}
        <span className="font-bold text-red-600 uppercase">all</span> of the following conditions are met:
        <ol className="list-decimal pl-5">
          <b>For CPU and Memory:</b>

          <li>Your namespace’s resource utilization rate is at least 35%.</li>
          <li>
            The adjustment satisfies one of the following:
            <ul className="list-disc pl-5">
              <li>Starts from a minimum of 1 core for CPU and 2GB for memory, or</li>
              <li>Does not exceed a 50% increase in the quota.</li>
            </ul>
          </li>
        </ol>
        <ol className="list-decimal pl-5">
          <b>For Storage:</b>

          <li>Your namespace’s current usage exceeds 80% of its requested capacity.</li>
          <li>
            The adjustment satisfies one of the following:
            <ul className="list-disc pl-5">
              <li>Is 32GB or less, or</li>
              <li>Does not exceed a 50% increase in the current capacity.</li>
            </ul>
          </li>
        </ol>
      </div>
    </>
  );
}
