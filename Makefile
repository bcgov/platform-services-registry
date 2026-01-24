SHELL := /usr/bin/env bash

.PHONY: sandbox
sandbox:
	export MACHINE_HOST_IP=$$(hostname -I | awk '{print $$1}'); \
	docker-compose -f ./sandbox/docker-compose.yml up --build --remove-orphans

.PHONY: localmac
localmac:
	export MACHINE_HOST_IP=$$(ipconfig getifaddr en0); \
	docker-compose -f ./sandbox/docker-compose.yml -f ./sandbox/docker-compose-arm64.yml up --build --remove-orphans

.PHONY: dev
dev:
	pnpm --dir app run prisma-push
	pnpm --dir app run dev

.PHONY: install
install: asdf-install
install:
	pnpm install
	pnpm --dir app install
	pnpm --dir data-migrations install
	pnpm --dir sandbox/_packages/keycloak-admin install
	pnpm --dir sandbox/keycloak-provision install
	pnpm --dir sandbox/m365mock install
	pnpm --dir sandbox/nats-provision install
	$(MAKE) canvas-install

.PHONY: canvas-install
canvas-install:
	test -f app/node_modules/canvas/build/Release/canvas.node || (cd app && pnpm rebuild canvas)

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
