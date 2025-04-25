# Naming Conventions

## Conventional Commits

Conventional Commits provide a structured way to format commit messages. This improves readability, enables automated processes like changelog generation and versioning, and enhances collaboration through clearer communication in code repositories.

-   Please refer to [Conventional Commits](https://www.conventionalcommits.org/){target="\_blank" rel="noopener noreferrer"} for more detailed information.

### Examples

-   `feat(user-auth): add password reset functionality`
-   `fix(validation): handle edge case in email input`
-   `chore(tests): update unit tests for user service`
-   `refactor(api): optimize database queries in user endpoints`
-   `docs(readme): update installation instructions`
-   `chore(deps): update package versions for security patch`
-   `BREAKING CHANGE: remove support for Node.js v10`

## File Naming Conventions

Within Next.js applications, adhering to proper file naming conventions is essential. Here are three widely adopted practices:

1. Camel Case for File Names and Pascal Case for Component Names
2. `Kebab Case for File Names and Pascal Case for Component Names`
3. Pascal Case for Both File Names and Component Names

Outside the Next.js application folder, `kebab case` is commonly utilized for naming `folders and files`, especially in URLs. This preference is driven by several reasons:

-   `URL Friendliness`: Kebab case, with its use of hyphens, contributes to URLs that are more readable and user-friendly. This enhances the overall user experience and facilitates easier navigation.

-   `Consistency Across Platforms`: Kebab case is supported consistently across various platforms, making it a pragmatic choice for ensuring compatibility and avoiding issues related to case sensitivity.

-   `SEO Considerations`: Search engines often interpret hyphens in URLs as space, potentially improving search result readability. This can positively impact your website's search engine optimization (SEO).

Choosing the second option, which involves `Kebab Case for file names and Pascal Case for component names`, is beneficial in scenarios where a more standardized and conventional naming approach is preferred within the Next.js application itself. This can promote code consistency and make it easier for developers to collaborate and understand the codebase. Additionally, adhering to a specific convention within the application can simplify naming-related decisions during development.

## Utilizing Sharable Functions

To enhance readability and ease of maintenance in our business logic, we leverage 3rd party packages, such as `lodash-es`, for common function usage.

If third-party packages do not provide suitable utilities, we create our own functions and organize them in designated project locations.
We've identified three distinct use cases for these common functions, each following agreed-upon guidelines:

-   `Lower Level Functions`: Reserved for functions essential at the project's lower level, such as framework-level wrappers and helpers.

    -   These functions reside in the `/core` directory.

-   `Very Generic Functions`: Generic functions versatile enough for use in any project, not limited to the current one.

    -   These functions are stored in the `/utils` directory.

-   `Less Generic Functions`: Functions serving as helpers specifically within this project.
    -   These functions are housed in the `/helpers` directory.

As a team consensus, we aim to include `one or multiple common functions per file` and refrain from using `export default`.

## Validation Schema & Enum Naming Conventions

The following naming conventions are used for validation schemas and enums with the validation tool Zod:

1. **Validation Schema:**

    - **Naming:** Schema objects are named in camelCase and end with `Schema`.
    - **Type:** The TypeScript type derived from the schema object is in PascalCase.

    ```typescript
    const userSchema = z.object({
        name: z.string().min(1, 'Name is required'),
        age: z.number().min(0, 'Age must be a non-negative number'),
    });

    type User = z.infer<typeof userSchema>;
    ```

2. **Enum:**

    - **Naming:** Enum objects are named in PascalCase and end with `Enum`.
    - **Type:** The TypeScript type derived from the enum object is in PascalCase.

    ```typescript
    const ColorEnum = z.enum(['Red', 'Green', 'Blue']);

    type Color = z.infer<typeof ColorEnum>;
    ```

### Explanation:

-   **Validation Schema Naming:**

    -   `userSchema`: The schema object for user data, named in camelCase and ending with `Schema`.
    -   `User`: The TypeScript type inferred from `userSchema`, named in PascalCase.

-   **Enum Naming:**
    -   `ColorEnum`: The enum object for color options, named in PascalCase and ending with `Enum`.
    -   `Color`: The TypeScript type inferred from `ColorEnum`, named in PascalCase.
