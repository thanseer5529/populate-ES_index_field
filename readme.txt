1.configure the start script.

ES_URL => absolute url of elastic search
          eg:-"http://127.0.0.1:9200"



INDICES => provide each index of wanted ES_MAPPING_TEMPLATE seperated by a ",".
          eg:- "windows_logs,process_mon"



MAPPING_TEMPLATE_PATH => provide the directory path where you store the JSON_MAPPER_TEMPLATE.
                         #. json_mapper_template should be provided as a file. file name should be like "<index_name>.json" and data should be in json format.(note:- we have to use index_name not alias or anything)
                         #. using this to get the raw_dsq fields from the given json_mapper_template and to get the Additional Fields In ES_MAPPING_TEMPLATE Which Is Not Mentioned In Given JSON_MAPPER_TEMPLATE, will be provided as a file "<index_name>__dsqFieldsANDrawFieldsFromJSON_MAPPER_TEMPLATE" and "<index_name>_additionalFieldsInES_MAPPER_TEMPLATE"
                         #. not mandatory to have this config,if you do not want the above mentioned service   


TEMPLATE_SCHEMA_PATH => provide the directory path where you store the dsq and raw fields as individual files
                        #. this is to generate JSON_MAPPER_TEMPLATE from dsq_raw schema files.
                        #. raw and dsq fields should be provided as individual files. raw and dsq fields file should be names as "<index_name>_raw" and "<index_name>_dsq" respectively
                        #. you will get the JSON_MAPPER_TEMPLATE file as "<index_name>_JSON_MAPPER_TEMPLATE.json" 
                        #. not mandatory to have this config,if you do not want the above mentioned service 


RESPONSE_PATH => this is the place where you going to get the results as files
                 #. dsq-raw field from given JSON_MAPPER_TEMPLATE
                 #. ES_MAPPING_TEMPLATE Of Given Indices
                 #. Additional Fields In ES_MAPPING_TEMPLATE Which Is Not Mentioned In Given JSON_MAPPER_TEMPLATE
                 #. simple JSON_MAPPER_TEMPLATE From Given raw And dsq Fields



2. run the provided byte code after executing the config script.