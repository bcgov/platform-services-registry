import CloudTabs from "@/components/CloudTabs";
import ProductsRequestsTabs from "@/components/ProductsRequestsTabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs />
      <div style={{ marginLeft: 74 }}>
        <ProductsRequestsTabs />
        {children}
      </div>
    </div>
  );
}
