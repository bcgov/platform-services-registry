import CloudTabs from "@/components/CloudTabs";
import ProductsRequestsTabs from "@/components/ProductsRequestsTabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs />
      <div className="mt-8 mb-8 h-full mx-4 lg:mx-20">
        <ProductsRequestsTabs />
        {children}
      </div>
    </div>
  );
}
