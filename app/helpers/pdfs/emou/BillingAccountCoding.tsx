import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';

export default function BillingAccountCoding({
  accountCoding,
}: Readonly<{
  accountCoding: PublicCloudBillingDetailDecorated['accountCoding'];
}>) {
  return (
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
          <td>{accountCoding.cc}</td>
          <td>{accountCoding.rc}</td>
          <td>{accountCoding.sl}</td>
          <td>{accountCoding.stob}</td>
          <td>{accountCoding.pc}</td>
        </tr>
      </tbody>
    </table>
  );
}
