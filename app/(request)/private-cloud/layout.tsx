import CrumbsNav from '@/components/nav/CrumbsNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CrumbsNav backUrl="/private-cloud/products" cloudLabel="PRIVATE CLOUD" previousLabel="Home" />
      {children}
    </div>
  );
}
