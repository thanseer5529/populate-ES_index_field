const {
  ES_URL,
  INDICES,
  MAPPING_TEMPLATE_PATH,
  RESPONSE_PATH,
  TEMPLATE_SCHEMA_PATH,
} = process.env;
const { Client } = require("@elastic/elasticsearch");
const fs = require("fs");
const client = new Client({
  node: ES_URL,
  node: {
    url: new URL(ES_URL),
  },
  requestTimeout: 900000,
  ssl: {
    rejectUnauthorized: false,
  },
});
function generateDSQtemplate(index_name) {
  let raw = fs
    .readFileSync(`${TEMPLATE_SCHEMA_PATH}/${index_name}_raw`)
    .toString();
  let dsq = fs
    .readFileSync(`${TEMPLATE_SCHEMA_PATH}/${index_name}_dsq`)
    .toString();
  if (raw.length > 0 && dsq.length > 0) {
    raw = raw.split("\n");
    dsq = dsq.split("\n");
    const DSQ = {};
    for (i in raw) {
      if (DSQ[dsq[i]]) {
        let path = DSQ[dsq[i]].path;
        if (typeof path === "object") path.push(raw[i]);
        else if (typeof path === "string") path = [path, raw[i]];
        DSQ[dsq[i]] = {
          path: path,
          omitValues: "['', undefined, 'ERROR', null]",
        };
      } else {
        DSQ[dsq[i]] = {
          path: raw[i],
          omitValues: "['', undefined, 'ERROR', null]",
        };
      }
    }
    fs.writeFileSync(
      `${RESPONSE_PATH}/${index_name}_JSON_MAPPER_TEMPLATE.json`,
      JSON.stringify(DSQ, null, 2)
    );
  }
}
function populateDsqandRawfieldsANDadditionalFieldsFromTemplate(
  Template,
  INDEX_FIELDS,
  index_name
) {
  let DATA = `${"DSQ".padEnd(50, " ")}\t\t\t\tRAW\n\n`;
  for (i in Template) {
    path = Template[i].path;
    if (typeof path === "string") {
      DATA = `${DATA}${i.padEnd(50, " ")}\t\t\t\t${path}\n`;
      const index = INDEX_FIELDS.indexOf(i);
      if (index > -1) {
        INDEX_FIELDS.splice(index, 1);
      }
    } else {
      path.forEach((item) => {
        DATA = `${DATA}${i.padEnd(50, " ")}\t\t\t\t${item}\n`;
        const index = INDEX_FIELDS.indexOf(item);
        if (index > -1) {
          INDEX_FIELDS.splice(index, 1);
        }
      });
    }
  }

  fs.writeFileSync(
    `${RESPONSE_PATH}/${index_name}_dsqFieldsANDrawFieldsFromJSON_MAPPER_TEMPLATE`,
    DATA
  );
  fs.writeFileSync(
    `${RESPONSE_PATH}/${index_name}_additionalFieldsInES_MAPPER_TEMPLATE`,
    INDEX_FIELDS.join("\n")
  );
}

function populate_fields(mapping, prefix) {
  const INDEX_FIELDS = [];
  let DATA = ``;

  for (const i in mapping) {
    if (mapping[i].properties) {
      const subDATA = populate_fields(mapping[i].properties, `${prefix ? `${prefix}.${i}` : i}`);
      DATA = `${DATA}${subDATA.DATA}`;
      INDEX_FIELDS.push(subDATA.INDEX_FIELDS);
    } else {
      INDEX_FIELDS.push(`${prefix ? `${prefix}.${i}` : i}`);
      DATA = `${DATA}${
        prefix ? `${`${prefix}.${i}`.padEnd(50, " ")}` : `${i.padEnd(50, " ")}`
      }\t\t\t\t${mapping[i].type}\n`;
    }
  }
  return { DATA, INDEX_FIELDS };
}
function fetchMapiing(item) {
  try {
    const Template = fs
      .readFileSync(`${MAPPING_TEMPLATE_PATH}/${item}.json`)
      .toString();
    try {
      return JSON.parse(Template);
    } catch {
      console.log(`Invalid Mapping Found For ${item}`);
      return null;
    }
  } catch (err) {
    console.log(`NO Mapping Template Found For ${item}\t\n\n`, err.message);
    return null;
  }
}
(async () => {
  //   try {
  process.stdin.setEncoding("utf-8");
  let choice;
  console.log(
    `1.\t DSQ RAW Fields From Given DSQTemplates,ES MappingTemplate Of Given Indices And AdditionalFields In ES MappingTemplate`
  );
  console.log(`2.\t Geneate Simple DSQTemplates From Schema`);
  console.log(`3.\t Both`);
  console.log("\n\n Enter Your Choice...\n\t");
  process.stdin.on("data", async function (data) {
    choice = data.trim();
    // if (choice === "1") {
    // } else if (data.trim() === "2") {
    // } else if (data.trim() === "3") {
    // } else console.log("Invalid Input");
    if (choice === "1" || choice === "3") {
      const { body } = await client.indices.getMapping({ index: INDICES });
      for (let item in body) {
        if(!item.startsWith("."))
        {
          const index = item.lastIndexOf("-");
          let ITEM = item;
          if (index > -1) {
            ITEM = item.slice(0, index);
          }
          let Template = null;
          if (MAPPING_TEMPLATE_PATH) Template = await fetchMapiing(ITEM);
          const { DATA, INDEX_FIELDS } = populate_fields(
            body[item]?.mappings?.properties
          );
          fs.writeFileSync(`${RESPONSE_PATH}/${ITEM}.mappings`, DATA);
          if (Template) {
            populateDsqandRawfieldsANDadditionalFieldsFromTemplate(
              Template,
              INDEX_FIELDS.flat(Infinity),
              ITEM
            );
          }
        }
      }
    }
    if (choice === "2" || (choice === "3" && TEMPLATE_SCHEMA_PATH)) {
      const files = fs.readdirSync(`${TEMPLATE_SCHEMA_PATH}`);
      for (i of files) {
        if (i.endsWith("_dsq") && files.includes(i.replace("_dsq", "_raw"))) {
          const index_name = i.slice(0, i.indexOf("_dsq"));
          generateDSQtemplate(index_name);
          files.splice(files.indexOf(`${index_name}_dsq`), 1);
          files.splice(files.indexOf(`${index_name}_raw`), 1);
        } else if (
          i.endsWith("_raw") &&
          files.includes(i.replace("_raw", "_dsq"))
        ) {
          const index_name = i.slice(0, i.indexOf("_raw"));
          generateDSQtemplate(index_name);
          files.splice(files.indexOf(`${index_name}_raw`), 1);
          files.splice(files.indexOf(`${index_name}_dsq`), 1);
        }
      }
    }

    // process.exit();
  });
})();
