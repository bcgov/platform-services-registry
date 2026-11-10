import { formatFullName } from '@/helpers/user';
import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';

export default function BillingSignatures({
  billing,
  leftTitle,
  rightTitle,
}: Readonly<{
  billing: PublicCloudBillingDetailDecorated;
  leftTitle: string;
  rightTitle: string;
}>) {
  return (
    <table>
      <tbody>
        <tr>
          <th colSpan={2}>{leftTitle}</th>
          <th colSpan={2}>{rightTitle}</th>
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
  );
}
