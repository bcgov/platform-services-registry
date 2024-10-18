## Resource Metrics Setup

For Registry to get metrics from Prometheus, the following things are needed:
- a Service Account `registry-metrics-reader`
- the cluster role and rolebinding for the SA to access metrics from all namespaces
- a non-rotating service account token secret `registry-metrics-reader-sa-token` that can be used for Prometheus query

These are created as part of the CCM from https://github.com/bcgov-c/platform-gitops-gen/tree/master/roles/cluster_checks/files

To obtain the SA token for the query and test it out:
```bash
# get the token:
export REGISTRY_TOKEN=$(oc get secret registry-metrics-reader-sa-token -n gitops-tools -o jsonpath='{.data.token}' | base64 --decode)
# check token:
echo $REGISTRY_TOKEN
# test query (this is just an example, make sure to update the URL and query used for different environments)
curl \
-H 'Accept: application/json' \
-H "Authorization: Bearer $REGISTRY_TOKEN" \
-d 'query=sum(pod:container_cpu_usage:sum{namespace="e9b123-prod", pod=~"getok-app.*"})' \
https://thanos-querier-openshift-monitoring.apps.klab.devops.gov.bc.ca/api/v1/query

```
