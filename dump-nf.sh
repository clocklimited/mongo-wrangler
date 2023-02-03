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

ADDON_ID=$(curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  --request POST \
  --data '{"name":"mongo-wrangler-staging","description":"Ad-hoc mongo-wrangler db","type":"mongodb","version":"4.2.21","billing":{"deploymentPlan":"nf-compute-100-4","storageClass":"ssd","storage":4096,"replicas":1}}' \
  https://api.northflank.com/v1/projects/northampton-saints/addons | jq -r '.data.id')

OUTPUT=$(curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  https://api.northflank.com/v1/projects/northampton-saints/addons/$ADDON_ID/credentials | jq -r '.data.envs.MONGO_SRV_ADMIN' | sed s#/admin#/#)

"./dist/dump-nf-$ARCH" "$@"
