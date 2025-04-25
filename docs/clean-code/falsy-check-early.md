# Check Falsy Conditions Early

When working with variables that might be `null`, `undefined`, or otherwise falsy, it’s a good practice to check for those cases explicitly and return early. This avoids relying on optional chaining (`?.`) or other defensive programming techniques that obscure the intent or silently mask potential bugs.

Instead of allowing code execution to continue when a required value is missing, a clear early return improves **readability**, **safety**, and **debuggability**.

## Benefits

1. `Improved Readability`: The intent is clearer when you check for invalid conditions early. The reader immediately knows you're guarding against a falsy value.

2. `Avoids Silent Failures`: Optional chaining can hide errors that should be handled explicitly—especially when a value is _expected_ to exist.

3. `Cleaner Expressions`: Returning early keeps the remaining logic free from unnecessary safety checks, making the main flow more readable.

4. `Better Debugging`: It's easier to trace why a function exited early than to track down `undefined` values in deeply nested optional expressions.

5. `Explicit Intent`: You make it clear what you're checking for and what conditions are considered invalid.

## Examples

### Good Example (Early Falsy Check)

```js
function getUserDisplayName(user) {
    if (!user) {
        return '';
    }

    return `${user.firstname} ${user.lastname}`;
}
```

### Bad Example (Avoiding the Check)

```js
function getUserDisplayName(user) {
    return `${user?.firstname} ${user?.lastname}`;
}
```

In the bad example, the use of optional chaining hides the fact that `user` might be missing entirely. If `user` is required for this function to make sense, it’s better to fail fast or exit early.

### Better (If You Want a Fallback Value)

```js
function getUserDisplayName(user) {
    if (!user) {
        return 'Unknown User';
    }

    return `${user.firstname} ${user.lastname}`;
}
```

### Considerations for Optional Fields

If you are dealing with optional _fields_ inside an object (not the object itself), optional chaining can still be appropriate. However, use it sparingly and only when it's truly optional, not when you're trying to gloss over missing data that should be handled explicitly.

```js
function getUserLocation(user) {
    if (!user) return;

    return user.address?.city || 'City unknown';
}
```
