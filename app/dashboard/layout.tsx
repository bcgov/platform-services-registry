import CloudTabs from "@/components/CloudTabs";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <CloudTabs />
      {children}
    </div>
  );
}
