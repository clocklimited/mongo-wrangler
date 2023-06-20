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
WRANGLER_ADDON_NAME="mongo-wrangler-$DATE"
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
else
  echo "Valid NF_API_TOKEN provided"
fi

echo "Creating temporary addon '$WRANGLER_ADDON_NAME' with version '$DATABASE_MONGO_VERSION'"

WRANGLER_ADDON=$(
  curl --silent \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer $NF_API_TOKEN" \
    --request POST \
    --data '{"name":"'"$WRANGLER_ADDON_NAME"'","description":"Ad-hoc mongo-wrangler db","type":"mongodb","version":"'"$DATABASE_MONGO_VERSION"'","billing":{"deploymentPlan":"nf-compute-100-4","storageClass":"ssd","storage":4096,"replicas":1}}' \
    "https://api.northflank.com/v1/projects/$PROJECT_NAME/addons"
)

ADDON_ID=$(jq -r '.data.id' <<<"$WRANGLER_ADDON")
export ADDON_ID
STATUS=$(jq -r '.data.status' <<<"$WRANGLER_ADDON")

if [ -z "$ADDON_ID" ] || [ "$ADDON_ID" == "null" ]; then
  echo "Could not create wrangler addon - check NF_API_TOKEN access"
  exit 1
else
  echo "Temporary addon created successfully, status: '$STATUS'"
fi

WRANGLER_ADDON_CREDENTIALS=$(
  curl --silent \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer $NF_API_TOKEN" \
    "https://api.northflank.com/v1/projects/$PROJECT_NAME/addons/$ADDON_ID/credentials"
)
OUTPUT=$(jq -r '.data.envs.MONGO_SRV_ADMIN' <<<"$WRANGLER_ADDON_CREDENTIALS" | sed s\#/admin\#/\#)
export OUTPUT

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
