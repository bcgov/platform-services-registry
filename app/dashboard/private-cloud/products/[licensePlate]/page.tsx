export default function Product({
  params,
}: {
  params: { licensePlate: string };
}) {
  const { licensePlate } = params;

  console.log(licensePlate);

  return <div>Product</div>;
}
