#!/bin/bash

echo "hit entrypoint..."

src=/opt/app
dest=/opt/devserver

cp -r "$src"/* "$dest"/
rm "$dest/dev-proxy.zip"
ls -al "$dest"

"$dest/devproxy"
