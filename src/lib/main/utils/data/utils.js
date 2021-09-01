import RegexEscape from 'regex-escape';


/**
 * @param {Object<string, number|string>} vars
 * @returns {Map<string, number|string>}
 */
function getVarsMap(vars) {
  const varsMap = new Map();
  const handleVarsMapping = (prefix, target) => {
    Object.entries(target).forEach(([key, value]) => {
      const mapKey = `${prefix ? prefix + '.' : ''}${key}`;
      if (typeof value === 'function') {
        varsMap.set(mapKey, value());
      } else if (typeof value === 'object') {
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

/**
 * @param {Object<string, function(): number|string>} getters
 * @returns {Map<string, function(): number|string>}
 */
function getGettersMap(getters) {
  const gettersMap = new Map();
  const handleGettersMapping = (prefix, target) => {
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
 * @param {Map<string, number|string>} map
 * @returns {Array<[string, number|string]>}
 */
function varMapToArray(map) {
  return Array.from(map).sort(([keya], [keyb]) => keyb.length - keya.length);
}

function handleReplacedKey(key) {
  return new RegExp(`${RegexEscape(key)}(?![a-zA-Z0-9_$'])`, 'g');
}

export { getVarsMap, getGettersMap, varMapToArray, handleReplacedKey };
