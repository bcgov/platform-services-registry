# Split Large Components/Functions Into Smaller Ones

Breaking down large, monolithic components or functions into smaller, manageable pieces is a core principle of writing maintainable code. This approach leads to improved readability, testability, and reusability. Rather than dealing with a single large block of code, smaller units allow for easier understanding, debugging, and future enhancements.

## Benefits

1. `Improved Readability`: Smaller components or functions are easier to read and understand, as they focus on a specific piece of logic or UI.

2. `Easier Debugging`: When something goes wrong, it’s much easier to debug small, isolated pieces of logic than one large function or component.

3. `Better Reusability`: Small components and functions can be reused in multiple places, reducing the need to duplicate code.

4. `Simpler Testing`: It’s easier to write tests for smaller functions or components that handle one responsibility. Unit testing is much more effective when each test case is focused on one thing.

5. `Enhanced Maintainability`: It’s much easier to modify or extend a smaller function or component without breaking unrelated functionality.

## Examples

### Good Example (Multiple Small Functions)

```js
function calculateDiscount(price, discount) {
  return price * discount;
}

function calculateTax(price, taxRate) {
  return price * taxRate;
}

function calculateTotal(price, discount, taxRate) {
  const discountedPrice = calculateDiscount(price, discount);
  const tax = calculateTax(discountedPrice, taxRate);
  return discountedPrice + tax;
}
```

In this example, each function has a single responsibility: calculating discount, tax, and total. This is easy to read and maintain.

### Bad Example (One Big Function)

```js
function calculateTotal(price, discount, taxRate) {
  if (discount > 0) {
    price = price - price * discount;
  }

  if (taxRate > 0) {
    price = price + price * taxRate;
  }

  return price;
}
```

In this example, the `calculateTotal` function is doing too much. It handles both the discount and tax logic, making it harder to modify or extend. It’s also difficult to test individual parts of the calculation.

### Better Example (React Component)

```tsx
function Button({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

function IconButton({ icon, onClick }) {
  return (
    <button onClick={onClick}>
      <img src={icon} alt="icon" />
    </button>
  );
}

function App() {
  const handleClick = () => console.log('Button clicked!');

  return (
    <div>
      <Button label="Click me" onClick={handleClick} />
      <IconButton icon="path-to-icon.svg" onClick={handleClick} />
    </div>
  );
}
```

In this React example, the `Button` and `IconButton` components each have a specific responsibility: displaying a button with text or an icon. The `App` component assembles them together. This makes the codebase easier to maintain and extend.

### Bad Example (One Big Component)

```tsx
function App() {
  const handleClick = () => console.log('Button clicked!');

  return (
    <div>
      <button onClick={handleClick}>Click me</button>
      <button onClick={handleClick}>
        <img src="path-to-icon.svg" alt="icon" />
      </button>
    </div>
  );
}
```

Here, `App` directly manages both button types, making it less reusable, harder to test, and harder to modify later (e.g., if you want to change the button style or logic).

## Considerations for Complex Components

When a component grows too large or starts handling multiple concerns (such as UI layout and business logic), it's a good sign that you need to break it down further. Identify logical boundaries within the code and refactor parts into smaller, independent components or functions.
