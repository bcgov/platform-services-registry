import PublicProductTabs from '@/components/tabs/PublicProductTabs';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PublicProductTabs />
      <div className="mt-8 mb-20 h-full">{children}</div>
    </div>
  );
}


