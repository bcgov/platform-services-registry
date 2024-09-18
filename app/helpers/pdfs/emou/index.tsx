import { WeasyPrint } from '@/services/weasyprint/client';
import BillingMou, { css } from './BillingMou';
import { Product, Billing } from './types';
export type { Product, Billing };

const weasyClient = new WeasyPrint();

export async function generateEmouPdf(product: Product, billing: Billing) {
  const ReactDOMServer = (await import('react-dom/server')).default;
  const html = ReactDOMServer.renderToStaticMarkup(<BillingMou product={product} billing={billing} />);
  const buff = await weasyClient.generatePdf({ html, css });
  return buff;
}
