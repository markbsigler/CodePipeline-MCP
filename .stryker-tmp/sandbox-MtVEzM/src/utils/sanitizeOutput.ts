/**
 * Recursively sanitize output by removing dangerous fields and escaping strings.
 * For production, use a library like xss or DOMPurify for HTML.
 * This version also removes more sensitive fields, escapes more characters, prevents prototype pollution, and limits recursion depth.
 */
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
const SENSITIVE_KEYS = stryMutAct_9fa48("636") ? [] : (stryCov_9fa48("636"), [stryMutAct_9fa48("637") ? "" : (stryCov_9fa48("637"), 'password'), stryMutAct_9fa48("638") ? "" : (stryCov_9fa48("638"), 'token'), stryMutAct_9fa48("639") ? "" : (stryCov_9fa48("639"), 'secret'), stryMutAct_9fa48("640") ? "" : (stryCov_9fa48("640"), 'ssn'), stryMutAct_9fa48("641") ? "" : (stryCov_9fa48("641"), 'apikey'), stryMutAct_9fa48("642") ? "" : (stryCov_9fa48("642"), 'api_key')]);
const POLLUTION_KEYS = stryMutAct_9fa48("643") ? [] : (stryCov_9fa48("643"), [stryMutAct_9fa48("644") ? "" : (stryCov_9fa48("644"), '__proto__'), stryMutAct_9fa48("645") ? "" : (stryCov_9fa48("645"), 'constructor'), stryMutAct_9fa48("646") ? "" : (stryCov_9fa48("646"), 'prototype')]);
const MAX_DEPTH = 20;
export function sanitizeOutput(obj: any, depth = 0): any {
  if (stryMutAct_9fa48("647")) {
    {}
  } else {
    stryCov_9fa48("647");
    if (stryMutAct_9fa48("651") ? depth < MAX_DEPTH : stryMutAct_9fa48("650") ? depth > MAX_DEPTH : stryMutAct_9fa48("649") ? false : stryMutAct_9fa48("648") ? true : (stryCov_9fa48("648", "649", "650", "651"), depth >= MAX_DEPTH)) return undefined;
    if (stryMutAct_9fa48("653") ? false : stryMutAct_9fa48("652") ? true : (stryCov_9fa48("652", "653"), Array.isArray(obj))) {
      if (stryMutAct_9fa48("654")) {
        {}
      } else {
        stryCov_9fa48("654");
        return obj.map(stryMutAct_9fa48("655") ? () => undefined : (stryCov_9fa48("655"), item => sanitizeOutput(item, stryMutAct_9fa48("656") ? depth - 1 : (stryCov_9fa48("656"), depth + 1))));
      }
    }
    if (stryMutAct_9fa48("659") ? obj || typeof obj === 'object' : stryMutAct_9fa48("658") ? false : stryMutAct_9fa48("657") ? true : (stryCov_9fa48("657", "658", "659"), obj && (stryMutAct_9fa48("661") ? typeof obj !== 'object' : stryMutAct_9fa48("660") ? true : (stryCov_9fa48("660", "661"), typeof obj === (stryMutAct_9fa48("662") ? "" : (stryCov_9fa48("662"), 'object')))))) {
      if (stryMutAct_9fa48("663")) {
        {}
      } else {
        stryCov_9fa48("663");
        const clean: Record<string, any> = {};
        for (const [k, v] of Object.entries(obj)) {
          if (stryMutAct_9fa48("664")) {
            {}
          } else {
            stryCov_9fa48("664");
            const keyLower = stryMutAct_9fa48("665") ? k.toUpperCase() : (stryCov_9fa48("665"), k.toLowerCase());
            if (stryMutAct_9fa48("668") ? SENSITIVE_KEYS.every(s => keyLower.includes(s)) : stryMutAct_9fa48("667") ? false : stryMutAct_9fa48("666") ? true : (stryCov_9fa48("666", "667", "668"), SENSITIVE_KEYS.some(stryMutAct_9fa48("669") ? () => undefined : (stryCov_9fa48("669"), s => keyLower.includes(s))))) continue;
            if (stryMutAct_9fa48("671") ? false : stryMutAct_9fa48("670") ? true : (stryCov_9fa48("670", "671"), POLLUTION_KEYS.includes(k))) continue;
            const sanitized = sanitizeOutput(v, stryMutAct_9fa48("672") ? depth - 1 : (stryCov_9fa48("672"), depth + 1));
            if (stryMutAct_9fa48("675") ? sanitized === undefined : stryMutAct_9fa48("674") ? false : stryMutAct_9fa48("673") ? true : (stryCov_9fa48("673", "674", "675"), sanitized !== undefined)) {
              if (stryMutAct_9fa48("676")) {
                {}
              } else {
                stryCov_9fa48("676");
                clean[k] = sanitized;
              }
            }
          }
        }
        // If the object is empty, return undefined (unless it's the root)
        if (stryMutAct_9fa48("679") ? Object.keys(clean).length === 0 || depth !== 0 : stryMutAct_9fa48("678") ? false : stryMutAct_9fa48("677") ? true : (stryCov_9fa48("677", "678", "679"), (stryMutAct_9fa48("681") ? Object.keys(clean).length !== 0 : stryMutAct_9fa48("680") ? true : (stryCov_9fa48("680", "681"), Object.keys(clean).length === 0)) && (stryMutAct_9fa48("683") ? depth === 0 : stryMutAct_9fa48("682") ? true : (stryCov_9fa48("682", "683"), depth !== 0)))) return undefined;
        return clean;
      }
    }
    if (stryMutAct_9fa48("686") ? typeof obj !== 'string' : stryMutAct_9fa48("685") ? false : stryMutAct_9fa48("684") ? true : (stryCov_9fa48("684", "685", "686"), typeof obj === (stryMutAct_9fa48("687") ? "" : (stryCov_9fa48("687"), 'string')))) {
      if (stryMutAct_9fa48("688")) {
        {}
      } else {
        stryCov_9fa48("688");
        return obj.replace(stryMutAct_9fa48("689") ? /[^<>&"'`]/g : (stryCov_9fa48("689"), /[<>&"'`]/g), stryMutAct_9fa48("690") ? () => undefined : (stryCov_9fa48("690"), c => stryMutAct_9fa48("691") ? {
          '<': '&lt;',
          '>': '&gt;',
          '&': '&amp;',
          '"': '&quot;',
          "'": '&#39;',
          '`': '&#96;'
        }[c] && c : (stryCov_9fa48("691"), (stryMutAct_9fa48("692") ? {} : (stryCov_9fa48("692"), {
          '<': stryMutAct_9fa48("693") ? "" : (stryCov_9fa48("693"), '&lt;'),
          '>': stryMutAct_9fa48("694") ? "" : (stryCov_9fa48("694"), '&gt;'),
          '&': stryMutAct_9fa48("695") ? "" : (stryCov_9fa48("695"), '&amp;'),
          '"': stryMutAct_9fa48("696") ? "" : (stryCov_9fa48("696"), '&quot;'),
          "'": stryMutAct_9fa48("697") ? "" : (stryCov_9fa48("697"), '&#39;'),
          '`': stryMutAct_9fa48("698") ? "" : (stryCov_9fa48("698"), '&#96;')
        }))[c] ?? c)));
      }
    }
    return obj;
  }
}