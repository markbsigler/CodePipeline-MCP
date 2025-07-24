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
import { z, ZodTypeAny } from 'zod';

/**
 * Converts a JSON Schema object to a Zod schema.
 * Supports enum, const, oneOf/anyOf, nullability, and improved required/optional handling.
 *
 * Note: Cognitive complexity is high due to JSON Schema branching. Consider refactoring for maintainability if needed.
 */
export function jsonSchemaToZod(schema: any): ZodTypeAny {
  if (stryMutAct_9fa48("329")) {
    {}
  } else {
    stryCov_9fa48("329");
    if (stryMutAct_9fa48("332") ? !schema && typeof schema !== 'object' : stryMutAct_9fa48("331") ? false : stryMutAct_9fa48("330") ? true : (stryCov_9fa48("330", "331", "332"), (stryMutAct_9fa48("333") ? schema : (stryCov_9fa48("333"), !schema)) || (stryMutAct_9fa48("335") ? typeof schema === 'object' : stryMutAct_9fa48("334") ? false : (stryCov_9fa48("334", "335"), typeof schema !== (stryMutAct_9fa48("336") ? "" : (stryCov_9fa48("336"), 'object')))))) return z.any();

    // Handle enum
    if (stryMutAct_9fa48("339") ? Array.isArray(schema.enum) || schema.enum.length > 0 : stryMutAct_9fa48("338") ? false : stryMutAct_9fa48("337") ? true : (stryCov_9fa48("337", "338", "339"), Array.isArray(schema.enum) && (stryMutAct_9fa48("342") ? schema.enum.length <= 0 : stryMutAct_9fa48("341") ? schema.enum.length >= 0 : stryMutAct_9fa48("340") ? true : (stryCov_9fa48("340", "341", "342"), schema.enum.length > 0)))) {
      if (stryMutAct_9fa48("343")) {
        {}
      } else {
        stryCov_9fa48("343");
        if (stryMutAct_9fa48("346") ? schema.enum.some((v: any) => typeof v === 'string') : stryMutAct_9fa48("345") ? false : stryMutAct_9fa48("344") ? true : (stryCov_9fa48("344", "345", "346"), schema.enum.every(stryMutAct_9fa48("347") ? () => undefined : (stryCov_9fa48("347"), (v: any) => stryMutAct_9fa48("350") ? typeof v !== 'string' : stryMutAct_9fa48("349") ? false : stryMutAct_9fa48("348") ? true : (stryCov_9fa48("348", "349", "350"), typeof v === (stryMutAct_9fa48("351") ? "" : (stryCov_9fa48("351"), 'string'))))))) {
          if (stryMutAct_9fa48("352")) {
            {}
          } else {
            stryCov_9fa48("352");
            // All string enum
            return z.enum(schema.enum as [string, ...string[]]);
          }
        } else {
          if (stryMutAct_9fa48("353")) {
            {}
          } else {
            stryCov_9fa48("353");
            // Mixed/other types: use union of literals
            return z.union(schema.enum.map(stryMutAct_9fa48("354") ? () => undefined : (stryCov_9fa48("354"), (v: any) => z.literal(v))));
          }
        }
      }
    }

    // Handle const
    if (stryMutAct_9fa48("357") ? schema.const === undefined : stryMutAct_9fa48("356") ? false : stryMutAct_9fa48("355") ? true : (stryCov_9fa48("355", "356", "357"), schema.const !== undefined)) {
      if (stryMutAct_9fa48("358")) {
        {}
      } else {
        stryCov_9fa48("358");
        return z.literal(schema.const);
      }
    }

    // Handle oneOf/anyOf
    if (stryMutAct_9fa48("361") ? schema.oneOf && schema.anyOf : stryMutAct_9fa48("360") ? false : stryMutAct_9fa48("359") ? true : (stryCov_9fa48("359", "360", "361"), schema.oneOf ?? schema.anyOf)) {
      if (stryMutAct_9fa48("362")) {
        {}
      } else {
        stryCov_9fa48("362");
        const variants = (stryMutAct_9fa48("363") ? schema.oneOf && schema.anyOf : (stryCov_9fa48("363"), schema.oneOf ?? schema.anyOf)).map(stryMutAct_9fa48("364") ? () => undefined : (stryCov_9fa48("364"), (s: any) => jsonSchemaToZod(s)));
        return z.union(variants);
      }
    }

    // Handle nullability (type: [T, "null"] or nullable: true)
    let type = schema.type;
    let isNullable = stryMutAct_9fa48("365") ? true : (stryCov_9fa48("365"), false);
    if (stryMutAct_9fa48("367") ? false : stryMutAct_9fa48("366") ? true : (stryCov_9fa48("366", "367"), Array.isArray(type))) {
      if (stryMutAct_9fa48("368")) {
        {}
      } else {
        stryCov_9fa48("368");
        if (stryMutAct_9fa48("370") ? false : stryMutAct_9fa48("369") ? true : (stryCov_9fa48("369", "370"), type.includes(stryMutAct_9fa48("371") ? "" : (stryCov_9fa48("371"), 'null')))) {
          if (stryMutAct_9fa48("372")) {
            {}
          } else {
            stryCov_9fa48("372");
            isNullable = stryMutAct_9fa48("373") ? false : (stryCov_9fa48("373"), true);
            type = stryMutAct_9fa48("374") ? type[0] : (stryCov_9fa48("374"), type.filter(stryMutAct_9fa48("375") ? () => undefined : (stryCov_9fa48("375"), (t: string) => stryMutAct_9fa48("378") ? t === 'null' : stryMutAct_9fa48("377") ? false : stryMutAct_9fa48("376") ? true : (stryCov_9fa48("376", "377", "378"), t !== (stryMutAct_9fa48("379") ? "" : (stryCov_9fa48("379"), 'null')))))[0]);
          }
        }
      }
    } else if (stryMutAct_9fa48("382") ? schema.nullable !== true : stryMutAct_9fa48("381") ? false : stryMutAct_9fa48("380") ? true : (stryCov_9fa48("380", "381", "382"), schema.nullable === (stryMutAct_9fa48("383") ? false : (stryCov_9fa48("383"), true)))) {
      if (stryMutAct_9fa48("384")) {
        {}
      } else {
        stryCov_9fa48("384");
        isNullable = stryMutAct_9fa48("385") ? false : (stryCov_9fa48("385"), true);
      }
    }
    let base: ZodTypeAny;
    if (stryMutAct_9fa48("388") ? type !== 'string' : stryMutAct_9fa48("387") ? false : stryMutAct_9fa48("386") ? true : (stryCov_9fa48("386", "387", "388"), type === (stryMutAct_9fa48("389") ? "" : (stryCov_9fa48("389"), 'string')))) {
      if (stryMutAct_9fa48("390")) {
        {}
      } else {
        stryCov_9fa48("390");
        let str = z.string();
        if (stryMutAct_9fa48("393") ? schema.minLength === undefined : stryMutAct_9fa48("392") ? false : stryMutAct_9fa48("391") ? true : (stryCov_9fa48("391", "392", "393"), schema.minLength !== undefined)) str = stryMutAct_9fa48("394") ? str.max(schema.minLength) : (stryCov_9fa48("394"), str.min(schema.minLength));
        if (stryMutAct_9fa48("397") ? schema.maxLength === undefined : stryMutAct_9fa48("396") ? false : stryMutAct_9fa48("395") ? true : (stryCov_9fa48("395", "396", "397"), schema.maxLength !== undefined)) str = stryMutAct_9fa48("398") ? str.min(schema.maxLength) : (stryCov_9fa48("398"), str.max(schema.maxLength));
        if (stryMutAct_9fa48("400") ? false : stryMutAct_9fa48("399") ? true : (stryCov_9fa48("399", "400"), schema.pattern)) str = str.regex(new RegExp(schema.pattern));
        base = str;
      }
    } else if (stryMutAct_9fa48("403") ? type === 'number' && type === 'integer' : stryMutAct_9fa48("402") ? false : stryMutAct_9fa48("401") ? true : (stryCov_9fa48("401", "402", "403"), (stryMutAct_9fa48("405") ? type !== 'number' : stryMutAct_9fa48("404") ? false : (stryCov_9fa48("404", "405"), type === (stryMutAct_9fa48("406") ? "" : (stryCov_9fa48("406"), 'number')))) || (stryMutAct_9fa48("408") ? type !== 'integer' : stryMutAct_9fa48("407") ? false : (stryCov_9fa48("407", "408"), type === (stryMutAct_9fa48("409") ? "" : (stryCov_9fa48("409"), 'integer')))))) {
      if (stryMutAct_9fa48("410")) {
        {}
      } else {
        stryCov_9fa48("410");
        let num = z.number();
        if (stryMutAct_9fa48("413") ? schema.minimum === undefined : stryMutAct_9fa48("412") ? false : stryMutAct_9fa48("411") ? true : (stryCov_9fa48("411", "412", "413"), schema.minimum !== undefined)) num = stryMutAct_9fa48("414") ? num.max(schema.minimum) : (stryCov_9fa48("414"), num.min(schema.minimum));
        if (stryMutAct_9fa48("417") ? schema.maximum === undefined : stryMutAct_9fa48("416") ? false : stryMutAct_9fa48("415") ? true : (stryCov_9fa48("415", "416", "417"), schema.maximum !== undefined)) num = stryMutAct_9fa48("418") ? num.min(schema.maximum) : (stryCov_9fa48("418"), num.max(schema.maximum));
        if (stryMutAct_9fa48("421") ? type !== 'integer' : stryMutAct_9fa48("420") ? false : stryMutAct_9fa48("419") ? true : (stryCov_9fa48("419", "420", "421"), type === (stryMutAct_9fa48("422") ? "" : (stryCov_9fa48("422"), 'integer')))) num = num.int(); // Enforce integer if type is 'integer'
        base = num;
      }
    } else if (stryMutAct_9fa48("425") ? type !== 'boolean' : stryMutAct_9fa48("424") ? false : stryMutAct_9fa48("423") ? true : (stryCov_9fa48("423", "424", "425"), type === (stryMutAct_9fa48("426") ? "" : (stryCov_9fa48("426"), 'boolean')))) {
      if (stryMutAct_9fa48("427")) {
        {}
      } else {
        stryCov_9fa48("427");
        base = z.boolean();
      }
    } else if (stryMutAct_9fa48("430") ? type !== 'array' : stryMutAct_9fa48("429") ? false : stryMutAct_9fa48("428") ? true : (stryCov_9fa48("428", "429", "430"), type === (stryMutAct_9fa48("431") ? "" : (stryCov_9fa48("431"), 'array')))) {
      if (stryMutAct_9fa48("432")) {
        {}
      } else {
        stryCov_9fa48("432");
        base = z.array(jsonSchemaToZod(schema.items));
      }
    } else if (stryMutAct_9fa48("435") ? type !== 'object' : stryMutAct_9fa48("434") ? false : stryMutAct_9fa48("433") ? true : (stryCov_9fa48("433", "434", "435"), type === (stryMutAct_9fa48("436") ? "" : (stryCov_9fa48("436"), 'object')))) {
      if (stryMutAct_9fa48("437")) {
        {}
      } else {
        stryCov_9fa48("437");
        if (stryMutAct_9fa48("440") ? false : stryMutAct_9fa48("439") ? true : stryMutAct_9fa48("438") ? schema.properties : (stryCov_9fa48("438", "439", "440"), !schema.properties)) return z.record(z.any());
        const shape: Record<string, ZodTypeAny> = {};
        // If required is missing, all properties are required by default (per JSON Schema spec)
        const required: string[] = stryMutAct_9fa48("441") ? schema.required && Object.keys(schema.properties) : (stryCov_9fa48("441"), schema.required ?? Object.keys(schema.properties));
        for (const [key, propSchema] of Object.entries(schema.properties)) {
          if (stryMutAct_9fa48("442")) {
            {}
          } else {
            stryCov_9fa48("442");
            let prop = jsonSchemaToZod(propSchema);
            if (stryMutAct_9fa48("445") ? false : stryMutAct_9fa48("444") ? true : stryMutAct_9fa48("443") ? required.includes(key) : (stryCov_9fa48("443", "444", "445"), !required.includes(key))) {
              if (stryMutAct_9fa48("446")) {
                {}
              } else {
                stryCov_9fa48("446");
                prop = prop.optional();
              }
            }
            shape[key] = prop;
          }
        }
        base = z.object(shape);
      }
    } else {
      if (stryMutAct_9fa48("447")) {
        {}
      } else {
        stryCov_9fa48("447");
        base = z.any();
      }
    }
    if (stryMutAct_9fa48("449") ? false : stryMutAct_9fa48("448") ? true : (stryCov_9fa48("448", "449"), isNullable)) {
      if (stryMutAct_9fa48("450")) {
        {}
      } else {
        stryCov_9fa48("450");
        return base.nullable();
      }
    }
    return base;
  }
}