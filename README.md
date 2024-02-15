# Platform Services Registry

[![Lifecycle:Maturing](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

## Project Overview

&emsp;This application facilitates the efficient allocation of OpenShift namespace environments within BC Gov. in response to project team requests. It streamlines the handling of new and update requests, ensuring scalability and flexibility. Key features include a user-friendly request management system, automated provisioning, and comprehensive notification and monitoring capabilities.

## Key Technologies Used

### Application

- [Next.js](https://nextjs.org/): Utilized for crafting full-stack web applications, Next.js extends React capabilities and integrates powerful Rust-based JavaScript tools, heightening performance by delivering fully-rendered HTML to the client.

- [Tailwind UI](https://tailwindui.com/): Harnessed for swift UI development, Tailwind UI's pre-built HTML snippets streamline design workflows by enabling direct style additions to HTML elements.

- [React Hook Form](https://react-hook-form.com/): Simplifies complex form building by reducing code volume and unnecessary re-renders.

- [Zod](https://zod.dev/): A TypeScript-first schema declaration and validation library leveraged for its developer-friendly features and elimination of duplicative type declarations.

These technologies foster rapid iterative development, polished user interfaces, and a user-centric experience for application development.

### Database & ORM

- [MongoDB](https://www.mongodb.com/): Selected for its flexible schema, scalability, high performance, rich querying, automatic failover, and robust community support, making it an ideal choice for diverse applications.

- [Prisma](https://www.prisma.io/): Utilized for its streamlined development processes, error reduction, and enhanced maintainability, enabling developers to focus more on feature development rather than managing database interactions.

### Run-time Package Version Manager

- [asdf](https://asdf-vm.com/): Employed for managing multiple runtime versions, simplifying dependency management, and ensuring consistency across development environments.

### Linters & Formatters

- [pre-commit](https://pre-commit.com/): Employed for managing and maintaining multi-language pre-commit hooks to enforce project standards and best practices, reducing the likelihood of bugs or inconsistencies.

- [ESLint](https://eslint.org/): A static code analysis tool ensuring adherence to coding conventions and identifying problematic patterns in JavaScript/Typescript code.

- [ShellCheck](https://www.shellcheck.net/): Utilized for static analysis of shell scripts, suggesting improvements and ensuring safer, more efficient, and portable script code.

### Testing Framework

- [Jest](https://jestjs.io/): Employed for JavaScript code testing, providing built-in mocking, assertion utilities, and code coverage analysis for efficient and intuitive testing.

- [Cypress](https://www.cypress.io/): Utilized for end-to-end testing of web applications, offering automatic waiting, real-time reloading, and an interactive test runner for seamless test creation and debugging.

### Deployment Tools

- [GitHub Actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions): A robust CI/CD platform automating various tasks and processes within GitHub repositories, including building, testing, and deploying applications.

- [GitHub Packages](https://docs.github.com/en/packages/quickstart): A package hosting service integrated with GitHub repositories, facilitating version control, access control, and dependency management for software packages.

- [Helm](https://helm.sh/docs/): A Kubernetes package manager simplifying deployment, management, and scaling of applications in Kubernetes clusters.

- [release-it](https://github.com/release-it/release-it): An open-source command-line interface (CLI) tool designed to automate the release process of software projects. It streamlines tasks such as versioning, changelog generation, tagging, and publishing releases to version control systems.

### Configuration of Code

- [Terraform](https://www.terraform.io/): An open-source IaC tool automating provisioning and management of infrastructure resources across various cloud providers, ensuring standardized and efficient deployment with seamless peer review processes and change history tracking within the source control platform.

## Challenges and Solutions / Lessons Learned

### Peer Review Optimization

&emsp;A significant challenge the team encountered was optimizing the peer review process to facilitate the effective review and integration of new changes into the main branch with minimal time and effort from colleagues. We identified opportunities for improvement by implementing checks to ensure code quality and seamless integration with the deployment process. Leveraging the `pre-commit` tool, we conducted code quality checks locally before committing changes, and by extending these checks to our CI pipelines, we reduced the burden on colleagues reviewing linting and formatting issues during peer review. Following the implementation of these automated processes, the peer review workflow became more efficient, and we gained confidence in applying changes to the main branch and deploying them to the development environment. This experience highlighted the importance of continuous integration checks, emphasizing their necessity for ongoing improvement as the project evolves.

### Container Image Management and Deployment

&emsp;Navigating container image management and deployment within our continuous deployment process presented challenges, particularly in ensuring efficient building and publishing while maintaining control over image usage. However, this experience highlighted the importance of leveraging available tools effectively to overcome such hurdles. By harnessing `GitHub Packages` and `GitHub Actions`, we streamlined our deployment pipelines, enabling seamless building, tagging, and storage of container images. Furthermore, integrating `Helm charts` facilitated intuitive deployment of updated Kubernetes templates, enhancing overall deployment efficiency. This journey emphasized the value of exploring and leveraging existing tools and features to optimize workflows and address challenges in software development projects.

### Ensuring Container Consistency in Production Deployments from Testing Environment

&emsp;Maintaining consistency between the testing and production environments proved challenging. Discrepancies in container images built for production, despite originating from the same codebase as those tested, posed a risk of introducing unexpected issues and compromising production stability. Even with identical codebases, variations during container image generation could lead to subtle differences, potentially disrupting deployments. To address this, we implemented a solution where we reference the container images built for the testing environment in production. This approach minimizes the potential for discrepancies during deployment, ensuring greater reliability and consistency in the production environment.

### Automated Change Log Generation

&emsp;To maintain an accurate record of application changes, we implemented tag-based deployment extensively across upper environments. This approach offers us the flexibility to roll back to previous application versions by updating container image tags and facilitates the generation of change logs based on these tags. Leveraging tools such as `conventional-changelog-cli` and `release-it`, we automated this process. Whenever a new tag is generated for testing and production environments after changes are verified, the CHANGELOG.md file is automatically updated by the tool. This automated mechanism ensures that our change log remains up-to-date, reflecting all pertinent modifications made to the application.

### Infrastructure Configuration as Code

&emsp;Incorporating changes into the infrastructure and other managed services posed a challenge, particularly in integrating the change process into the peer review workflow and maintaining a clear history within the repository. To address this challenge, we implemented `Terraform` as a solution for managing resources in our infrastructures, including services like Keycloak and Sysdig. This allowed us to define and track changes to infrastructure configurations in code, enabling seamless integration into the peer review process and providing a transparent history of modifications within the repository.

### Team Convention Meetings and Codebase Consistency

&emsp;The absence of team conventions can result in codebase inconsistencies and delays during individual implementation and peer review stages. To address this issue, we organize regular team meetings to establish and document agreed-upon conventions. This approach allows us to discuss common deployment concerns and streamline the deployment process. Following these discussions, we enhance our CI checks where possible and document conventions to ensure they are tracked and adhered to consistently. By implementing this solution, we foster a more cohesive development environment and expedite the deployment process.

## Useful Links

- Git Pre-commit Hooks: https://github.com/bcgov/platform-services-registry/blob/main/.pre-commit-config.yaml
- CI/CD Pipelines: https://github.com/bcgov/platform-services-registry/tree/main/.github/workflows
- Helm Charts: https://github.com/bcgov/platform-services-registry/tree/main/helm
- Terraform Scripts: https://github.com/bcgov/platform-services-registry/tree/main/terraform
- Documentations: https://github.com/bcgov/platform-services-registry/tree/main/docs
