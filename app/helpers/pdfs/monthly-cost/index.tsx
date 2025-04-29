import { WeasyPrint } from '@/services/weasyprint/client';
import MonthlyCost, { css, MonthlyCostItem } from './MonthlyCost';

const weasyClient = new WeasyPrint();

export async function generateMonthlyCostPdf(items: MonthlyCostItem[], yearMonth: string, accountCoding: string) {
  const ReactDOMServer = (await import('react-dom/server')).default;

  const html = ReactDOMServer.renderToStaticMarkup(
    <MonthlyCost yearMonth={yearMonth} items={items} accountCoding={accountCoding} />,
  );

  const buff = await weasyClient.generatePdf({ html, css });
  return buff;
}
