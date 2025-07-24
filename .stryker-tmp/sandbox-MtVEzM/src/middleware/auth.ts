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
import jwt from 'jsonwebtoken';
const JWT_SECRET = stryMutAct_9fa48("178") ? process.env.JWT_SECRET && 'changeme' : (stryCov_9fa48("178"), process.env.JWT_SECRET ?? (stryMutAct_9fa48("179") ? "" : (stryCov_9fa48("179"), 'changeme')));
const JWT_ISSUER = stryMutAct_9fa48("180") ? process.env.JWT_ISSUER && 'codepipeline-mcp-server' : (stryCov_9fa48("180"), process.env.JWT_ISSUER ?? (stryMutAct_9fa48("181") ? "" : (stryCov_9fa48("181"), 'codepipeline-mcp-server')));
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  if (stryMutAct_9fa48("182")) {
    {}
  } else {
    stryCov_9fa48("182");
    const authHeader = req.headers[stryMutAct_9fa48("183") ? "" : (stryCov_9fa48("183"), 'authorization')];
    if (stryMutAct_9fa48("186") ? false : stryMutAct_9fa48("185") ? true : stryMutAct_9fa48("184") ? authHeader?.startsWith('Bearer ') : (stryCov_9fa48("184", "185", "186"), !(stryMutAct_9fa48("188") ? authHeader.startsWith('Bearer ') : stryMutAct_9fa48("187") ? authHeader?.endsWith('Bearer ') : (stryCov_9fa48("187", "188"), authHeader?.startsWith(stryMutAct_9fa48("189") ? "" : (stryCov_9fa48("189"), 'Bearer ')))))) {
      if (stryMutAct_9fa48("190")) {
        {}
      } else {
        stryCov_9fa48("190");
        return res.status(401).json(stryMutAct_9fa48("191") ? {} : (stryCov_9fa48("191"), {
          error: stryMutAct_9fa48("192") ? "" : (stryCov_9fa48("192"), 'Missing or invalid Authorization header')
        }));
      }
    }
    const token = stryMutAct_9fa48("193") ? authHeader : (stryCov_9fa48("193"), authHeader.substring(7));
    try {
      if (stryMutAct_9fa48("194")) {
        {}
      } else {
        stryCov_9fa48("194");
        const payload = jwt.verify(token, JWT_SECRET, stryMutAct_9fa48("195") ? {} : (stryCov_9fa48("195"), {
          issuer: JWT_ISSUER
        }));
        req.user = payload;
        next();
      }
    } catch (err) {
      if (stryMutAct_9fa48("196")) {
        {}
      } else {
        stryCov_9fa48("196");
        if (stryMutAct_9fa48("199") ? process.env.NODE_ENV === 'test' : stryMutAct_9fa48("198") ? false : stryMutAct_9fa48("197") ? true : (stryCov_9fa48("197", "198", "199"), process.env.NODE_ENV !== (stryMutAct_9fa48("200") ? "" : (stryCov_9fa48("200"), 'test')))) {
          if (stryMutAct_9fa48("201")) {
            {}
          } else {
            stryCov_9fa48("201");
            console.error(stryMutAct_9fa48("202") ? "" : (stryCov_9fa48("202"), 'JWT authentication error:'), err);
          }
        }
        return res.status(401).json(stryMutAct_9fa48("203") ? {} : (stryCov_9fa48("203"), {
          error: stryMutAct_9fa48("204") ? "" : (stryCov_9fa48("204"), 'Invalid, expired, or unauthorized token')
        }));
      }
    }
  }
}