#!/usr/bin/env bash

ARCH=''

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  ARCH='linux'
elif [[ "$OSTYPE" == "darwin"* ]]; then
  ARCH='macos'
else
  echo "Unsupported operating system, please clone repo and dump." 1>&2
  exit 1
fi

curl -L --silent "https://w.kco.lc/feature/improvements/dist/dump-$ARCH" -o /tmp/dump

chmod +x /tmp/dump

/tmp/dump "$@"

rm -f /tmp/dump
