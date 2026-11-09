import { WeasyPrint } from '@/services/weasyprint/client';
import { PublicCloudBillingDetailDecorated } from '@/types/public-cloud';
import BillingMouV1, { css as cssV1 } from './BillingMouV1';
import BillingMouV2, { css as cssV2 } from './BillingMouV2';
import { Product } from './types';

const weasyClient = new WeasyPrint();

export async function generateEmouPdf(product: Product, billing: PublicCloudBillingDetailDecorated) {
  const ReactDOMServer = (await import('react-dom/server')).default;
  const version = billing.agreementVersion ?? 1;

  if (version !== 1 && version !== 2) {
    throw new Error(`Unsupported eMOU agreement version: ${version}`);
  }

  const html =
    version === 2
      ? ReactDOMServer.renderToStaticMarkup(<BillingMouV2 product={product} billing={billing} />)
      : ReactDOMServer.renderToStaticMarkup(<BillingMouV1 product={product} billing={billing} />);

  const buff = await weasyClient.generatePdf({
    html,
    css: version === 2 ? cssV2 : cssV1,
  });
  return buff;
}
