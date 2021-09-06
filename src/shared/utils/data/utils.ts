import RegexEscape from 'regex-escape';
import type { HandleFormulaVars, HandleConditionalVars, HandleFormulaGetters } from './index';

type HandledVars = HandleFormulaVars | HandleConditionalVars;
type HandledGetters = HandleFormulaGetters;

function getVarsMap<T>(vars: HandledVars): Map<string, T> {
  const varsMap = new Map();
  const handleVarsMapping = (prefix: string, target: HandledVars) => {
    Object.entries(target).forEach(([key, value]) => {
      const mapKey = `${prefix ? prefix + '.' : ''}${key}`;
      if (typeof value === 'object') {
        if (Array.isArray(value)) {
          varsMap.set(mapKey, `[${value.toString()}]`);
        } else {
          handleVarsMapping(mapKey, value);
        }
      } else {
        varsMap.set(mapKey, value);
      }
    });
  };
  handleVarsMapping('', vars);
  return varsMap;
}

function getGettersMap<T>(getters: HandledGetters): Map<string, () => T> {
  const gettersMap = new Map();
  const handleGettersMapping = (prefix: string, target: HandledGetters) => {
    Object.entries(target).forEach(([key, value]) => {
      const mapKey = `${prefix ? prefix + '.' : ''}${key}`;
      if (typeof value === 'object') {
        handleGettersMapping(mapKey, value);
      } else if (typeof value === 'function') {
        gettersMap.set(mapKey, value);
      } else {
        console.warn(`[handle formula] getter: ${mapKey} is not function`);
      }
    });
  };
  handleGettersMapping('', getters);
  return gettersMap;
}

/**
 * sort by key.length to handle longer var first
 */
function varMapToArray<T>(map: Map<string, T>) {
  return Array.from(map).sort(([keya], [keyb]) => keyb.length - keya.length);
}

function handleReplacedKey(key: string) {
  return new RegExp(`${RegexEscape(key)}(?![a-zA-Z0-9_$'])`, 'g');
}

export { getVarsMap, getGettersMap, varMapToArray, handleReplacedKey };
