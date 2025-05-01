import { tailwindToCSS } from 'tw-to-css';
import MonthlyCostSummary from '@/components/private-cloud/monthly-cost/MonthlyCostSummary';
import MonthlyCostTable from '@/components/private-cloud/monthly-cost/MonthlyCostTable';
import { WeasyPrint } from '@/services/weasyprint/client';
import { replaceClassToStyleString } from '@/utils/js';

const weasyClient = new WeasyPrint();

const { twi, twj } = tailwindToCSS({
  config: {},
});

const css = `
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
`;

export async function generateMonthlyCostPdf({ year, month, data }: { year: number; month: number; data: any }) {
  const ReactDOMServer = (await import('react-dom/server')).default;

  const html = ReactDOMServer.renderToStaticMarkup(
    <>
      <MonthlyCostSummary data={data} />
      <MonthlyCostTable data={{ items: data.items }} />
    </>,
  );

  const styledHtml = replaceClassToStyleString(html, (className) => twj(className) as Record<string, string>);
  const buff = await weasyClient.generatePdf({ html: styledHtml, css });
  return buff;
}
