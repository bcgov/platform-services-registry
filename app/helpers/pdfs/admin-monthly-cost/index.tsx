import { tailwindToCSS } from 'tw-to-css';
import AdminCostTableBody from '@/app/private-cloud/billings/all/AdminCostTableBody';
import { WeasyPrint } from '@/services/weasyprint/client';
import { MonthlyProductCostData } from '@/types/private-cloud';
import { replaceClassToStyleString } from '@/utils/js';

const weasyClient = new WeasyPrint();

const { twi, twj } = tailwindToCSS({
  config: {},
});

const LETTER_WIDTH = 216;
const LETTER_HEIGHT = 279;

const css = `
@page {
  size: ${LETTER_WIDTH}mm ${LETTER_HEIGHT}mm;
  margin-top: 10mm;
  margin-bottom: 10mm;
  margin-right: 5mm;
  margin-left: 5mm;
}

@top-left {
  content: element(header);
}

@top-left {
  content: element(header);
}

@top-right {
  content: "Page " counter(page) " of " counter(pages);
  font-style: italic;
}

* {
  font-family: "BCSans", sans-serif;
}

.break {
  page-break-before: always;
}
`;

export async function generateAdminMonthylCostPdf({
  data,
  totalCost,
  totalCount,
  yearMonth,
}: {
  data: MonthlyProductCostData[];
  totalCost: number;
  totalCount: number;
  yearMonth: string;
}) {
  const ReactDOMServer = (await import('react-dom/server')).default;

  const html = ReactDOMServer.renderToStaticMarkup(
    <AdminCostTableBody {...{ data, totalCost, totalCount, yearMonth }} />,
  );

  const styledHtml = replaceClassToStyleString(html, (className) => twj(className) as Record<string, string>);
  const buff = await weasyClient.generatePdf({ html: styledHtml, css });
  return buff;
}
