export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <div className="mt-8 mb-20 h-full mx-4 lg:mx-20">{children}</div>
    </div>
  );
}
