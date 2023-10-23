import './globals.css';
import { Inter } from 'next/font/google';
import Provider from '@/components/Provider';
import Nav from '@/components/nav/Nav';
import classNames from '@/components/utils/classnames';
import Footer from '@/components/Footer';

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
        <body className={classNames(inter.className)}>
          <Nav />
          {children}
          {/* <Footer /> */}
        </body>
      </Provider>
    </html>
  );
}
