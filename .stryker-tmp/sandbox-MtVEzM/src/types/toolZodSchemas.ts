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
import { loadOpenApiSpec, extractMcpToolsFromOpenApi } from '../utils/openapi-to-mcp';
import path from 'path';

// This script generates and exports all Zod schemas for tool input/output
const openapiPath = path.resolve(__dirname, stryMutAct_9fa48("326") ? "" : (stryCov_9fa48("326"), '../../config/openapi.json'));
const openapi = loadOpenApiSpec(openapiPath);
const mcpTools = extractMcpToolsFromOpenApi(openapi);

// Export all schemas for use in validation middleware
export const toolZodSchemas = mcpTools.reduce((acc, tool) => {
  if (stryMutAct_9fa48("327")) {
    {}
  } else {
    stryCov_9fa48("327");
    acc[tool.name] = stryMutAct_9fa48("328") ? {} : (stryCov_9fa48("328"), {
      input: tool.inputZod,
      output: tool.outputZod
    });
    return acc;
  }
}, {} as Record<string, {
  input: any;
  output: any;
}>);