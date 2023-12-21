#!/bin/bash

echo "$@"
autopep8 "$@" --in-place
