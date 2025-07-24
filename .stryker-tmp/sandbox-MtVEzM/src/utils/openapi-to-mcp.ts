// @ts-nocheck
function stryNS_9fa48() {
  var g = typeof globalThis === 'object' && globalThis && globalThis.Math === Math && globalThis || new Function("return this")();
  var ns = g.__stryker__ || (g.__stryker__ = {});
  if (ns.activeMutant === undefined && g.process && g.process.env && g.process.env.__STRYKER_ACTIVE_MUTANT__) {
    ns.activeMutant = g.process.env.__STRYKER_ACTIVE_MUTANT__;
  }
  function retrieveNS() {
    return ns;
  }
  stryNS_9fa48 = retrieveNS;
  return retrieveNS();
}
stryNS_9fa48();
function stryCov_9fa48() {
  var ns = stryNS_9fa48();
  var cov = ns.mutantCoverage || (ns.mutantCoverage = {
    static: {},
    perTest: {}
  });
  function cover() {
    var c = cov.static;
    if (ns.currentTestId) {
      c = cov.perTest[ns.currentTestId] = cov.perTest[ns.currentTestId] || {};
    }
    var a = arguments;
    for (var i = 0; i < a.length; i++) {
      c[a[i]] = (c[a[i]] || 0) + 1;
    }
  }
  stryCov_9fa48 = cover;
  cover.apply(null, arguments);
}
function stryMutAct_9fa48(id) {
  var ns = stryNS_9fa48();
  function isActive(id) {
    if (ns.activeMutant === id) {
      if (ns.hitCount !== void 0 && ++ns.hitCount > ns.hitLimit) {
        throw new Error('Stryker: Hit count limit reached (' + ns.hitCount + ')');
      }
      return true;
    }
    return false;
  }
  stryMutAct_9fa48 = isActive;
  return isActive(id);
}
import fs from 'fs';
import path from 'path';
import { jsonSchemaToZod } from './jsonSchemaToZod';

/**
 * Loads and parses the OpenAPI JSON file.
 * @param openapiPath Path to the OpenAPI JSON file
 */
export function loadOpenApiSpec(openapiPath: string) {
  if (stryMutAct_9fa48("495")) {
    {}
  } else {
    stryCov_9fa48("495");
    const fullPath = path.resolve(openapiPath);
    const raw = fs.readFileSync(fullPath, stryMutAct_9fa48("496") ? "" : (stryCov_9fa48("496"), 'utf-8'));
    return JSON.parse(raw);
  }
}

/**
 * Converts a JSON Schema object to a TypeScript type definition string.
 * This is a basic implementation for demonstration; for production use, consider a library like json-schema-to-typescript.
 */
export function jsonSchemaToTypeScriptType(schema: any, typeName: string): string {
  if (stryMutAct_9fa48("497")) {
    {}
  } else {
    stryCov_9fa48("497");
    if (stryMutAct_9fa48("500") ? !schema && typeof schema !== 'object' : stryMutAct_9fa48("499") ? false : stryMutAct_9fa48("498") ? true : (stryCov_9fa48("498", "499", "500"), (stryMutAct_9fa48("501") ? schema : (stryCov_9fa48("501"), !schema)) || (stryMutAct_9fa48("503") ? typeof schema === 'object' : stryMutAct_9fa48("502") ? false : (stryCov_9fa48("502", "503"), typeof schema !== (stryMutAct_9fa48("504") ? "" : (stryCov_9fa48("504"), 'object')))))) return stryMutAct_9fa48("505") ? `` : (stryCov_9fa48("505"), `type ${typeName} = any;`);
    if (stryMutAct_9fa48("508") ? schema.type === 'object' || schema.properties : stryMutAct_9fa48("507") ? false : stryMutAct_9fa48("506") ? true : (stryCov_9fa48("506", "507", "508"), (stryMutAct_9fa48("510") ? schema.type !== 'object' : stryMutAct_9fa48("509") ? true : (stryCov_9fa48("509", "510"), schema.type === (stryMutAct_9fa48("511") ? "" : (stryCov_9fa48("511"), 'object')))) && schema.properties)) {
      if (stryMutAct_9fa48("512")) {
        {}
      } else {
        stryCov_9fa48("512");
        const props = Object.entries(schema.properties).map(([key, val]: [string, any]) => {
          if (stryMutAct_9fa48("513")) {
            {}
          } else {
            stryCov_9fa48("513");
            const optional = (stryMutAct_9fa48("516") ? schema.required || !schema.required.includes(key) : stryMutAct_9fa48("515") ? false : stryMutAct_9fa48("514") ? true : (stryCov_9fa48("514", "515", "516"), schema.required && (stryMutAct_9fa48("517") ? schema.required.includes(key) : (stryCov_9fa48("517"), !schema.required.includes(key))))) ? stryMutAct_9fa48("518") ? "" : (stryCov_9fa48("518"), '?') : stryMutAct_9fa48("519") ? "Stryker was here!" : (stryCov_9fa48("519"), '');
            return stryMutAct_9fa48("520") ? `` : (stryCov_9fa48("520"), `  ${key}${optional}: ${jsonSchemaTypeToTs(val)};`);
          }
        }).join(stryMutAct_9fa48("521") ? "" : (stryCov_9fa48("521"), '\n'));
        return stryMutAct_9fa48("522") ? `` : (stryCov_9fa48("522"), `export interface ${typeName} {\n${props}\n}`);
      }
    }
    if (stryMutAct_9fa48("525") ? schema.type !== 'array' : stryMutAct_9fa48("524") ? false : stryMutAct_9fa48("523") ? true : (stryCov_9fa48("523", "524", "525"), schema.type === (stryMutAct_9fa48("526") ? "" : (stryCov_9fa48("526"), 'array')))) {
      if (stryMutAct_9fa48("527")) {
        {}
      } else {
        stryCov_9fa48("527");
        return stryMutAct_9fa48("528") ? `` : (stryCov_9fa48("528"), `type ${typeName} = ${jsonSchemaTypeToTs(schema.items)}[];`);
      }
    }
    return stryMutAct_9fa48("529") ? `` : (stryCov_9fa48("529"), `type ${typeName} = any;`);
  }
}
export function jsonSchemaTypeToTs(schema: any): string {
  if (stryMutAct_9fa48("530")) {
    {}
  } else {
    stryCov_9fa48("530");
    if (stryMutAct_9fa48("533") ? false : stryMutAct_9fa48("532") ? true : stryMutAct_9fa48("531") ? schema : (stryCov_9fa48("531", "532", "533"), !schema)) return stryMutAct_9fa48("534") ? "" : (stryCov_9fa48("534"), 'any');
    if (stryMutAct_9fa48("537") ? schema.type !== 'string' : stryMutAct_9fa48("536") ? false : stryMutAct_9fa48("535") ? true : (stryCov_9fa48("535", "536", "537"), schema.type === (stryMutAct_9fa48("538") ? "" : (stryCov_9fa48("538"), 'string')))) return stryMutAct_9fa48("539") ? "" : (stryCov_9fa48("539"), 'string');
    if (stryMutAct_9fa48("542") ? schema.type === 'number' && schema.type === 'integer' : stryMutAct_9fa48("541") ? false : stryMutAct_9fa48("540") ? true : (stryCov_9fa48("540", "541", "542"), (stryMutAct_9fa48("544") ? schema.type !== 'number' : stryMutAct_9fa48("543") ? false : (stryCov_9fa48("543", "544"), schema.type === (stryMutAct_9fa48("545") ? "" : (stryCov_9fa48("545"), 'number')))) || (stryMutAct_9fa48("547") ? schema.type !== 'integer' : stryMutAct_9fa48("546") ? false : (stryCov_9fa48("546", "547"), schema.type === (stryMutAct_9fa48("548") ? "" : (stryCov_9fa48("548"), 'integer')))))) return stryMutAct_9fa48("549") ? "" : (stryCov_9fa48("549"), 'number');
    if (stryMutAct_9fa48("552") ? schema.type !== 'boolean' : stryMutAct_9fa48("551") ? false : stryMutAct_9fa48("550") ? true : (stryCov_9fa48("550", "551", "552"), schema.type === (stryMutAct_9fa48("553") ? "" : (stryCov_9fa48("553"), 'boolean')))) return stryMutAct_9fa48("554") ? "" : (stryCov_9fa48("554"), 'boolean');
    if (stryMutAct_9fa48("557") ? schema.type !== 'array' : stryMutAct_9fa48("556") ? false : stryMutAct_9fa48("555") ? true : (stryCov_9fa48("555", "556", "557"), schema.type === (stryMutAct_9fa48("558") ? "" : (stryCov_9fa48("558"), 'array')))) return stryMutAct_9fa48("559") ? `` : (stryCov_9fa48("559"), `${jsonSchemaTypeToTs(schema.items)}[]`);
    if (stryMutAct_9fa48("562") ? schema.type === 'object' || schema.properties : stryMutAct_9fa48("561") ? false : stryMutAct_9fa48("560") ? true : (stryCov_9fa48("560", "561", "562"), (stryMutAct_9fa48("564") ? schema.type !== 'object' : stryMutAct_9fa48("563") ? true : (stryCov_9fa48("563", "564"), schema.type === (stryMutAct_9fa48("565") ? "" : (stryCov_9fa48("565"), 'object')))) && schema.properties)) {
      if (stryMutAct_9fa48("566")) {
        {}
      } else {
        stryCov_9fa48("566");
        return stryMutAct_9fa48("567") ? `` : (stryCov_9fa48("567"), `{ ${Object.entries(schema.properties).map(stryMutAct_9fa48("568") ? () => undefined : (stryCov_9fa48("568"), ([k, v]: [string, any]) => stryMutAct_9fa48("569") ? `` : (stryCov_9fa48("569"), `${k}: ${jsonSchemaTypeToTs(v)}`))).join(stryMutAct_9fa48("570") ? "" : (stryCov_9fa48("570"), '; '))} }`);
      }
    }
    return stryMutAct_9fa48("571") ? "" : (stryCov_9fa48("571"), 'any');
  }
}

/**
 * Extracts MCP tool definitions from OpenAPI spec.
 * Each tool includes name, inputSchema, outputSchema, description, and zod schemas.
 */
function buildInputSchema(op: any) {
  if (stryMutAct_9fa48("572")) {
    {}
  } else {
    stryCov_9fa48("572");
    const inputSchema: {
      type: string;
      properties: Record<string, any>;
      required: string[];
    } = stryMutAct_9fa48("573") ? {} : (stryCov_9fa48("573"), {
      type: stryMutAct_9fa48("574") ? "" : (stryCov_9fa48("574"), 'object'),
      properties: {},
      required: stryMutAct_9fa48("575") ? ["Stryker was here"] : (stryCov_9fa48("575"), [])
    });
    if (stryMutAct_9fa48("577") ? false : stryMutAct_9fa48("576") ? true : (stryCov_9fa48("576", "577"), Array.isArray(op.parameters))) {
      if (stryMutAct_9fa48("578")) {
        {}
      } else {
        stryCov_9fa48("578");
        for (const param of op.parameters) {
          if (stryMutAct_9fa48("579")) {
            {}
          } else {
            stryCov_9fa48("579");
            inputSchema.properties[param.name] = stryMutAct_9fa48("582") ? param.schema && {
              type: 'string'
            } : stryMutAct_9fa48("581") ? false : stryMutAct_9fa48("580") ? true : (stryCov_9fa48("580", "581", "582"), param.schema || (stryMutAct_9fa48("583") ? {} : (stryCov_9fa48("583"), {
              type: stryMutAct_9fa48("584") ? "" : (stryCov_9fa48("584"), 'string')
            })));
            if (stryMutAct_9fa48("586") ? false : stryMutAct_9fa48("585") ? true : (stryCov_9fa48("585", "586"), param.required)) inputSchema.required.push(param.name);
          }
        }
      }
    }
    if (stryMutAct_9fa48("589") ? op.requestBody && op.requestBody.content || op.requestBody.content['application/json'] : stryMutAct_9fa48("588") ? false : stryMutAct_9fa48("587") ? true : (stryCov_9fa48("587", "588", "589"), (stryMutAct_9fa48("591") ? op.requestBody || op.requestBody.content : stryMutAct_9fa48("590") ? true : (stryCov_9fa48("590", "591"), op.requestBody && op.requestBody.content)) && op.requestBody.content[stryMutAct_9fa48("592") ? "" : (stryCov_9fa48("592"), 'application/json')])) {
      if (stryMutAct_9fa48("593")) {
        {}
      } else {
        stryCov_9fa48("593");
        const bodySchema = op.requestBody.content[stryMutAct_9fa48("594") ? "" : (stryCov_9fa48("594"), 'application/json')].schema;
        inputSchema.properties[stryMutAct_9fa48("595") ? "" : (stryCov_9fa48("595"), 'body')] = bodySchema;
        inputSchema.required.push(stryMutAct_9fa48("596") ? "" : (stryCov_9fa48("596"), 'body'));
      }
    }
    return inputSchema;
  }
}
function buildOutputSchema(op: any) {
  if (stryMutAct_9fa48("597")) {
    {}
  } else {
    stryCov_9fa48("597");
    let outputSchema = {};
    if (stryMutAct_9fa48("600") ? op.responses || op.responses['200'] || op.responses['201'] : stryMutAct_9fa48("599") ? false : stryMutAct_9fa48("598") ? true : (stryCov_9fa48("598", "599", "600"), op.responses && (stryMutAct_9fa48("602") ? op.responses['200'] && op.responses['201'] : stryMutAct_9fa48("601") ? true : (stryCov_9fa48("601", "602"), op.responses[stryMutAct_9fa48("603") ? "" : (stryCov_9fa48("603"), '200')] || op.responses[stryMutAct_9fa48("604") ? "" : (stryCov_9fa48("604"), '201')])))) {
      if (stryMutAct_9fa48("605")) {
        {}
      } else {
        stryCov_9fa48("605");
        const resp = stryMutAct_9fa48("608") ? op.responses['200'] && op.responses['201'] : stryMutAct_9fa48("607") ? false : stryMutAct_9fa48("606") ? true : (stryCov_9fa48("606", "607", "608"), op.responses[stryMutAct_9fa48("609") ? "" : (stryCov_9fa48("609"), '200')] || op.responses[stryMutAct_9fa48("610") ? "" : (stryCov_9fa48("610"), '201')]);
        if (stryMutAct_9fa48("613") ? resp.content || resp.content['application/json'] : stryMutAct_9fa48("612") ? false : stryMutAct_9fa48("611") ? true : (stryCov_9fa48("611", "612", "613"), resp.content && resp.content[stryMutAct_9fa48("614") ? "" : (stryCov_9fa48("614"), 'application/json')])) {
          if (stryMutAct_9fa48("615")) {
            {}
          } else {
            stryCov_9fa48("615");
            outputSchema = resp.content[stryMutAct_9fa48("616") ? "" : (stryCov_9fa48("616"), 'application/json')].schema;
          }
        }
      }
    }
    return outputSchema;
  }
}
export function extractMcpToolsFromOpenApi(openapi: any) {
  if (stryMutAct_9fa48("617")) {
    {}
  } else {
    stryCov_9fa48("617");
    const tools = stryMutAct_9fa48("618") ? ["Stryker was here"] : (stryCov_9fa48("618"), []);
    for (const [pathKey, pathItemRaw] of Object.entries(openapi.paths)) {
      if (stryMutAct_9fa48("619")) {
        {}
      } else {
        stryCov_9fa48("619");
        const pathItem = pathItemRaw as Record<string, any>;
        for (const method of Object.keys(pathItem)) {
          if (stryMutAct_9fa48("620")) {
            {}
          } else {
            stryCov_9fa48("620");
            const op = pathItem[method];
            const name = stryMutAct_9fa48("623") ? op.operationId && `${method}_${pathKey.replace(/[/{}/]/g, '_')}` : stryMutAct_9fa48("622") ? false : stryMutAct_9fa48("621") ? true : (stryCov_9fa48("621", "622", "623"), op.operationId || (stryMutAct_9fa48("624") ? `` : (stryCov_9fa48("624"), `${method}_${pathKey.replace(stryMutAct_9fa48("625") ? /[^/{}/]/g : (stryCov_9fa48("625"), /[/{}/]/g), stryMutAct_9fa48("626") ? "" : (stryCov_9fa48("626"), '_'))}`)));
            const description = stryMutAct_9fa48("629") ? (op.description || op.summary) && '' : stryMutAct_9fa48("628") ? false : stryMutAct_9fa48("627") ? true : (stryCov_9fa48("627", "628", "629"), (stryMutAct_9fa48("631") ? op.description && op.summary : stryMutAct_9fa48("630") ? false : (stryCov_9fa48("630", "631"), op.description || op.summary)) || (stryMutAct_9fa48("632") ? "Stryker was here!" : (stryCov_9fa48("632"), '')));
            const inputSchema = buildInputSchema(op);
            const outputSchema = buildOutputSchema(op);
            const inputType = jsonSchemaToTypeScriptType(inputSchema, stryMutAct_9fa48("633") ? `` : (stryCov_9fa48("633"), `${name}Input`));
            const outputType = jsonSchemaToTypeScriptType(outputSchema, stryMutAct_9fa48("634") ? `` : (stryCov_9fa48("634"), `${name}Output`));
            const inputZod = jsonSchemaToZod(inputSchema);
            const outputZod = jsonSchemaToZod(outputSchema);
            tools.push(stryMutAct_9fa48("635") ? {} : (stryCov_9fa48("635"), {
              name,
              description,
              inputSchema,
              outputSchema,
              inputType,
              outputType,
              inputZod,
              outputZod
            }));
          }
        }
      }
    }
    return tools;
  }
}