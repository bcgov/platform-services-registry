SHELL := /usr/bin/env bash

.PHONY: localdev
localdev:
	export MACHINE_HOST_IP=$$(hostname -I | awk '{print $$1}'); \
	docker-compose -f ./localdev/docker-compose.yml up --build --remove-orphans

.PHONY: localmac
localmac:
	export MACHINE_HOST_IP=$$(ipconfig getifaddr en0); \
	docker-compose -f ./localdev/docker-compose.yml -f ./localdev/docker-compose-arm64.yml up --build --remove-orphans

.PHONY: dev
dev:
	@DATABASE_URL=$$(grep -m 1 '^DATABASE_URL=' app/.env.local | cut -d '=' -f 2-) \
	npm run prisma-push --prefix app && \
	npm run dev --prefix app

.PHONY: install
install:
	pnpm install
	npm install --prefix app
	npm install --prefix data-migrations

.PHONY: asdf-install
asdf-install:
	cat .tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin-add || true
	asdf plugin-update --all
	asdf install
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
