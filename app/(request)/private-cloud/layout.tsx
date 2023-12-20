import CrumbsNav from '@/components/nav/CrumbsNav';

export default function Layout({ children, edit }: { children: React.ReactNode; edit: React.ReactNode }) {
  return (
    <div>
      <CrumbsNav cloudLabel="PRIVATE CLOUD" previousLabel="Home" />
      {edit}

      {children}
    </div>
  );
}
