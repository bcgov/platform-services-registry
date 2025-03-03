import { WeasyPrint } from '@/services/weasyprint/client';
import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';
import BillingMou, { css } from './BillingMou';
import { Product } from './types';

const weasyClient = new WeasyPrint();

export async function generateEmouPdf(product: Product, billing: PublicCloudBillingDetailDecorated) {
  const ReactDOMServer = (await import('react-dom/server')).default;
  const html = ReactDOMServer.renderToStaticMarkup(<BillingMou product={product} billing={billing} />);
  const buff = await weasyClient.generatePdf({ html, css });
  return buff;
}
