# Use `Utils`, `Helpers`, and `Shared Components`

In software development, keeping your code clean, modular, and reusable is essential for long-term maintainability and scalability. One way to achieve this is by encapsulating common logic and components into dedicated modules, such as **utility functions**, **helper functions**, and **shared components**. These practices help avoid duplication, reduce complexity, and improve code organization.

## Benefits

1. `Code Reusability`: Extracting logic into separate utils, helpers, or shared components reduces code duplication and promotes reuse across different parts of the application.
2. `Improved Readability`: Isolating logic in well-named utility functions or shared components makes your code easier to read and understand. It separates concerns and helps focus on specific tasks.
3. `Easier Maintenance`: Centralizing commonly used logic means that if an update is required, you can modify it in one place and avoid errors elsewhere in the codebase.
4. `Faster Development`: Developers can leverage pre-built utils, helpers, and components to build features faster rather than reinventing the wheel each time.

## Use Cases

### 1. Utility Functions (`utils`)

Utility functions are small, focused pieces of logic that perform specific tasks, such as formatting data, performing calculations, or manipulating strings. They are typically stateless and don't rely on external context.

#### Good Example (Using Utility Functions)

```js
// utils/formatters.js
export function formatCurrency(amount) {
    return `$${amount.toFixed(2)}`;
}

export function formatDate(date) {
    return date.toLocaleDateString();
}

// main.js
import { formatCurrency, formatDate } from './utils/formatters';

function displayTransaction(transaction) {
    const formattedAmount = formatCurrency(transaction.amount);
    const formattedDate = formatDate(transaction.date);

    console.log(`Transaction: ${formattedAmount} on ${formattedDate}`);
}
```

Here, `formatCurrency` and `formatDate` are utility functions that can be reused throughout the application.

#### Bad Example (Without Using Utility Functions)

```js
function displayTransaction(transaction) {
    // Code duplication within the main function
    const formattedAmount = `$${transaction.amount.toFixed(2)}`;
    const formattedDate = transaction.date.toLocaleDateString();

    console.log(`Transaction: ${formattedAmount} on ${formattedDate}`);
}
```

In this bad example, the formatting logic is directly inside the `displayTransaction` function, leading to code duplication if formatting is required elsewhere in the application. This could also make the function longer and harder to read.

### 2. Helper Functions (`helpers`)

Helper functions are similar to utils but tend to be slightly more application-specific. They are designed to simplify complex logic by breaking it down into smaller, more manageable pieces. Helper functions are often used in scenarios where logic needs to be reused multiple times but isn’t generic enough to be classified as a utility function.

#### Good Example (Using Helper Functions)

```js
// helpers/validators.js
export function isPositiveNumber(number) {
    return number > 0;
}

// main.js
import { isPositiveNumber } from './helpers/validators';

function calculateTotal(price, quantity) {
    if (!isPositiveNumber(price) || !isPositiveNumber(quantity)) {
        return 0;
    }
    return price * quantity;
}
```

In this example, `isPositiveNumber` is a helper function that checks whether a number is positive, used inside the `calculateTotal` function to validate input.

#### Bad Example (Without Using Helper Functions)

```js
function calculateTotal(price, quantity) {
    if (price <= 0 || quantity <= 0) {
        return 0;
    }
    return price * quantity;
}
```

In this bad example, the validation is hardcoded inside the `calculateTotal` function. If you need similar validation elsewhere in the application, you would need to duplicate this logic. This violates the DRY (Don’t Repeat Yourself) principle.

### 3. Shared Components

Shared components are UI elements that are reused across different parts of the application. These could be buttons, modals, input fields, or any other component that’s used in multiple places. Instead of repeating the same JSX code throughout your app, encapsulate these UI elements into reusable shared components.

#### Good Example (Using Shared Button Component)

```tsx
// components/Button.tsx
export function Button({ label, onClick }) {
    return <button onClick={onClick}>{label}</button>;
}

// pages/Home.tsx
import { Button } from '../components/Button';

function Home() {
    const handleClick = () => alert('Button clicked!');

    return <Button label="Click Me" onClick={handleClick} />;
}

// pages/About.tsx
import { Button } from '../components/Button';

function About() {
    const handleClick = () => alert('About button clicked!');

    return <Button label="Learn More" onClick={handleClick} />;
}
```

In this example, the `Button` component is shared between the `Home` and `About` pages, reducing code duplication and ensuring consistent behavior.

#### Bad Example (Without Using Shared Components)

```tsx
function Home() {
    const handleClick = () => alert('Button clicked!');

    return <button onClick={handleClick}>Click Me</button>;
}

function About() {
    const handleClick = () => alert('About button clicked!');

    return <button onClick={handleClick}>Learn More</button>;
}
```

Here, the button logic is duplicated across the `Home` and `About` components, which could lead to errors and inconsistencies if changes need to be made in the future.

## Best Practices for Using `Utils`, `Helpers`, and `Shared Components`

1. **Organize by Functionality**: Group related utility functions, helper functions, and components into separate files or directories. For example, store all string-related utils in one file, all form validation helpers in another, and all shared UI components in a `components` folder.

2. **Be Specific**: Name your utility functions, helpers, and components based on their purpose. Avoid vague names like `helper1`, `helper2`, or `utility1`, which can lead to confusion later on.

3. **Keep It Modular**: Try to keep your utility and helper functions focused on a single task. Don’t combine too many responsibilities into a single function or component. This makes your code easier to test and maintain.

4. **Reuse Instead of Rewriting**: If you notice similar logic popping up in multiple places, refactor it into a utility or helper function. Similarly, shared UI components should be used whenever the same visual elements or behavior appear on different pages.

## Conclusion

By using **utils**, **helpers**, and **shared components**, you can significantly improve the structure and maintainability of your codebase. These practices allow you to create more modular, reusable, and organized code, ultimately making development faster, easier, and less error-prone.
