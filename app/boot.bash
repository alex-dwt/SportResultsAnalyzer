#!/bin/bash

set -ex

[ ! -d 'node_modules' ] && npm install
# service tor start &
polipo socksParentProxy=$(ip route show 0.0.0.0/0 | awk '{ print $3 }'):9050 &
npm start