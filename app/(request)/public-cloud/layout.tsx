import CrumbsNav from '@/components/nav/CrumbsNav';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CrumbsNav backUrl="/private-public/products" cloudLabel="PUBLIC CLOUD" previousLabel="Home" />
      {children}
    </div>
  );
}
