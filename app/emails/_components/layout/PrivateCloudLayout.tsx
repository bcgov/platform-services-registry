import { Hr } from '@react-email/components';
import * as React from 'react';
import Footer from '@/emails/_components/layout/Footer';
import Layout from '@/emails/_components/layout/Layout';
import Requester from '@/emails/_components/Requester';

export default function PrivateCloudLayout({ children, requester }: { children: React.ReactNode; requester?: string }) {
  return (
    <Layout>
      {children}
      {requester && <Requester name={requester} />}
      <Hr className="my-4" />
      <Footer />
    </Layout>
  );
}
