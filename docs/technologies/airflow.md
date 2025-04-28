# Apache Airflow

Scheduled tasks are a common requirement in applications, and the Registry app also needs to run regular jobs. Among the available options — such as Kubernetes CronJobs or a custom-built service — we decided to deploy one of the most popular open-source scheduling platforms: **Apache Airflow**, a system designed for orchestrating and managing complex workflows and data pipelines.

## Key Points

-   Workflows are defined as Python code, called **DAGs** (Directed Acyclic Graphs).
-   Each task in a DAG can perform actions such as running a script, moving files, triggering an API, or loading data into a database.
-   Airflow provides features like task retries, pause/resume functionality, scheduling (similar to cron jobs), and monitoring via a web UI.

## Executor Type

Airflow supports multiple types of executors that determine **how** tasks are run:

-   **Sequential Executor**: Runs tasks one at a time. Mainly used for local development or testing.
-   **Local Executor**: Runs multiple tasks in parallel on the same machine.
-   **Celery Executor**: Distributes tasks across multiple worker machines using a message broker (like RabbitMQ or Redis).
-   **Kubernetes Executor**: Creates a new Kubernetes pod for each task, achieving full task-level isolation and scalability.

We use the **Kubernetes Executor** for the following benefits:

-   **Dynamic scalability**: Each task runs in its own isolated pod, allowing better resource management.
-   **Improved fault isolation**: Failures in one task do not affect others.
-   **Native Kubernetes integration**: Airflow tasks can natively use Kubernetes features like pod auto-scaling, node pools, and custom resource configurations.
-   **No need for a separate worker pool**: Unlike Celery, the Kubernetes Executor does not require maintaining a separate fleet of workers.

This setup aligns well with our infrastructure strategy, as the platform is already Kubernetes-based.

## DAG Synchronization

All Airflow DAGs are located in the `helm/tools/dags` directory. They are synchronized to the Airflow deployment by mounting a Kubernetes `ConfigMap` to the Airflow service's `dags` directory. Although other synchronization methods exist (e.g., syncing via Git-Sync Sidecar), we chose this approach because it is straightforward and the number of DAGs is currently small.

To sync DAGs without triggering a full Airflow redeployment (to reduce deployment time), run:

```sh
cd helm/tools
make dags
```

### Considerations

Because DAGs are uploaded via a [ConfigMap](./templates/templates/configmap.yaml), there is a **1MB size limit** for the total DAG files.
If the DAG files exceed this limit in the future, alternative synchronization methods will need to be explored.

## Deployment and Secrets

Airflow is deployed as part of the group of tools in the `tools` namespace. Two secrets must be managed manually:

-   `airflow-ui-creds`: Contains the admin credentials for the Airflow UI console.
-   `airflow-variables`: Stores environment variables used by Airflow tasks.
