# Team Conventions

## Secret Scanning

In order to identify and manage potential secrets within your Git repository, a secret scanning task is executed as part of a pre-commit hook. This task utilizes a tool called [detect-secrets](https://github.com/Yelp/detect-secrets).
To create or update a baseline file that captures the potential secrets currently present in your repository, run:

```sh
detect-secrets scan > .secrets.baseline
```
