#!/bin/bash

# See https://docs.kubelinter.io/#/configuring-kubelinter
kube-linter lint helm --config .kube-linter.yaml -v
