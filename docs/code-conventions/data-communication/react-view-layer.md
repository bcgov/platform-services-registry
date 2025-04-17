# React View Layer

The React view layer is responsible for displaying data and handling user interactions. We use [React Hook Form](https://react-hook-form.com/){target="\_blank" rel="noopener noreferrer"} to collect and validate form data for creating or modifying resources.

## Conventions

Form components are built using `React Hook Form`, with schema validation provided by `zod` via the `@hookform/resolvers/zod` package. This pattern ensures consistent validation logic on both the client and server sides.

### Example

```ts
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  age: z.number().min(0, "Age must be a positive number"),
});

type ProductFormData = z.infer<typeof productSchema>;

type Product = {
  id: string;
  name: string;
  age: number;
};

type Props = {
  products: Product[];
  createProductMutation: {
    mutateAsync: (formData: ProductFormData) => Promise<any>;
    isPending: boolean;
    isError: boolean;
    error: Error | null;
  };
};

export function ProductList({
  products,
  createProductMutation,
}: Props) {
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      age: 0,
    },
  });

  const onSubmit = async (formData: ProductFormData) => {
    await createProductMutation.mutateAsync(formData);
    methods.reset();
  };

  return (
    <>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            {product.name} ({product.age})
          </li>
        ))}
      </ul>

      <FormProvider {...methods}>
        <form autoComplete="off" onSubmit={methods.handleSubmit(onSubmit)}>
          <div>
            <label>Name</label>
            <input {...methods.register("name")} />
            {methods.formState.errors.name && (
              <span>{methods.formState.errors.name.message}</span>
            )}
          </div>

          <div>
            <label>Age</label>
            <input
              type="number"
              {...methods.register("age", { valueAsNumber: true })}
            />
            {methods.formState.errors.age && (
              <span>{methods.formState.errors.age.message}</span>
            )}
          </div>

          <button type="submit" disabled={createProductMutation.isPending}>
            {createProductMutation.isPending ? "Creating..." : "Create Product"}
          </button>

          {createProductMutation.isError && createProductMutation.error && (
            <div>Error: {createProductMutation.error.message}</div>
          )}
        </form>
      </FormProvider>
    </>
  );
}

```

This approach keeps your components clean and focuses each part of the view layer on its specific job: rendering lists, handling input, and calling mutation hooks when needed.
