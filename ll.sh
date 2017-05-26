ATLAS_USERNAME="<enter your Atlas user>"
ATLAS_PASSWORD="<enter your Atlas password>"
ATLAS_CLUSTER_NAME="<enter your Atlas cluster name>"
ATLAS_CLUSTER_SUFFIX="<enter your Atlas suffix>"
DATABASE_NAME="fbchats"

ATLAS_URI="\"mongodb://$ATLAS_USERNAME:$ATLAS_PASSWORD@$ATLAS_CLUSTER_NAME-shard-00-00-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017,$ATLAS_CLUSTER_NAME-shard-00-01-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017,$ATLAS_CLUSTER_NAME-shard-00-02-$ATLAS_CLUSTER_SUFFIX.mongodb.net:27017/$DATABASE_NAME?ssl=true&replicaSet=$ATLAS_CLUSTER_NAME-shard-0&authSource=admin\""
echo $ATLAS_URI

PAGE_TOKEN=\"<enter your Facebook page token>\"

lambda-local -l index.js -e event.json -E {\"MONGODB_ATLAS_CLUSTER_URI\":$ATLAS_URI\,\"PAGE_TOKEN\":$PAGE_TOKEN}