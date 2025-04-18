# Frontend–Backend Communication

The frontend communicates with backend API endpoints through HTTP requests, structured via a service layer built on top of `axios`.

The data flow involves the following layers:

- **Backend API Endpoint**: Defines the interface and logic for each operation (e.g., `/api/products`, `/api/users/[id]`).
- **Service Layer**: Encapsulates API calls using `axios`, providing a clear contract for each endpoint (e.g., `getProduct`, `createUser`).
- **Data-fetching & State Management**: Libraries like `@tanstack/react-query` handle fetching, caching, and updating data within React components.
- **React View Layer**: Components consume the data and render it. User interactions (e.g., button clicks) can trigger mutations via the service layer.

This layered approach keeps concerns separated, improves reusability, and simplifies debugging and testing.
