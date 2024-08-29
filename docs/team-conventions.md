# Team Conventions

## Conventional Commits

Conventional Commits provide a structured way to format commit messages. This improves readability, enables automated processes like changelog generation and versioning, and enhances collaboration through clearer communication in code repositories.

- Please refer to https://www.conventionalcommits.org/ for more detailed information.

### Examples

- `feat(user-auth): add password reset functionality`
- `fix(validation): handle edge case in email input`
- `chore(tests): update unit tests for user service`
- `refactor(api): optimize database queries in user endpoints`
- `docs(readme): update installation instructions`
- `chore(deps): update package versions for security patch`
- `BREAKING CHANGE: remove support for Node.js v10`

## Git Branching Model

A Git branching model is a set of conventions that a development team follows when creating and managing branches in a Git repository. It provides a systematic approach to organizing code development, collaboration, and release management.

### GitHub flow

Considering the relatively small size of the project, this project adopts [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow). `GitHub Flow` is a lightweight, branch-based workflow designed around simplicity and continuous delivery. It's often used by teams working with Git and GitHub for version control and collaboration. `GitHub Flow` emphasizes frequent deployments to production and encourages a streamlined approach to development. Here are the key steps in `GitHub Flow`:

1. Create a Branch:
   When starting work on a new feature, improvement, or bug fix, create a new branch. This branch will contain all the changes related to the task.

   - `feat/<ticket#>`
   - `fix/<ticket#>`

2. Add Commits:
   Make small, incremental commits to the branch as you work on the feature or fix. Each commit should represent a logical, standalone change.

3. Open a Pull Request:
   When you're ready to share your work, open a Pull Request (PR) on GitHub. Ensure all CI checks pass to request peer reviews.

4. Discuss and Review:
   Collaborators can review the changes, comment on specific lines of code, and discuss the implementation within the PR.

5. Make Changes (if necessary):
   Based on the feedback received during the review, make any necessary adjustments by adding more commits to the branch.

6. Merge the PR:
   Once the changes are approved and any requested modifications are made, the PR can be merged into the main branch.

7. Deploy to Development:
   After merging to the main branch, the changes are quickly integrated into the live development environment via an automated CD pipeline.

8. Delete the Branch:
   Once the changes are merged, the feature branch can be safely deleted unless there are more changes required to finish the features/fixes.

`GitHub Flow` is often favored for its simplicity and speed. It encourages a continuous delivery approach, where changes are deployed `frequently and in smaller increments`, reducing the risk associated with large, infrequent releases. This workflow is well-suited for teams working on web applications and services where rapid iteration and deployment are crucial.

### Considerations

- Draft Pull Request:

  A `Draft Pull Request` in GitHub is a special type of pull request that indicates that the changes it contains are still a work in progress and not yet ready for review or merging. This feature is useful when you want to share your work with others for visibility or collaboration, but you're not seeking immediate feedback or approval.

  - Please refer to https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests#draft-pull-requests for more detailed information.

- Interactive Rebasing:

  `Interactive rebasing` allows you to have fine-grained control over your commit history, enabling you to clean up, reorder, and squash commits for a cleaner commit history, reducing noise in pull requests.

  For more information, visit:

  - [Git Rebase Documentation](https://git-scm.com/docs/git-rebase)
  - [Git Tools - Rewriting History](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

- Frequent Rebasing:

  `Frequent rebasing` is a vital practice in our workflow, ensuring your feature branch is based on the latest code. This `minimizes conflicts and eases integration`. To rebase, use `git pull origin main --rebase` in your feature branch. This promotes a smoother, collaborative development process.

## Deployment & Release Life Cycle

For this project, we manage three distinct environments: Development, Test, and Production. Each of these demands a tailored and efficient deployment process.

### Development

The Development environment undergoes continuous deployment whenever changes are made to the main branch. This enables us to assess the current state of the application based on the main branch's codebase. Within the pipeline, a new container image is generated and tagged with the Git commit hash. It's then pushed to the GitHub container registry for use in the deployment process.

- Please refer to [deploy-dev.yml](../.github/workflows/deploy-dev.yml) for more detailed information.

### Test

The Test environment experiences continuous deployment upon the `creation of a new Git tag`. Within the pipeline, a new container image is generated and tagged with the Git tag version. It is then pushed to the GitHub container registry for use in the deployment.

- Please refer to [release-tag-changelog.yml](../.github/workflows/release-tag-changelog.yml) for more detailed information.

It's important to note that the workflow pipeline automatically `initiates the deployment of the test environment` concurrently with the `generation of a PR that incorporates the changes log`. Kindly review the PR and merge it into the main branch.

### Production

Deployment to the Production environment is triggered upon the creation of a new [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). Unlike in Test, a new container image is not created. Instead, we leverage the existing container image that was generated for the Test environment. This approach provides the added benefit of using verified container images from the Test environment.

## CI Pipeline Checks

In this project, we employ two distinct CI checks to facilitate the seamless integration of new code before seeking peer reviews from colleagues.

1. Pre-commit Hook Checks
   Pre-commit hook checks are configured within the local development environment based on the specifications outlined in [.pre-commit-config.yaml](../.pre-commit-config.yaml). They serve to verify that the code changes in the developer's local environment meet the prescribed standards for code quality and security. To enforce these code quality standards across the entire repository, we enable the same set of checks in the CI pipeline.

   - Please refer to [test.yml](../.github/workflows/test.yml) for more detailed information.

2. Application Build & Testing
   To ensure that no unbuildable or untestable code changes are merged into the development environment, we conduct a series of basic scenario tests. This process guarantees that the new changes exhibit no linting issues, build problems, and pass the defined unit tests present in the codebase.

   - Please refer to [test.yml](../.github/workflows/test.yml) for more detailed information.

## Peer Review Protocol

To enhance clarity among contributors and facilitate effective peer reviews, we adhere to a standardized peer review process as a team. This process involves the following steps:

1. Implement the entire or partial feature/fix on the designated branches.
2. Ensure that the CI pipelines pass after pushing changes to the remote branch.
3. Create a pull request to the main branch, ensuring there are no code conflicts.
4. Notify team members of the new pull request in the team channel.
5. Any available team member for peer review should acknowledge by reacting with an `eye emoji (👀)` in the channel thread.
6. The reviewer provides feedback on the pull request using the GitHub UI or initiates a discussion within the channel thread.
7. If there are comments on the pull request, the reviewer may react to the thread with a `pencil emoji (✏️)`.
8. Once the reviewer is satisfied with the pull request, or if changes have been made following the initial review, they should react to the thread with a `thumbs-up emoji (👍)`.
9. After the pull request is approved, the writer can merge the pull request and subsequently delete the branch unless there is no further changes.

## Automated Dependency Updates

Automated dependency management plays a crucial role in keeping our project's libraries and dependencies up-to-date. This helps ensure that we benefit from the latest features, bug fixes, and security patches without manual intervention. We have two primary tools in place to facilitate this process:

- [Dependabot](https://github.com/bcgov/platform-services-registry/security/dependabot): Dependabot is a widely used automated dependency management tool that actively scans our project for outdated or vulnerable dependencies. It automatically opens pull requests with updated versions, allowing us to review and merge them with confidence.

- [Renovate](https://github.com/renovatebot/renovate): Renovate is another powerful tool for automating dependency updates. It actively monitors our project's dependencies and creates pull requests to update them when new versions are available. Renovate also provides advanced customization options, making it a versatile choice for dependency management.
  - Please refer to [Renovate Dashboard](https://developer.mend.io/github/bcgov) for more detailed information.

## Secret Scanning

In order to identify and manage potential secrets within your Git repository, a secret scanning task is executed as part of a pre-commit hook. This task utilizes a tool called [detect-secrets](https://github.com/Yelp/detect-secrets).
To create or update a baseline file that captures the potential secrets currently present in your repository, run:

```sh
detect-secrets scan > .secrets.baseline
```

## File Naming Conventions

Within Next.js applications, adhering to proper file naming conventions is essential. Here are three widely adopted practices:

1. Camel Case for File Names and Pascal Case for Component Names
2. `Kebab Case for File Names and Pascal Case for Component Names`
3. Pascal Case for Both File Names and Component Names

Outside the Next.js application folder, `kebab case` is commonly utilized for naming `folders and files`, especially in URLs. This preference is driven by several reasons:

- `URL Friendliness`: Kebab case, with its use of hyphens, contributes to URLs that are more readable and user-friendly. This enhances the overall user experience and facilitates easier navigation.

- `Consistency Across Platforms`: Kebab case is supported consistently across various platforms, making it a pragmatic choice for ensuring compatibility and avoiding issues related to case sensitivity.

- `SEO Considerations`: Search engines often interpret hyphens in URLs as space, potentially improving search result readability. This can positively impact your website's search engine optimization (SEO).

Choosing the second option, which involves `Kebab Case for file names and Pascal Case for component names`, is beneficial in scenarios where a more standardized and conventional naming approach is preferred within the Next.js application itself. This can promote code consistency and make it easier for developers to collaborate and understand the codebase. Additionally, adhering to a specific convention within the application can simplify naming-related decisions during development.

## Utilizing Sharable Functions

To enhance readability and ease of maintenance in our business logic, we leverage 3rd party packages, such as `lodash-es`, for common function usage.

If third-party packages do not provide suitable utilities, we create our own functions and organize them in designated project locations.
We've identified three distinct use cases for these common functions, each following agreed-upon guidelines:

- `Lower Level Functions`: Reserved for functions essential at the project's lower level, such as framework-level wrappers and helpers.

  - These functions reside in the `/core` directory.

- `Very Generic Functions`: Generic functions versatile enough for use in any project, not limited to the current one.

  - These functions are stored in the `/utils` directory.

- `Less Generic Functions`: Functions serving as helpers specifically within this project.
  - These functions are housed in the `/helpers` directory.

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

- **Validation Schema Naming:**

  - `userSchema`: The schema object for user data, named in camelCase and ending with `Schema`.
  - `User`: The TypeScript type inferred from `userSchema`, named in PascalCase.

- **Enum Naming:**
  - `ColorEnum`: The enum object for color options, named in PascalCase and ending with `Enum`.
  - `Color`: The TypeScript type inferred from `ColorEnum`, named in PascalCase.
