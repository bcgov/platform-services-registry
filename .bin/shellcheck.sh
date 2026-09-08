#!/usr/bin/env bash

for file in "$@"; do
    shellcheck "$file"
done
