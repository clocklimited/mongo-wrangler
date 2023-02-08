#!/usr/bin/env bash

DATE=$(date +%Y%m%d-%H%M%S)
export ADDON_ID=$(curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  --request POST \
  --data '{"name":"mongo-wrangler-'"$DATE"'","description":"Ad-hoc mongo-wrangler db","type":"mongodb","version":"4.2.21","billing":{"deploymentPlan":"nf-compute-100-4","storageClass":"ssd","storage":4096,"replicas":1}}' \
  https://api.northflank.com/v1/projects/northampton-saints/addons | jq -r '.data.id')

export OUTPUT=$(curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  https://api.northflank.com/v1/projects/northampton-saints/addons/$ADDON_ID/credentials | jq -r '.data.envs.MONGO_SRV_ADMIN' | sed s#/admin#/#)

echo $ADDON_ID
echo $OUTPUT
echo $NF_API_TOKEN

STATUS=preDeployment

while [[ $STATUS != 'running' ]]
do
  STATUS=$(
    curl --silent -G "https://api.northflank.com/v1/projects/northampton-saints/addons/$ADDON_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $NF_API_TOKEN" | jq -r '.data.status'
  )
  echo $STATUS
  sleep 5
done

node ./dump-nf.js

curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  --request DELETE \
  https://api.northflank.com/v1/projects/northampton-saints/addons/${ADDON_ID}
