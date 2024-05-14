import { useAppState } from '@/states/global';

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

export default function Footer() {
  const [appState, appSnapshot] = useAppState();

  return (
    <footer className="bg-bcblue mt-auto inset-x-0 bottom-0">
      <div className="mx-auto max-w-8xl overflow-hidden px-6 py-5 lg:px-8">
        <nav className="columns-2 lg:flex lg:justify-center lg:space-x-12" aria-label="Footer">
          {navigation.main.map((item) => (
            <div key={item.name} className="pb-6">
              <a href={item.href} className="underline text-sm leading-6 text-white hover:text-bcgray">
                {item.name}
              </a>
            </div>
          ))}
          {appSnapshot.info.DEPLOYMENT_TAG && (
            <div className="pb-6">
              <span className="text-sm leading-6 text-white hover:text-bcgray">
                App Version: {appSnapshot.info.DEPLOYMENT_TAG}
              </span>
            </div>
          )}
        </nav>
      </div>
    </footer>
  );
}
