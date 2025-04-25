# Service Layer

To define a clear and consistent contract between the frontend and backend, we use a **service layer** that encapsulates API calls using [axios](https://axios-http.com/docs/intro){target="\_blank" rel="noopener noreferrer"}.

## Conventions

Service modules that interact with backend API endpoints are located under `/services/backend`. Each sub-path creates its own `axios` instance, inheriting configuration from its parent:

```ts
import axios from 'axios';
import { instance as baseInstance } from './axios';

export const instance = axios.create({
    ...baseInstance.defaults,
    baseURL: `${baseInstance.defaults.baseURL}/tasks`,
});
```

Each service method begins with a verb (e.g., `get`, `create`, `update`) and returns only the `data` portion from the API response. Error handling is delegated to the data-fetching library (e.g., React Query):

```ts
export async function getTask(id: string) {
    const result = await instance.get<Task>(`/${id}`).then((res) => res.data);
    return result;
}
```

This pattern ensures a modular, testable, and consistent interface for all backend interactions.
