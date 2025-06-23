import { createCanvas } from 'canvas';
import Chart, { ChartOptions } from 'chart.js/auto';
import { tailwindToCSS } from 'tw-to-css';
import { getQuarterlyCostChartConfig } from '@/components/private-cloud/quarterly-cost/quarterly-cost-chart-data';
import QuarterlyCostSummary from '@/components/private-cloud/quarterly-cost/QuarterlyCostSummary';
import QuarterlyCostTable from '@/components/private-cloud/quarterly-cost/QuarterlyCostTable';
import { WeasyPrint } from '@/services/weasyprint/client';
import { QuarterlyCost, PrivateCloudProductDetailDecorated } from '@/types/private-cloud';
import { replaceClassToStyleString } from '@/utils/js';

const weasyClient = new WeasyPrint();

const { twi, twj } = tailwindToCSS({
  config: {},
});

const LETTER_WIDTH = 216;
const LETTER_HEIGHT = 279;
const SCALE = 1.5;

const css = `
@page {
  size: ${LETTER_WIDTH * SCALE}mm ${LETTER_HEIGHT * SCALE}mm;
  margin-top: 10mm;
  margin-bottom: 10mm;
  margin-right: 5mm;
  margin-left: 5mm;
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

// See https://www.chartjs.org/docs/latest/getting-started/using-from-node-js.html
async function getChartDataURL(data) {
  const { options, data: chartData } = getQuarterlyCostChartConfig({ data });

  options.plugins.legend.labels.font.size = 30;
  options.scales.x.ticks.font.size = 30;
  options.scales.y.ticks.font.size = 30;

  const canvas = createCanvas(1600 * SCALE, 800 * SCALE);
  const ctx = canvas.getContext('2d');

  const chart = new Chart(ctx as any, {
    type: 'bar',
    data: chartData,
    options: options as ChartOptions<'bar'>,
  });

  const dataURL = canvas.toDataURL();

  chart.destroy();
  return dataURL;
}

export async function generateQuarterlyCostPdf({
  product,
  data,
}: {
  product: PrivateCloudProductDetailDecorated;
  data: QuarterlyCost;
}) {
  const ReactDOMServer = (await import('react-dom/server')).default;

  const chartImageDataURL = await getChartDataURL(data);
  const html = ReactDOMServer.renderToStaticMarkup(
    <>
      <h1 className="font-semibold text-3xl mb-1">{product.name}</h1>
      <i className="italic text-lg">{product.description}</i>
      <QuarterlyCostSummary data={data} />
      <div className="border border-gray-200 border-solid rounded p-4 bg-white my-6">
        <div className="relative w-full">
          <img src={chartImageDataURL} className="w-full h-auto" alt="Quarterly Cost Chart" />
        </div>
      </div>
      <QuarterlyCostTable data={{ items: data.items, months: data.months, monthDetails: data.monthDetails }} />
    </>,
  );

  const styledHtml = replaceClassToStyleString(html, (className) => twj(className) as Record<string, string>);
  const buff = await weasyClient.generatePdf({ html: styledHtml, css });
  return buff;
}
