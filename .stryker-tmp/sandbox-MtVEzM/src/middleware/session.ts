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
import { v4 as uuidv4 } from 'uuid';
export function sessionMiddleware(req: Request, res: Response, next: NextFunction) {
  if (stryMutAct_9fa48("306")) {
    {}
  } else {
    stryCov_9fa48("306");
    let sessionId = req.headers['x-session-id'] as string | undefined;
    if (stryMutAct_9fa48("309") ? false : stryMutAct_9fa48("308") ? true : stryMutAct_9fa48("307") ? sessionId : (stryCov_9fa48("307", "308", "309"), !sessionId)) {
      if (stryMutAct_9fa48("310")) {
        {}
      } else {
        stryCov_9fa48("310");
        // Generate a secure, non-deterministic session ID
        const userId = stryMutAct_9fa48("313") ? (req as any).user?.sub && 'anon' : stryMutAct_9fa48("312") ? false : stryMutAct_9fa48("311") ? true : (stryCov_9fa48("311", "312", "313"), (stryMutAct_9fa48("314") ? (req as any).user.sub : (stryCov_9fa48("314"), (req as any).user?.sub)) || (stryMutAct_9fa48("315") ? "" : (stryCov_9fa48("315"), 'anon')));
        sessionId = stryMutAct_9fa48("316") ? `` : (stryCov_9fa48("316"), `${userId}:${uuidv4()}`);
        res.setHeader(stryMutAct_9fa48("317") ? "" : (stryCov_9fa48("317"), 'x-session-id'), sessionId);
      }
    }
    (req as any).sessionId = sessionId;
    next();
  }
}