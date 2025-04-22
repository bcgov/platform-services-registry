# Data-fetching & State Management

For fetching, caching, and updating data within React components, we use [TanStack Query](https://tanstack.com/query/latest/docs/framework/react/overview){target="\_blank" rel="noopener noreferrer"}—a powerful library for managing server state in React.

## Conventions

We use two main hooks provided by TanStack Query: `useQuery` for retrieving data and `useMutation` for modifying it. These hooks expose status flags and error details, making it easier to manage loading states and error handling in the UI.

### `useQuery`

Use `useQuery` to fetch and cache data. Each query is identified by a unique `queryKey`, and the `queryFn` typically calls a method from the service layer:

```ts
const {
  data: product,
  isLoading: isProductLoading,
  isError: isProductError,
  error: productError,
  refetch: refetchProduct,
} = useQuery({
  queryKey: ['product', productId],
  queryFn: () => getProduct(productId),
});
```

You can also enable polling with `refetchInterval`, which re-fetches data at the specified interval (in milliseconds):

```ts
const {
  data: products,
  isLoading: isProductsLoading,
  isError: isProductsError,
  error: productsError,
  refetch: refetchProducts,
} = useQuery({
  queryKey: ['products'],
  queryFn: () => getProducts(),
  refetchInterval: 2000, // refetch every 2 seconds
});
```

### `useMutation`

Use `useMutation` to create, update, or delete data. The mutation hook provides methods and flags for tracking the request's lifecycle:

```ts
const {
  mutateAsync: createProduct,
  isPending: isCreatingProduct,
  isError: isCreateProductError,
  error: createProductError,
} = useMutation({
  mutationFn: createProductService,
});
```

This setup enables a clean and declarative approach to server-side data. It also handles caching, background refetching, and stale data management out of the box—allowing developers to focus on building features rather than managing API state manually.
