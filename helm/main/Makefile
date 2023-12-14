SHELL := /usr/bin/env bash

NAME_APP := pltsvc
NAME_EMAILS := pltsvc-emails

NAMESPACE=
IMAGE_TAG=

ifndef NAMESPACE
$(error NAMESPACE is not set)
endif

ifndef IMAGE_TAG
$(error IMAGE_TAG is not set)
endif

define arguments_app
	"${NAME_APP}" . -n "${NAMESPACE}" -f values.yaml \
	--set app.image.tag="${IMAGE_TAG}" \
	--set app.preImage.tag="${IMAGE_TAG}"
endef

define arguments_emails
	"${NAME_EMAILS}" . -n "${NAMESPACE}" -f values-emails.yaml \
	--set emails.image.tag="${IMAGE_TAG}"
endef

.PHONY: helm-dep
helm-dep:
	helm dependency update

.PHONY: install
install: helm-dep
install:
	# @helm install $(call arguments_app)
	@helm install $(call arguments_emails)

.PHONY: upgrade
upgrade: helm-dep
upgrade:
	# @helm upgrade --install $(call arguments_app) --atomic
	@helm upgrade --install $(call arguments_emails) --atomic

.PHONY: lint
lint: helm-dep
lint:
	@helm upgrade --dry-run --install $(call arguments_app)
	@helm upgrade --dry-run --install $(call arguments_emails)

.PHONY: uninstall
uninstall: helm-dep
uninstall:
	@helm uninstall ${NAME_APP} -n ${NAMESPACE}
	@helm uninstall ${NAME_EMAILS} -n ${NAMESPACE}

.PHONY: template
template: helm-dep
template:
	@helm template $(call arguments_app) > template.yaml
	@helm template $(call arguments_app) > template-emails.yaml

.PHONY: force-install
force-install: uninstall
force-install: install
