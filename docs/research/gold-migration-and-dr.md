# Gold Cluster Migration and Disaster Recovery

This research explores the feasibility of migrating the Registry application from the Silver cluster to the Gold cluster, along with the potential use of the GoldDR cluster for disaster recovery (DR).

## Comparison: Silver vs. Gold (without DR)

Both clusters offer the same SLA of 99.5%. However, when DR is properly configured, the SLA can increase to 99.95%. The main difference between the two clusters lies in their patch and upgrade cycles: Gold receives patches and upgrades **after** the Silver cluster.

This staggered update schedule can be seen as a benefit of the Gold cluster — offering greater stability, since any issues with updates are likely to be caught on Silver first. On the other hand, it introduces a trade-off between **stability and security**. If a patch contains critical security updates, Gold remains vulnerable until it receives the patch.

## Enabling the Disaster Recovery (DR) Cluster

To enable the DR cluster, the following steps are required:

1. **Request a GSLB (Global Service Load Balancer) domain via iStore**

   - This requires the health check endpoints of the Registry application.

2. **Update DNS Configuration via NNR (Remedy App)**

   - Configure the `CNAME` of the Registry vanity URL to point to the GSLB domain.

3. **Build & Deploy a Switchover Agent**

   - This server monitors the IP address of the GSLB domain and triggers custom logic during a failover event.
   - The agent should ideally run in both clusters, or at least in the DR cluster.

4. **Update CI/CD Pipelines (e.g., GitHub Actions)**

   - Ensure necessary deployments and StatefulSets are included for the GoldDR cluster.

5. **MongoDB Data Sync Strategy**

   - Syncing data between MongoDB instances in the Gold and GoldDR clusters requires further investigation.
   - Unlike PostgreSQL (e.g., using `Patroni` with `TransportServerClaim`), MongoDB does not provide a built-in, cross-cluster active-standby replication mechanism.
   - A possible fallback is to perform frequent backups from the Gold cluster and restore them in the GoldDR cluster.
     - However, this approach introduces **data integrity risks**, particularly in failover scenarios where recent data changes could be lost.
     - Restoring data back to Gold once it becomes available again also presents significant operational challenges.
     - This method would require storing backup files in object storage (e.g., an AWS S3 bucket or equivalent), rather than using PVCs.

6. **Stateless Provisioner Services (13–15 services)**
   - There are no data persistence concerns, but the services must run continuously in both clusters.
   - Otherwise, they must be recreated in the DR cluster during failover by the switchover agent.

### Additional Considerations

- What should project teams do if their products are deployed on the Gold cluster and it goes down?

## Alternative Uses for the DR Cluster

If enabling the DR cluster to run the full application proves too complex, we can still explore other ways to leverage the DR environment for added value:

1. **Display a Maintenance Page**

   - Use the DR cluster to serve a maintenance page during outages or failover events.
   - This provides users with a clear and professional message, rather than an empty or broken page.

2. **Run the Registry in Read-Only Mode**
   - Serve a limited, read-only version of the Registry application from the DR cluster.
   - While this still requires a data synchronization strategy, it eliminates the need to failover provisioner services, since they aren’t necessary in read-only mode.
   - This option provides partial availability while minimizing operational complexity.
