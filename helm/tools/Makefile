SHELL := /usr/bin/env bash
NAME := secdash

NAMESPACE=

ifndef NAMESPACE
$(error NAMESPACE is not set)
endif

# Get the allowed UID that is allowed in the namespace
UID := $(shell oc get project "${NAMESPACE}" -o json | jq -r '.metadata.annotations."openshift.io/sa.scc.uid-range"' | cut -d'/' -f1)

# Calculate the SHA256 sum of the 'dags' directory to trigger deployment when changes occur
SHA := $(shell find ./dags -type f -exec sha256sum {} + | sha256sum | cut -d' ' -f1)

DAGS_DIRECTORY := ./dags

# Get the list of filenames in the directory
FILENAMES := $(notdir $(wildcard $(DAGS_DIRECTORY)/*))
INDEX := 0

# It is necessary to set individual volume mounts for each DAG file since
# mounting the entire ConfigMap data creates symbolic links.
#
# Example directory structure after mounting ConfigMap data:
# drwxr-sr-x. 2 root    1015800000 37 Dec  9 00:00 ..2023_12_09_00_00_55.2390650048
# lrwxrwxrwx. 1 root    1015800000 32 Dec  9 00:00 ..data -> ..2023_12_09_00_00_55.2390650048
# lrwxrwxrwx. 1 root    1015800000 14 Dec  9 00:00 testa.py -> ..data/testa.py
# lrwxrwxrwx. 1 root    1015800000 15 Dec  9 00:00 testb.py -> ..data/testb.py
define arguments
	"${NAME}" . -n "${NAMESPACE}" -f values.yaml -f "values-${NAMESPACE}.yaml" \
	--set airflow.uid="${UID}" \
	--set airflow.gid="${UID}" \
	--set sonarqube.securityContext.fsGroup="${UID}" \
	--set sonarqube.containerSecurityContext.runAsUser="${UID}" \
	--set sonarqube.containerSecurityContext.runAsGroup="0" \
	--set sonarqube.initContainers.securityContext.runAsUser="${UID}" \
	--set sonarqube.initContainers.securityContext.runAsGroup="0" \
	--set dags.sha="${SHA}" \
	$(foreach filename,$(FILENAMES),\
		--set "dags.volumeMounts[$(INDEX)].name=secdash-airflow-dags-copy" \
		--set "dags.volumeMounts[$(INDEX)].mountPath=/newdags/$(filename)" \
		--set "dags.volumeMounts[$(INDEX)].readOnly=true" \
		--set "dags.volumeMounts[$(INDEX)].subPath=$(filename)" \
		$(eval INDEX=$(shell expr $(INDEX) + 1)) \
	)
endef

.PHONY: clean-job
clean-job:
	kubectl delete job secdash-airflow-dags-copy || true

.PHONY: helm-dep
helm-dep:
	helm dependency update

.PHONY: install
install: helm-dep
install:
	@helm install $(call arguments)

.PHONY: upgrade
upgrade: helm-dep
upgrade:
	@helm upgrade --install $(call arguments)

.PHONY: lint
lint: helm-dep
lint:
	@helm upgrade --dry-run --install $(call arguments)

.PHONY: uninstall
uninstall: helm-dep
uninstall:
	@helm uninstall ${NAME} -n ${NAMESPACE}

.PHONY: template
template: helm-dep
template:
	@helm template $(call arguments) --debug > template.yaml

# Use when syncing only DAG files
.PHONY: dags
dags: helm-dep
dags:
	@helm upgrade $(call arguments) --set airflow.migrateDatabaseJob.enabled="false" --set airflow.webserver.defaultUser.enabled="false"

.PHONY: force-install
force-install: uninstall
force-install: install

.PHONY: arguments
arguments:
	@echo "$(call arguments)"
