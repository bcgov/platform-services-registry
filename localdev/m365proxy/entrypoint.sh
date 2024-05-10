#!/bin/bash

echo "hit entrypoint..."

src=/opt/app
dest=/opt/devserver
ls -al "$src"
cp -r "$src"/* "$dest"/
ls -al "$dest"

"$dest/devproxy" --ip-address 0.0.0.0 --failure-rate 0
