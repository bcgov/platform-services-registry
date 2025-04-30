import { ChartCompatibleMonthlyCostData } from '@/helpers/product';
import { WeasyPrint } from '@/services/weasyprint/client';
import YearlyCostHistory, { css } from './YearlyCostHistory';

const weasyClient = new WeasyPrint();

export async function generateYearlyCostHistoryPDF(data: ChartCompatibleMonthlyCostData[], year: string) {
  const ReactDOMServer = (await import('react-dom/server')).default;

  const html = ReactDOMServer.renderToStaticMarkup(<YearlyCostHistory resources={data} year={year} />);

  const buff = await weasyClient.generatePdf({ html, css });
  return buff;
}
