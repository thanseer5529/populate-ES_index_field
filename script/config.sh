export ES_URL="http://127.0.0.1:9200"
export INDICES="*"
export MAPPING_TEMPLATE_PATH="/home/thanseer/WORK/populate-ES_index_fields/TEMPLATES"
export RESPONSE_PATH="/home/thanseer/WORK/populate-ES_index_fields/RES"
export TEMPLATE_SCHEMA_PATH="/home/thanseer/WORK/populate-ES_index_fields/TEMPLATES_SCHEMA"

rm -rf $RESPONSE_PATH
mkdir $RESPONSE_PATH
