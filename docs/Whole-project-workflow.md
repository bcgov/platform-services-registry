# Product Registry Business Process ---by Alexandra Lloyd

### Provisioning

1. PO makes a new provision request with default quotas using the front-end React based application. This request is saved within the Registry PostGres database
2. Back-end Node.js based section of the Registry sends out email notifications to:
   - All product contacts (PO and TLs)
   - Super admins on email list (those with the ability to approve requests) (Shelly, Cailey, Oamar, Jason, Olena, Billy, Nick)
3. Super Admin goes into the front-end of the Registry to either approve or reject the request
   - If approved, the status of the request changes to approved within the Registry.
   - If rejected, the status of the request changes to deleted within the Registry. The product request is marked as deleted and not sent to the Provisioner application
4. The decision is saved in the Registry database. All product contacts are notified of the decision by email
   - If the request is rejected, the product request process is completed at this step
5. Back-end of the Registry re-formats provisioning request as a JSON message and sends request information NATS server
6. NATS publisher subscriber (Pub Sub) messenger service sends request info to Provisioner application
7. Argo Events sensor detects the messages and initiates an Argo Workflow
8. Argo Workflow creates a Pod that runs Ansible playbook
9. Argo Workflow creates ACS account using data from provisioning request
10. Pod runs a container app that runs an image called App.Provisioner
11. Pod creates YAML manifest using templates plus data from the NATS message to create the manifest and puts it into a GitHub repository
12. After this is completed, the pull requests in the GitHub repo are merged
13. GitHub action makes a call via NATS to the Registry API to let the Registry know the changes are complete
14. Argo CD detects the changes in the Git repository and applies these changes in the cluster, creating a new namespace to fulfill the provisioning request
15. Argo CD creates Vault general service account that belongs to namespace, and two licensed accounts for the Product Owner and Technical Lead
16. Argo CD creates Artifactory general service account object that belongs to the namespace that anyone on the account can use to pull images
17. Registry changes status of request to Provisioned and saves changes in its database
18. Back-end of the Registry sends an email notification to all product contacts informing them that a namespace has been created
