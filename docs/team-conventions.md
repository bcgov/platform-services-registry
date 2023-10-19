# Team Conventions

## Conventional Commits

## Git Branching Model

## Deployment & Release Life Cycle

## CI Pieline Checks

## Peer Review Process

## Automated dependency updates

    - [dependabot](https://github.com/bcgov/platform-services-registry/security/dependabot)
    - [renovate](https://github.com/renovatebot/renovate)

## Secret Scanning

In order to identify and manage potential secrets within your Git repository, a secret scanning task is executed as part of a pre-commit hook. This task utilizes a tool called [detect-secrets](https://github.com/Yelp/detect-secrets).
To create or update a baseline file that captures the potential secrets currently present in your repository, run:

```sh
detect-secrets scan > .secrets.baseline
```
