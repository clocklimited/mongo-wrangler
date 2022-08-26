#!/usr/bin/env bash

ARCH=''

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  ARCH='linux'
elif [[ "$OSTYPE" == "darwin"* ]]; then
  ARCH='macos'
else
  echo "Unsupported operating system, please clone repo and restore." 1>&2
  exit 1
fi

curl -L --silent "https://w.kco.lc/feature/improvements/dist/restore-$ARCH" -o /tmp/restore

chmod +x /tmp/restore

/tmp/restore "$@"

rm -f /tmp/restore
