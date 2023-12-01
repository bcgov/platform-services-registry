#!/bin/bash

echo "$@"
npx eslint --fix "$@"
