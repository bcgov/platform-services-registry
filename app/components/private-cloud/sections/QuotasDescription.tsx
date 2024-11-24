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
        If your request for more CPU and Memory meets all of the following requirements, it will be automatically
        approved:
        <ol className="list-decimal pl-5">
          <li>Your namespace’s current usage exceeds 85% of its total limit.</li>
          <li>Your namespace’s resource utilization rate is at least 35%.</li>
          <li>You are increasing your quota allotment to the next tier only.</li>
        </ol>
      </div>
      <div className="text-base leading-6 mt-5">
        If your request for more Storage meets all of the following requirements, it will be automatically approved:
        <ol className="list-decimal pl-5">
          <li>Your namespace’s current usage exceeds 80% of its PVC limit.</li>
          <li>You are increasing your quota allotment to the next tier only.</li>
        </ol>
      </div>
    </>
  );
}
