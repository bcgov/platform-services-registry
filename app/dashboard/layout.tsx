import CloudTabs from "@/components/CloudTabs";
import ProductsRequestsTabs from "@/components/ProductsRequestsTabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs />
      <div
        style={{ marginLeft: 74, marginRight: 74 }}
        className="mt-8 mb-8 h-full mx-auto "
      >
        <ProductsRequestsTabs />
        {children}
      </div>
    </div>
  );
}
