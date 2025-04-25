# Deployment & Release Life Cycle

For this project, we manage three distinct environments: Development, Test, and Production. Each of these demands a tailored and efficient deployment process.

## Development

The Development environment undergoes continuous deployment whenever changes are made to the main branch. This enables us to assess the current state of the application based on the main branch's codebase. Within the pipeline, a new container image is generated and tagged with the Git commit hash. It's then pushed to the GitHub container registry for use in the deployment process.

-   Please refer to [deploy-dev.yml](../.github/workflows/deploy-dev.yml) for more detailed information.

## Test

The Test environment experiences continuous deployment upon the `creation of a new Git tag`. Within the pipeline, a new container image is generated and tagged with the Git tag version. It is then pushed to the GitHub container registry for use in the deployment.

-   Please refer to [release-tag-changelog.yml](../.github/workflows/release-tag-changelog.yml) for more detailed information.

It's important to note that the workflow pipeline automatically `initiates the deployment of the test environment` concurrently with the `generation of a PR that incorporates the changes log`. Kindly review the PR and merge it into the main branch.

## Production

Deployment to the Production environment is triggered upon the creation of a new [GitHub Release](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases){target="\_blank" rel="noopener noreferrer"}. Unlike in Test, a new container image is not created. Instead, we leverage the existing container image that was generated for the Test environment. This approach provides the added benefit of using verified container images from the Test environment.
