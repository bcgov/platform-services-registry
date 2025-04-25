# Database

## Backup and Restore Procedures

To facilitate the backup and restore processes, we utilize a container running MongoDB tools available at [database-tools](https://github.com/egose/database-tools){target="\_blank" rel="noopener noreferrer"}.

### Backup Configuration

-   The Kubernetes deployment template for the backup process can be found at [mongodb-backup.yaml](https://github.com/bcgov/platform-services-registry/blob/main/helm/main/templates/mongodb-backup.yaml){target="\_blank" rel="noopener noreferrer"}. This template orchestrates the deployment of the MongoDB tools container.
-   A notification mechanism has been set up to inform the designated RocketChat channel about the status of the backup operation.

### Backup Steps

The backup procedure is initiated at regular intervals according to the cron schedule set by the backup container. However, there are occasions when manual backup is required, such as before deploying to the production environment. To back up the database, follow these steps:

```sh
oc rsh <backup-pod-name>
mongo-archive --db=pltsvc --read-preference=secondaryPreferred --force-table-scan --cron=false
```

Ensure that the new backup file is generated in the designated backup directory `/home/nonroot/backup`.

### Restore Steps

To restore the database, follow these steps:

```sh
oc rsh <backup-pod-name>
mongo-unarchive --uri="mongodb://<primary-pod-name>.pltsvc-mongodb-headless/?authSource=admin" --db=pltsvc
```

Execute the provided shell commands to access the backup pod and initiate the restoration process. The mongo-unarchive command uses the specified MongoDB URI, which includes the `primary pod name` and authentication details from the admin source. The restoration is targeted for the `pltsvc` database.
