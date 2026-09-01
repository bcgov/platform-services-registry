SHELL := /usr/bin/env bash

# Sandbox detach flag, set to true to run docker-compose in detached mode
SBD ?= false
DETACH_FLAG := $(if $(filter true 1 yes,$(SBD)),-d,)

.PHONY: sandbox
sandbox:
	export MACHINE_HOST_IP=$$(hostname -I | awk '{print $$1}'); \
	docker-compose -f ./sandbox/docker-compose.yml up $(DETACH_FLAG) --build --remove-orphans

.PHONY: localmac
localmac:
	export MACHINE_HOST_IP=$$(ipconfig getifaddr en0); \
	docker-compose -f ./sandbox/docker-compose.yml -f ./sandbox/docker-compose-arm64.yml up $(DETACH_FLAG) --build --remove-orphans

.PHONY: local-airflow
local-airflow:
	set -a; [ -f app/.env.local ] && . app/.env.local; set +a; \
	export MACHINE_HOST_IP=$$(ipconfig getifaddr en0); \
	if [ -z "$$AWS_PROFILE" ]; then \
	  echo "AWS Cost Explorer: set AWS_PROFILE in app/.env.local"; \
	elif command -v aws >/dev/null && aws sts get-caller-identity --profile "$$AWS_PROFILE" >/dev/null 2>&1; then \
	  echo "AWS Cost Explorer: profile $$AWS_PROFILE (host ~/.aws)"; \
	else \
	  echo "AWS Cost Explorer: SSO expired or missing. Run: aws sso login --profile $$AWS_PROFILE"; \
	fi; \
	if [ -z "$$FINANCE_AZURE_COST_SCOPE" ]; then \
	  echo "Azure Cost Management: set FINANCE_AZURE_COST_SCOPE in app/.env.local"; \
	fi; \
	unset AZURE_ACCESS_TOKEN; \
	if command -v az >/dev/null; then \
	  AZURE_ACCESS_TOKEN=$$(az account get-access-token --resource https://management.azure.com --query accessToken -o tsv) || true; \
	  export AZURE_ACCESS_TOKEN; \
	fi; \
	if [ -n "$$AZURE_ACCESS_TOKEN" ]; then \
	  echo 'Azure Cost Management: refreshed az CLI token (expires ~1h)'; \
	elif [ -n "$$AZURE_CLIENT_SECRET" ]; then \
	  echo 'Azure Cost Management: using service principal env'; \
	else \
	  echo 'Azure Cost Management: no token. Run az login, then make local-airflow again.'; \
	fi; \
	docker-compose -f ./sandbox/docker-compose.yml -f ./sandbox/docker-compose-arm64.yml -f ./sandbox/docker-compose-airflow.yml up $(DETACH_FLAG) --force-recreate airflow

.PHONY: dev
dev:
	pnpm --dir app run prisma-push
	pnpm --dir app run dev

.PHONY: install
install: asdf-install
	pnpm install
	$(MAKE) canvas-install

.PHONY: canvas-install
canvas-install:
	@test -f app/node_modules/canvas/build/Release/canvas.node || (cd app && pnpm rebuild canvas)


.PHONY: asdf-install
asdf-install:
	cat .tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin add || true
	asdf plugin update --all
	asdf install || true
	asdf reshim
	pip install -r requirements.txt
	asdf reshim

# To copy data from the live environment, please follow these steps:
# 1. Log into the OCP API using the API token provided by the OCP console.
# 2. Select the environment namespace with the command 'oc project abcdef-xxx'.
# 3. Execute the following Make command:
.PHONY: copy-db
copy-db:
	./.bin/copy-db.sh

.PHONY: format-python
format-python:
	autopep8 --in-place --recursive .

.PHONY: mk-serve
mk-serve:
	mkdocs serve

.PHONY: mk-build
mk-build:
	mkdocs build
