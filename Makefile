SHELL := /usr/bin/env bash

.PHONY: localdev
localdev:
	export MACHINE_HOST_IP=$$(hostname -I | awk '{print $$1}'); \
	docker-compose -f ./localdev/docker-compose.yml up --build

.PHONY: localmac
localmac:
	export MACHINE_HOST_IP=$$(ipconfig getifaddr en0); \
	docker-compose -f ./localdev/docker-compose.yml -f ./localdev/docker-compose-arm64.yml up --build

.PHONY: dev
dev:
	npm run dev --prefix app

.PHONY: install
install:
	npm install
	npm install --prefix app
	npm install --prefix data-migrations

# To copy data from the live environment, please follow these steps:
# 1. Log into the OCP API using the API token provided by the OCP console.
# 2. Select the environment namespace with the command 'oc project abcdef-xxx'.
# 3. Execute the following Make command:
.PHONY: copy-db
copy-db:
	./.bin/copy-db.sh
