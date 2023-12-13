# Airflow (Task Scheduler) Deployment Procedure

## Overview

The primary Helm chart for deployment relies on two subordinate Helm charts: `Airflow` and `PostgreSql`. Given that `Airflow` is dependent on `PostgreSql`, the initial deployment sequence involves deploying `PostgreSql` before initiating the deployment of `Airflow` instances.

## Deployment Steps

1. In the Helm values file specific to the environment (e.g., `values-101ed4-tools.yaml`), set the value of `airflow.enabled` to `false`.
2. Deploy the `PostgreSQL` database:

```sh
make upgrade NAMESPACE=101ed4-tools
```

3. Once the database deployment is complete, proceed to deploy `Airflow`:

```sh
make upgrade NAMESPACE=101ed4-tools
```

## Considerations

- Prior to the deployment of `Airflow`, a [job]('./templates/templates/job.yaml) runs to `synchronize the dags`. Due to the upload mechanism using a [config map]('./templates/templates/configmap.yaml), there is a file `size limitation of 1MB` for the total dag files. If the size of dag files grows in the future, alternative methods for file synchronization will need to be explored.
