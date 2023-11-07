SHELL := /usr/bin/env bash

.PHONY: localdev
localdev:
	docker-compose -f ./localdev/docker-compose.yml up
