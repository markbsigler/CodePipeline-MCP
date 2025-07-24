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
import { RateLimitRequestHandler, Options } from 'express-rate-limit';
import { Request } from 'express';

// Example config: { '/v1/mcp/tools/list': { max: 30 }, '/v1/mcp/tools/call': { max: 10 } }
const endpointRateLimits: Record<string, {
  max: number;
}> = stryMutAct_9fa48("243") ? {} : (stryCov_9fa48("243"), {
  '/v1/mcp/tools/list': stryMutAct_9fa48("244") ? {} : (stryCov_9fa48("244"), {
    max: 30
  }),
  '/v1/mcp/tools/call': stryMutAct_9fa48("245") ? {} : (stryCov_9fa48("245"), {
    max: 10
  })
});

// Factory to create a rate limiter for a given endpoint and user role
function createRateLimiter(max: number) {
  if (stryMutAct_9fa48("246")) {
    {}
  } else {
    stryCov_9fa48("246");
    return require('express-rate-limit')(stryMutAct_9fa48("247") ? {} : (stryCov_9fa48("247"), {
      windowMs: stryMutAct_9fa48("248") ? 60 / 1000 : (stryCov_9fa48("248"), 60 * 1000),
      max,
      standardHeaders: stryMutAct_9fa48("249") ? false : (stryCov_9fa48("249"), true),
      legacyHeaders: stryMutAct_9fa48("250") ? true : (stryCov_9fa48("250"), false),
      message: stryMutAct_9fa48("251") ? {} : (stryCov_9fa48("251"), {
        error: stryMutAct_9fa48("252") ? "" : (stryCov_9fa48("252"), 'Too many requests, please try again later.')
      }),
      handler: (_req: Request, response: any, _next: any, options: Options) => {
        if (stryMutAct_9fa48("253")) {
          {}
        } else {
          stryCov_9fa48("253");
          response.set(stryMutAct_9fa48("254") ? "" : (stryCov_9fa48("254"), 'X-RateLimit-Limit'), (stryMutAct_9fa48("255") ? options.max && 60 : (stryCov_9fa48("255"), options.max ?? 60)).toString());
          response.set(stryMutAct_9fa48("256") ? "" : (stryCov_9fa48("256"), 'X-RateLimit-Remaining'), stryMutAct_9fa48("257") ? "" : (stryCov_9fa48("257"), '0'));
          response.set(stryMutAct_9fa48("258") ? "" : (stryCov_9fa48("258"), 'X-RateLimit-Reset'), (stryMutAct_9fa48("259") ? Math.floor(Date.now() / 1000) - 60 : (stryCov_9fa48("259"), Math.floor(stryMutAct_9fa48("260") ? Date.now() * 1000 : (stryCov_9fa48("260"), Date.now() / 1000)) + 60)).toString());
          response.status(429).json(options.message);
        }
      }
    }));
  }
}

// Pre-create limiters for each endpoint and role
const limiters: Record<string, RateLimitRequestHandler> = {};
Object.entries(endpointRateLimits).forEach(([route, {
  max
}]) => {
  if (stryMutAct_9fa48("261")) {
    {}
  } else {
    stryCov_9fa48("261");
    limiters[stryMutAct_9fa48("262") ? `` : (stryCov_9fa48("262"), `${route}:user`)] = createRateLimiter(max);
    limiters[stryMutAct_9fa48("263") ? `` : (stryCov_9fa48("263"), `${route}:admin`)] = createRateLimiter(1000);
  }
});
limiters[stryMutAct_9fa48("264") ? "" : (stryCov_9fa48("264"), 'default:user')] = createRateLimiter(60);
limiters[stryMutAct_9fa48("265") ? "" : (stryCov_9fa48("265"), 'default:admin')] = createRateLimiter(1000);
export function mcpRateLimiter(req: Request, res: any, next: any) {
  if (stryMutAct_9fa48("266")) {
    {}
  } else {
    stryCov_9fa48("266");
    const key = stryMutAct_9fa48("267") ? req.baseUrl - req.path : (stryCov_9fa48("267"), req.baseUrl + req.path);
    // Defensive: req.user may be string, JwtPayload, or undefined
    let role = stryMutAct_9fa48("268") ? "" : (stryCov_9fa48("268"), 'user');
    if (stryMutAct_9fa48("271") ? typeof req.user === 'object' && req.user !== null && 'role' in req.user || req.user.role === 'admin' : stryMutAct_9fa48("270") ? false : stryMutAct_9fa48("269") ? true : (stryCov_9fa48("269", "270", "271"), (stryMutAct_9fa48("273") ? typeof req.user === 'object' && req.user !== null || 'role' in req.user : stryMutAct_9fa48("272") ? true : (stryCov_9fa48("272", "273"), (stryMutAct_9fa48("275") ? typeof req.user === 'object' || req.user !== null : stryMutAct_9fa48("274") ? true : (stryCov_9fa48("274", "275"), (stryMutAct_9fa48("277") ? typeof req.user !== 'object' : stryMutAct_9fa48("276") ? true : (stryCov_9fa48("276", "277"), typeof req.user === (stryMutAct_9fa48("278") ? "" : (stryCov_9fa48("278"), 'object')))) && (stryMutAct_9fa48("280") ? req.user === null : stryMutAct_9fa48("279") ? true : (stryCov_9fa48("279", "280"), req.user !== null)))) && (stryMutAct_9fa48("281") ? "" : (stryCov_9fa48("281"), 'role')) in req.user)) && (stryMutAct_9fa48("283") ? req.user.role !== 'admin' : stryMutAct_9fa48("282") ? true : (stryCov_9fa48("282", "283"), req.user.role === (stryMutAct_9fa48("284") ? "" : (stryCov_9fa48("284"), 'admin')))))) {
      if (stryMutAct_9fa48("285")) {
        {}
      } else {
        stryCov_9fa48("285");
        role = stryMutAct_9fa48("286") ? "" : (stryCov_9fa48("286"), 'admin');
      }
    }
    const limiter = stryMutAct_9fa48("289") ? limiters[`${key}:${role}`] && limiters[`default:${role}`] : stryMutAct_9fa48("288") ? false : stryMutAct_9fa48("287") ? true : (stryCov_9fa48("287", "288", "289"), limiters[stryMutAct_9fa48("290") ? `` : (stryCov_9fa48("290"), `${key}:${role}`)] || limiters[stryMutAct_9fa48("291") ? `` : (stryCov_9fa48("291"), `default:${role}`)]);
    return limiter(req, res, next);
  }
}