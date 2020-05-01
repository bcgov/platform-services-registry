#!/bin/bash

# This option causes the script to exit immediatly if
# an error is encountered.
set -o errexit

readonly REQUIRED_ENV_VARS=(
  "APP_DB_USER"
  "APP_DB_PASSWORD"
  "APP_DB_NAME")


# Verify the environment vars are set.
verify_env_vars() {
  for evar in ${REQUIRED_ENV_VARS[@]}; do
    if [[ -z "${!evar}" ]]; then
      echo "Err: The env var '$evar' must be set."
      exit 1
    fi
  done
}


# Initalize
init_rdbms() {
  psql -v ON_ERROR_STOP=1 --username "postgres" <<-EOSQL
     CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASSWORD';
     CREATE DATABASE $APP_DB_NAME;
EOSQL
}

main() {
  verify_env_vars
  init_rdbms
}

main "$@"
