#!/usr/bin/env bash

VARIABLES=(
  "NF_API_TOKEN"
  "PROJECT_NAME"
  "INPUT"
  "INPUT_DB_NAME"
  "OUTPUT_DB_NAME"
  "NF_OBJECT_ID"
)

for VARIABLE_NAME in "${VARIABLES[@]}"; do
  if [ -z "${!VARIABLE_NAME}" ]; then
    echo "Missing required variable: '$VARIABLE_NAME'"
    exit 1
  fi
done

DATE=$(date +%Y%m%d-%H%M%S)
ENVIRONMENT=${NF_OBJECT_ID#mongo-wrangler-}

DATABASE_ADDON=$(
  curl --silent \
    --header "Authorization: Bearer $NF_API_TOKEN" \
    --request GET \
    "https://api.northflank.com/v1/projects/$PROJECT_NAME/addons/$ENVIRONMENT-database"
)
DATABASE_MONGO_VERSION=$(jq -r '.data.spec.config.versionTag' <<<"$DATABASE_ADDON")

if [ -z "$DATABASE_MONGO_VERSION" ] || [ "$DATABASE_MONGO_VERSION" == "null" ]; then
  echo "Could not determine addon MongoDB version - check NF_API_TOKEN access"
  exit 1
fi

export ADDON_ID=$(curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  --request POST \
  --data '{"name":"mongo-wrangler-'"$DATE"'","description":"Ad-hoc mongo-wrangler db","type":"mongodb","version":"4.2.21","billing":{"deploymentPlan":"nf-compute-100-4","storageClass":"ssd","storage":4096,"replicas":1}}' \
  "https://api.northflank.com/v1/projects/$PROJECT_NAME/addons" | jq -r '.data.id')

export OUTPUT=$(curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  "https://api.northflank.com/v1/projects/$PROJECT_NAME/addons/$ADDON_ID/credentials" | jq -r '.data.envs.MONGO_SRV_ADMIN' | sed s#/admin#/#)

STATUS=preDeployment

while [[ $STATUS != 'running' ]]; do
  STATUS=$(
    curl --silent -G "https://api.northflank.com/v1/projects/$PROJECT_NAME/addons/$ADDON_ID" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $NF_API_TOKEN" | jq -r '.data.status'
  )
  echo "$STATUS"
  sleep 5
done

node ./dump-nf.js

curl --header "Content-Type: application/json" \
  --header "Authorization: Bearer $NF_API_TOKEN" \
  --request DELETE \
  "https://api.northflank.com/v1/projects/$PROJECT_NAME/addons/${ADDON_ID}"
