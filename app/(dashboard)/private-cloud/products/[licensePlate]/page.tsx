export default function Product({
  params,
}: {
  params: { licensePlate: string };
}) {
  const { licensePlate } = params;

  return <div>Product</div>;
}
