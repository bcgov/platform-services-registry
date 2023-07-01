import CrumbsNav from "@/components/nav/CrumbsNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-8 mb-8 h-full mx-4 lg:mx-20">
      <CrumbsNav
        backUrl="/private-cloud/products"
        cloudLabel="PRIVATE CLOUD"
        previousLabel="Create"
      />
      {children}
    </div>
  );
}
