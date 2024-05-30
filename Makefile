SHELL := /usr/bin/env bash

.PHONY: localdev
localdev:
	export MACHINE_HOST_IP=$$(hostname -I | awk '{print $$1}'); \
	docker-compose -f ./localdev/docker-compose.yml up --build

.PHONY: dev
dev:
	npm run dev --prefix app

.PHONY: install
install:
	npm install
	npm install --prefix app
	npm install --prefix cypress
	npm install --prefix data-migrations
