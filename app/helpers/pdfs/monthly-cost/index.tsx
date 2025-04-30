import { WeasyPrint } from '@/services/weasyprint/client';
import MonthlyCost, { css, MonthlyCostItem } from './MonthlyCost';

const weasyClient = new WeasyPrint();

export async function generateMonthlyCostPdf(
  items: MonthlyCostItem[],
  yearMonth: string,
  billingPeriod: string,
  accountCoding: string,
  currentTotal: number,
  estimatedGrandTotal: number,
  grandTotal: number,
) {
  const ReactDOMServer = (await import('react-dom/server')).default;

  const html = ReactDOMServer.renderToStaticMarkup(
    <MonthlyCost
      yearMonth={yearMonth}
      billingPeriod={billingPeriod}
      items={items}
      accountCoding={accountCoding}
      currentTotal={currentTotal}
      estimatedGrandTotal={estimatedGrandTotal}
      grandTotal={grandTotal}
    />,
  );

  const buff = await weasyClient.generatePdf({ html, css });
  return buff;
}
