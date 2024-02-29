# Airflow (Task Scheduler) Deployment Procedure

## Overview

The primary Helm chart for deployment relies on two subordinate Helm charts: `Airflow` and `PostgreSql`.

## Deployment Steps

To deploy the Helm charts, simply execute the following command:

```sh
make upgrade NAMESPACE=101ed4-tools
```

- If the initial deployment fails because of `Airflow`'s dependency on `PostgreSQL`, just rerun the above command.

## Upgrading DAGs

While the general deployment step also updates the `Airflow DAG files`, it might take longer due to pre-conditioned default jobs. To specifically update the Airflow DAGs, use the following command:

```sh
make dags NAMESPACE=101ed4-tools
```

## Considerations

- Prior to the deployment of `Airflow`, a [job]('./templates/templates/job.yaml) runs to `synchronize the dags`. Due to the upload mechanism using a [config map]('./templates/templates/configmap.yaml), there is a file `size limitation of 1MB` for the total dag files. If the size of dag files grows in the future, alternative methods for file synchronization will need to be explored.

## Upgrade SonarQube Server

- After completing the SonarQube version upgrade, navigate to `/setup` to finalize the database migration.

## ACS API Token

To create `ACS API tokens`, navigate to `Platform Configuration` > `Integrations` > `Authentication Tokens` > `API Token`. The Airflow tasks necessitate `read` access to ACS resources, requiring the `Analyst` role for the tokens. Since the maximum token lifespan is `one year`, it's essential to recreate the tokens before they expire.
