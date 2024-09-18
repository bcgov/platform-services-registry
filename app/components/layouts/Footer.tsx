import { useAppState } from '@/states/global';

export default function Footer() {
  const [, appSnapshot] = useAppState();

  const navigation = {
    main: [
      // { name: 'Home', href: '#' }, a home page does not currently exist
      { name: 'Disclaimer', href: 'https://www2.gov.bc.ca/gov/content/home/disclaimer' },
      { name: 'Privacy', href: 'https://www2.gov.bc.ca/gov/content/home/privacy' },
      { name: 'Accessibility', href: 'https://www2.gov.bc.ca/gov/content/home/accessible-government' },
      { name: 'Copyright', href: 'https://www2.gov.bc.ca/gov/content/home/copyright' },
      { name: 'Contact Us', href: 'https://chat.developer.gov.bc.ca/channel/devops-registry' },
      { name: 'Report a bug/Request a feature', href: 'https://github.com/bcgov/platform-services-registry/issues' },
    ],
  };

  if (appSnapshot.info.DEPLOYMENT_TAG) {
    const ref = appSnapshot.info.DEPLOYMENT_TAG.includes('.')
      ? `v${appSnapshot.info.DEPLOYMENT_TAG}`
      : appSnapshot.info.DEPLOYMENT_TAG;
    navigation.main.push({
      name: `App Version: ${appSnapshot.info.DEPLOYMENT_TAG}`,
      href: `https://github.com/bcgov/platform-services-registry/tree/${ref}`,
    });
  }

  return (
    <footer className="bg-bcblue mt-auto inset-x-0 bottom-0">
      <div className="mx-auto max-w-8xl overflow-hidden px-6 py-5 lg:px-8">
        <nav className="columns-2 lg:flex lg:justify-center lg:space-x-12" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-sm leading-6 text-white hover:text-bcgray"
              >
                {item.name}
              </a>
            </div>
          ))}
        </nav>
      </div>
    </footer>
  );
}
