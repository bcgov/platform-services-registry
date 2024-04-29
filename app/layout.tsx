import './globals.css';
import 'react-toastify/dist/ReactToastify.css';
import { Inter } from 'next/font/google';
import Provider from '@/components/Provider';
import Nav from '@/components/nav/Nav';
import classNames from '@/utils/classnames';
import Footer from '@/components/Footer';
import { DEPLOYMENT_TAG } from '@/config';

console.log('DEPLOYMENT_TAG:', DEPLOYMENT_TAG);

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata = {
  title: 'Platform Services Registry',
  description: 'Created by the Platform Services team',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Provider>
        <body className={classNames('flex flex-col min-h-screen', inter.className)}>
          <Nav />
          <main className="flex-grow h-100">{children}</main>
          <Footer />
        </body>
      </Provider>
    </html>
  );
}
