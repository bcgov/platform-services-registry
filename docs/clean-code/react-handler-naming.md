# Naming React Callback Props and Handlers

In React development, consistent naming of callback props and their internal handler functions improves clarity, reduces mental overhead, and makes components easier to understand and maintain. Two common naming patterns are:

-   `onX`: for **props** passed to a component (e.g., `onClick`, `onSubmit`)
-   `handleX`: for **internal handler functions** that implement the logic (e.g., `handleClick`, `handleSubmit`)

Following this convention helps developers immediately distinguish **event sources** from **event handlers** and navigate through the code more intuitively.

## Benefits

1. `Improved Consistency`: Using consistent naming for callbacks and handlers makes the codebase predictable and easier to follow.

2. `Clear Ownership`: `onX` indicates a function **passed into** a component (usually from a parent), while `handleX` clearly marks it as a function **defined inside** the component.

3. `Better Autocomplete and IDE Support`: When naming is consistent, it's easier to find and auto-complete handlers in modern editors.

4. `Easier Refactoring`: You know exactly where to look when refactoring logic or passing down new handlers to children.

## Examples

### Good Example

```tsx
function Button({ onClick }: { onClick: () => void }) {
    return <button onClick={onClick}>Click me</button>;
}

function ParentComponent() {
    const handleClick = () => {
        console.log('Button clicked!');
    };

    return <Button onClick={handleClick} />;
}
```

-   `onClick`: prop expected by the `Button` component
-   `handleClick`: local handler in `ParentComponent`

### Bad Example

```tsx
function Button({ clickHandler }: { clickHandler: () => void }) {
    return <button onClick={clickHandler}>Click me</button>;
}

function ParentComponent() {
    const clicked = () => {
        console.log('Button clicked!');
    };

    return <Button clickHandler={clicked} />;
}
```

This version is less clear:

-   `clickHandler` could be either a prop or a local function
-   `clicked` lacks verb clarity and doesn’t indicate its purpose or trigger

## Naming Guidelines

| Context         | Naming Convention |
| --------------- | ----------------- |
| Prop (callback) | `onX`             |
| Local handler   | `handleX`         |
| Event object    | `event`, `e`      |

Examples:

-   `onFormSubmit` → `handleFormSubmit`
-   `onItemSelect` → `handleItemSelect`
-   `onMouseEnter` → `handleMouseEnter`

## Considerations

-   Use **verbs** in your function names (`handleSubmit`, not `submissionHandler`)
-   Avoid inconsistent or ambiguous names like `clickedFn`, `myHandler`, or `cb`
-   Stick to **camelCase** for handlers, even in large codebases
