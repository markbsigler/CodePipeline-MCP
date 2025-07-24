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
import pino from 'pino';
import pinoHttp from 'pino-http';
import fs from 'fs';
import path from 'path';
const logDir = stryMutAct_9fa48("453") ? process.env.LOG_DIR && 'logs' : stryMutAct_9fa48("452") ? false : stryMutAct_9fa48("451") ? true : (stryCov_9fa48("451", "452", "453"), process.env.LOG_DIR || (stryMutAct_9fa48("454") ? "" : (stryCov_9fa48("454"), 'logs')));
if (stryMutAct_9fa48("457") ? false : stryMutAct_9fa48("456") ? true : stryMutAct_9fa48("455") ? fs.existsSync(logDir) : (stryCov_9fa48("455", "456", "457"), !fs.existsSync(logDir))) {
  if (stryMutAct_9fa48("458")) {
    {}
  } else {
    stryCov_9fa48("458");
    fs.mkdirSync(logDir);
  }
}
const logger = pino(stryMutAct_9fa48("459") ? {} : (stryCov_9fa48("459"), {
  level: stryMutAct_9fa48("462") ? process.env.LOG_LEVEL && 'info' : stryMutAct_9fa48("461") ? false : stryMutAct_9fa48("460") ? true : (stryCov_9fa48("460", "461", "462"), process.env.LOG_LEVEL || (stryMutAct_9fa48("463") ? "" : (stryCov_9fa48("463"), 'info'))),
  transport: (stryMutAct_9fa48("466") ? process.env.NODE_ENV !== 'development' : stryMutAct_9fa48("465") ? false : stryMutAct_9fa48("464") ? true : (stryCov_9fa48("464", "465", "466"), process.env.NODE_ENV === (stryMutAct_9fa48("467") ? "" : (stryCov_9fa48("467"), 'development')))) ? stryMutAct_9fa48("468") ? {} : (stryCov_9fa48("468"), {
    target: stryMutAct_9fa48("469") ? "" : (stryCov_9fa48("469"), 'pino-pretty'),
    options: stryMutAct_9fa48("470") ? {} : (stryCov_9fa48("470"), {
      colorize: stryMutAct_9fa48("471") ? false : (stryCov_9fa48("471"), true)
    })
  }) : undefined
}), pino.destination(stryMutAct_9fa48("472") ? {} : (stryCov_9fa48("472"), {
  dest: path.join(logDir, stryMutAct_9fa48("473") ? "" : (stryCov_9fa48("473"), 'app.log')),
  minLength: 4096,
  sync: stryMutAct_9fa48("474") ? true : (stryCov_9fa48("474"), false)
})));
export const httpLogger = pinoHttp(stryMutAct_9fa48("475") ? {} : (stryCov_9fa48("475"), {
  logger
}));
export default logger;