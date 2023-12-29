import CrumbsNav from '@/components/nav/CrumbsNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CrumbsNav cloudLabel="PRIVATE CLOUD" previousLabel="Products" />
      {children}
    </div>
  );
}
