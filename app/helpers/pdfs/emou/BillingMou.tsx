import { formatFullName } from '@/helpers/user';
import { Provider } from '@/prisma/client';
import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';
import { formatDate } from '@/utils/js';
import { Product } from './types';

export const css = `
@page {
  size: LETTER;
  margin: 0.5cm;

  @top-left {
    content: element(header);
  }

  @top-right {
    content: "Page " counter(page) " of " counter(pages);
    font-style: italic;
  }
}

* {
  font-family: "BCSans", sans-serif;
}

.break {
  page-break-before: always;
}

table {
  border-collapse: collapse;
  width: 100%;
}

td,
th {
  border: 1px solid #000;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f4f4f4;
}

.header {
  position: running(header);
  font-style: italic;
}

.label {
  color: #6b6b6b;
}

.strong {
  font-weight: bold;
}

.mt-0 {
  margin-top: 0;
}

.text-center {
  text-align: center;
}

.font-semibold {
  font-weight: 600;
}

.mb-2 {
  margin-bottom: 0.5rem;
}
`;

export default function BillingMou({
  product,
  billing,
}: {
  product: Product;
  billing: PublicCloudBillingDetailDecorated;
}) {
  const isAWS = product.provider === Provider.AWS || product.provider === Provider.AWS_LZA;

  const service = isAWS ? 'AWS' : 'Microsoft Azure';
  const platform = isAWS ? 'Amazon Web Services (AWS) Landing Zone' : 'Microsoft Azure Landing Zone';

  const contract = isAWS ? 'existing cloud service contracts' : 'existing service and software licence contracts';

  const fee = isAWS ? '6% Shared Services Canada fee' : '6% CSBC administrative fee';

  return (
    <div>
      <div className="header">
        <div className="right">Printed on {formatDate(new Date())}</div>
      </div>

      <h1 className="text-center">Service Agreement</h1>

      <p>This agreement is between;</p>
      <p className="text-center font-semibold">Connected Services BC, hereby referred to as “CSBC”</p>

      <p>And</p>
      <p className="text-center font-semibold">The {product.name}, hereby referred to as “the Requester”</p>

      <p>
        For the consumption and use of CSBC’s cloud platform offering and related services, accessible to the
        Requester’s teams on the {platform} through CSBC’s {contract}.
      </p>

      <p>
        {isAWS
          ? 'AWS will invoice CSBC monthly for AWS services consumed, including Provincial Sales Tax (PST).'
          : 'Microsoft will invoice CSBC monthly for Azure services consumed, including Provincial Sales Tax (PST).'}
      </p>

      <p>
        Under CSBC&apos;s new voted funding model, most ministries will no longer be charged directly for platform
        services, as many client chargebacks have been eliminated. Broader Public Sector (BPS) organizations will
        continue to be charged under the existing cost-recovery model. Certain exclusions and exceptions also apply.
      </p>

      <p>
        If the Requester is a BPS organization, Special Account, or Restricted Program listed in Appendix A, platform
        costs, including the {fee}, will continue to be recovered from the ministry through a Journal Voucher (JV) or
        budget transfer process.
      </p>

      <p>
        This agreement requires the Requester’s Expense Authority approval for all consumed or reserved usage, including
        underutilized cost-impacting {service} services. The Requester is responsible for understanding the cost
        structure and financial obligations associated with current and future service consumption in {service}, and for
        monitoring actual consumption to ensure it remains within the planned budget.
      </p>

      <p>
        The Requester must provide and maintain a 24-month forecast that includes anticipated monthly costs, go-live
        timing, expected users, major phases, scaling assumptions, and future expansion. Forecasts may be recorded in
        the billing portal, with automated alerts to CSBC and the Requester when actual or projected costs are at risk
        of exceeding the approved budget. Forecasts should be realistic for the use case and not inflated. The Requester
        will review and update forecasts at least quarterly and provide explanations for significant variances between
        forecasted and actual spending. Variances greater than a 10% threshold may require review with CSBC. The
        Requester is expected to maintain cost optimization, actively right-size resources, and promptly remove unused
        services.
      </p>

      <p>
        Before provisioning or expansion, the Requester confirms that approval and endorsement have been obtained from
        CSBC Partnerships, Common Capabilities and AI Platforms, Enterprise Architecture, and Cloud Security, as
        applicable. The Requester also confirms that the solution supports CSBC objectives, is an approved CSBC
        priority, has approved platform costs, and does not duplicate an existing reusable technology, platform,
        application, code base, or service pattern.
      </p>

      <p>
        The Requester must retain evidence of required approvals and provide it to CSBC upon request before
        provisioning, expansion, or material scope change.
      </p>

      <p>
        {isAWS
          ? 'The Requester remains fiscally accountable for all AWS services consumed within its AWS account or accounts,'
          : 'The Requester remains fiscally accountable for all Azure services consumed under its subscription,'}{' '}
        including costs resulting from demand growth, workload changes, architectural decisions, service
        misconfigurations, or consumption exceeding approved forecasts.
      </p>

      <p>
        If actual or projected costs exceed the approved budget, CSBC will escalate the matter to the appropriate
        leadership groups. CSBC may take corrective action, including but not limited to recovering overages through a
        Journal Voucher, throttling or restricting non-essential workloads, requiring re-architecture, requiring
        additional CSBC Deputy Minister approval for increased spend, or decommissioning services in extreme cases.
      </p>

      <p>
        If the solution duplicates an existing CSBC-supported capability, CSBC may require migration to the reusable
        capability and decommissioning of the duplicate environment. CSBC may also adjust buffered forecasts to align
        with actual consumption, usage patterns, and approved scope.
      </p>

      <p>
        The Requester confirms the solution has been designed for appropriate security, privacy, architecture,
        resiliency, supportability, cost efficiency, operational ownership, data management, and lifecycle management.
        Any gap, exception, or departure from CSBC, Enterprise Architecture, or Cloud Security requirements must be
        disclosed and approved before implementation.
      </p>

      <p>
        This agreement will remain in effect from the date of signing until written notification is provided to CSBC
        and/or the project is successfully offboarded, as described on the{' '}
        <a href="https://digital.gov.bc.ca/cloud/services/public/">Public Cloud website</a>.
      </p>

      <div className="break"></div>

      <p>If you are a Schedule A client – please provide your coding below;</p>

      <table>
        <tbody>
          <tr>
            <th>Client Code</th>
            <th>RC</th>
            <th>SL</th>
            <th>STOB</th>
            <th>Project Code</th>
          </tr>
          <tr>
            <td>{billing.accountCoding.cc}</td>
            <td>{billing.accountCoding.rc}</td>
            <td>{billing.accountCoding.sl}</td>
            <td>{billing.accountCoding.stob}</td>
            <td>{billing.accountCoding.pc}</td>
          </tr>
        </tbody>
      </table>

      <p>This agreement is signed on {formatDate(billing.signedAt, 'dd/MM/yy')} by:</p>

      <table>
        <tbody>
          <tr>
            <th colSpan={2}>The Ministry of Citizens’ Services Expense Authority</th>
            <th colSpan={2}>The Requester’s Expense Authority</th>
          </tr>
          <tr>
            <td>Name</td>
            <td>{formatFullName(billing.approvedBy)}</td>
            <td>Name</td>
            <td>{formatFullName(billing.signedBy)}</td>
          </tr>
          <tr>
            <td>Position Title</td>
            <td>{billing.approvedBy?.jobTitle || ''}</td>
            <td>Position Title</td>
            <td>{billing.signedBy?.jobTitle || ''}</td>
          </tr>
          <tr>
            <td>Branch</td>
            <td>{billing.approvedBy?.officeLocation || ''}</td>
            <td>Branch</td>
            <td>{billing.signedBy?.officeLocation || ''}</td>
          </tr>
        </tbody>
      </table>

      <div className="break"></div>

      <h2>Appendix A – Exclusions &amp; Exemptions</h2>

      <p>
        Appendix A applies to Broader Public Sector organizations, Special Accounts, Restricted Programs, and any other
        service arrangements where CSBC determines that voted funding does not replace cost recovery. These exclusions
        and exemptions remain subject to CSBC review and may be updated as funding, policy, or service delivery
        requirements change.
      </p>
    </div>
  );
}
