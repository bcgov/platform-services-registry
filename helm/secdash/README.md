# Airflow (Task Scheduler) Deployment Procedure

## Overview

The primary Helm chart for deployment relies on two subordinate Helm charts: `Airflow` and `PostgreSql`.

## Deployment Steps

1. Execute the following command to deploy the Helm charts:

```sh
make upgrade NAMESPACE=101ed4-tools
```

- In case the initial deployment fails due to the dependency of `Airflow` on `PostgreSQL`, please rerun the command above.

## Considerations

- Prior to the deployment of `Airflow`, a [job]('./templates/templates/job.yaml) runs to `synchronize the dags`. Due to the upload mechanism using a [config map]('./templates/templates/configmap.yaml), there is a file `size limitation of 1MB` for the total dag files. If the size of dag files grows in the future, alternative methods for file synchronization will need to be explored.

## Upgrade SonarQube Server

- After completing the SonarQube version upgrade, navigate to `/setup` to finalize the database migration.
