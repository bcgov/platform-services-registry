# CI Pipeline Checks

In this project, we employ two distinct CI checks to facilitate the seamless integration of new code before seeking peer reviews from colleagues.

1. Pre-commit Hook Checks
   Pre-commit hook checks are configured within the local development environment based on the specifications outlined in [.pre-commit-config.yaml](../.pre-commit-config.yaml). They serve to verify that the code changes in the developer's local environment meet the prescribed standards for code quality and security. To enforce these code quality standards across the entire repository, we enable the same set of checks in the CI pipeline.

   - Please refer to [test.yml](../.github/workflows/test.yml) for more detailed information.

2. Application Build & Testing
   To ensure that no unbuildable or untestable code changes are merged into the development environment, we conduct a series of basic scenario tests. This process guarantees that the new changes exhibit no linting issues, build problems, and pass the defined unit tests present in the codebase.

   - Please refer to [test.yml](../.github/workflows/test.yml) for more detailed information.
