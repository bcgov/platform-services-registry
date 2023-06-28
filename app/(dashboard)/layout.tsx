import CloudTabs from "@/components/tabs/CloudTabs";
import ProductsRequestsTabs from "@/components/tabs/ProductsRequestsTabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs />
      <div className="mt-8 mb-8 h-full mx-4 lg:mx-20">
        <ProductsRequestsTabs baseUrl={"#"} />
        {children}
      </div>
    </div>
  );
}
