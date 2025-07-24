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
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  if (stryMutAct_9fa48("205")) {
    {}
  } else {
    stryCov_9fa48("205");
    logger.error(stryMutAct_9fa48("206") ? {} : (stryCov_9fa48("206"), {
      err,
      url: req.originalUrl,
      method: req.method,
      user: stryMutAct_9fa48("209") ? (req as any).user?.sub && 'anon' : stryMutAct_9fa48("208") ? false : stryMutAct_9fa48("207") ? true : (stryCov_9fa48("207", "208", "209"), (stryMutAct_9fa48("210") ? (req as any).user.sub : (stryCov_9fa48("210"), (req as any).user?.sub)) || (stryMutAct_9fa48("211") ? "" : (stryCov_9fa48("211"), 'anon'))),
      sessionId: stryMutAct_9fa48("214") ? (req as any).sessionId && null : stryMutAct_9fa48("213") ? false : stryMutAct_9fa48("212") ? true : (stryCov_9fa48("212", "213", "214"), (req as any).sessionId || null),
      stack: err.stack
    }), stryMutAct_9fa48("215") ? "" : (stryCov_9fa48("215"), 'Error occurred'));
    if (stryMutAct_9fa48("217") ? false : stryMutAct_9fa48("216") ? true : (stryCov_9fa48("216", "217"), res.headersSent)) {
      if (stryMutAct_9fa48("218")) {
        {}
      } else {
        stryCov_9fa48("218");
        return next(err);
      }
    }
    res.setHeader(stryMutAct_9fa48("219") ? "" : (stryCov_9fa48("219"), 'Content-Type'), stryMutAct_9fa48("220") ? "" : (stryCov_9fa48("220"), 'application/json'));
    const status = stryMutAct_9fa48("223") ? err.status && 500 : stryMutAct_9fa48("222") ? false : stryMutAct_9fa48("221") ? true : (stryCov_9fa48("221", "222", "223"), err.status || 500);
    const isProd = stryMutAct_9fa48("226") ? process.env.NODE_ENV !== 'production' : stryMutAct_9fa48("225") ? false : stryMutAct_9fa48("224") ? true : (stryCov_9fa48("224", "225", "226"), process.env.NODE_ENV === (stryMutAct_9fa48("227") ? "" : (stryCov_9fa48("227"), 'production')));
    res.status(status).json(stryMutAct_9fa48("228") ? {} : (stryCov_9fa48("228"), {
      error: stryMutAct_9fa48("231") ? err.message && 'Internal Server Error' : stryMutAct_9fa48("230") ? false : stryMutAct_9fa48("229") ? true : (stryCov_9fa48("229", "230", "231"), err.message || (stryMutAct_9fa48("232") ? "" : (stryCov_9fa48("232"), 'Internal Server Error'))),
      code: stryMutAct_9fa48("235") ? err.code && 'ERR_INTERNAL' : stryMutAct_9fa48("234") ? false : stryMutAct_9fa48("233") ? true : (stryCov_9fa48("233", "234", "235"), err.code || (stryMutAct_9fa48("236") ? "" : (stryCov_9fa48("236"), 'ERR_INTERNAL'))),
      ...((stryMutAct_9fa48("239") ? err.details || !isProd : stryMutAct_9fa48("238") ? false : stryMutAct_9fa48("237") ? true : (stryCov_9fa48("237", "238", "239"), err.details && (stryMutAct_9fa48("240") ? isProd : (stryCov_9fa48("240"), !isProd)))) ? stryMutAct_9fa48("241") ? {} : (stryCov_9fa48("241"), {
        details: err.details
      }) : {}),
      ...(isProd ? {} : stryMutAct_9fa48("242") ? {} : (stryCov_9fa48("242"), {
        stack: err.stack
      }))
    }));
  }
}