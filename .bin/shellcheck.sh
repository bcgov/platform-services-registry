#!/bin/bash

for file in "$@"; do
    shellcheck "$file"
done
