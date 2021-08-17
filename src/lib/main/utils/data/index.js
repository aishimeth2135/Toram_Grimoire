import * as recast from 'recast';
import RegexEscape from 'regex-escape';
import { isNumberString } from '@utils/string';

/**
 * @param {string} str
 * @returns {string}
 */
function parseFormula(formulaStr, { methods = {} } = {}) {
  const ast = recast.parse(formulaStr);
  // console.log(ast.program.body[0]);

  const builders = recast.types.builders;
  const TNT = recast.types.namedTypes;

  const back = (self, path) => {
    path.parentPath.parentPath.parentPath ?
      self.traverse(path.parentPath.parentPath.parentPath) :
      self.traverse(path);
  };

  const calc = (a, operator, b) => {
    if (operator === '+')
      return a + b;
    if (operator === '-')
      return a - b;
    if (operator === '*')
      return a * b;
    if (operator === '/')
      return a / b;
    if (operator === '&&')
      return a && b;
    if (operator === '||')
      return a || b;
    return 0;
  }

  recast.visit(ast, {
    visitLogicalExpression(path) {
      const node = path.node;
      if (TNT.Literal.check(node.right) && TNT.Literal.check(node.left)) {
        const value = calc(node.left.value, node.operator, node.right.value);
        path.parentPath.get(path.name).replace(builders.literal(value));

        back(this, path);
        return;
      }

      this.traverse(path);
    },
    visitBinaryExpression(path) {
      const node = path.node;
      if (TNT.Literal.check(node.right)) {
        if (TNT.Literal.check(node.left) || (TNT.UnaryExpression.check(node.left) && node.left.operator === '-')) {
          const leftValue = !TNT.UnaryExpression.check(node.left) ? node.left.value : -1 * node.left.argument.value;
          const value = calc(leftValue, node.operator, node.right.value);
          path.parentPath.get(path.name).replace(builders.literal(value));

          back(this, path);
          return;
        }
        if (TNT.BinaryExpression.check(node.left) && (node.operator === '*' || node.operator === '/') &&
          TNT.Literal.check(node.left.right) && node.left.operator === '*') {
          const value = calc(node.right.value, node.operator, node.left.right.value);
          path.get('right').replace(builders.literal(value));
          path.get('left').replace(node.left.left);

          back(this, path);
          return;
        }
      }

      this.traverse(path);
    },
    visitCallExpression(path) {
      const node = path.node;

      if (node.arguments.every(anode => TNT.Literal.check(anode) || TNT.UnaryExpression.check(anode))) {
        const args = node.arguments.map(anode => {
          if (TNT.UnaryExpression.check(anode)) {
            return -1 * anode.argument.value;
          }
          return anode.value;
        });

        const pros = [];
        let cur = node.callee;
        if (TNT.Identifier.check(cur)) {
          cur = methods[cur.name];
        } else {
          while (!TNT.Identifier.check(cur)) {
            if (TNT.Identifier.check(cur.property)) {
              pros.push(cur.property.name);
            } else if (TNT.Literal.check(cur.property)) {
              pros.push(cur.property.value);
            } else {
              return;
            }
            cur = cur.object;
          }
          if (cur.name in window) {
            cur = window[cur.name];
          } else {
            cur = methods[cur.name];
          }
          pros.reverse().forEach(p => cur = cur[p]);
        }

        const value = cur(...args) || 0;
        path.parentPath.get(path.name).replace(builders.literal(value));

        back(this, path);
        return;
      }
      this.traverse(path);
    },
    visitMemberExpression(path) {
      const node = path.node;

      if (node.computed && TNT.ArrayExpression.check(node.object)) {
        const ary = node.object.elements;
        if (ary.every(p => TNT.Literal.check(p)) && TNT.Literal.check(node.property)) {
          const value = ary[node.property.value].value;
          path.parentPath.get(path.name).replace(builders.literal(value));

          back(this, path);
          return;
        }
      }

      this.traverse(path);
    },
  });

  return recast.print(ast).code.replace(/\((\d+(?:\.\d+)?)\)/g, (m, m1) => m1);
}

/**
 * @typedef HandleFormulaOptions
 * @type {Object}
 * @property {object} [texts] - mapping of text
 * @property {object} [vars] - mapping of vars
 * @property {object} [methods] - mapping of methods
 * @property {object} [getters] - mapping of getters. The getter like the var in formula, but will access by function
 * @property {boolean} [toNumber=false] - If true, result will convert to number
 * @property {boolean} [pure=false] - If true, it have to make sure that given formula can be converted into non-vars string.
 *                                  * it means the given formula will only contains vars and all vars are exist in options.vars.
 *                                  * It will use performance better way to deal with given formula.
 * @property {any} [defaultValue] - If given formula is empty, it will return options.defaultValue.
 */
/**
 * @param {string} formulaStr
 * @param {HandleFormulaOptions} options
 */
function handleFormula(formulaStr, {
    vars = {},
    texts = {},
    methods = {},
    getters = {},
    toNumber = false,
    pure = false,
    defaultValue = null,
  } = {}) {
  if (formulaStr === '') {
    if (defaultValue === undefined) {
      return toNumber ? 0 : '0';
    }
    return defaultValue;
  }
  const originalFormulaStr = formulaStr;

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

  // sort by key.length to handle longer var first
  const varMapToArray = map => Array.from(map).sort(([keya], [keyb]) => keyb.length - keya.length);
  const handleReplacedKey = key => new RegExp(`${RegexEscape(key)}(?![a-zA-Z0-9_$'])`, 'g');

  varMapToArray(varsMap).forEach(([key, value]) => {
    formulaStr = formulaStr.replace(handleReplacedKey(key), typeof value !== 'string' ? value.toString() : (value || '0'));
  });

  const gettersMethodsRoot = '__HANDLE_FORMULA_GETTERS__';
  const gettersAry = varMapToArray(gettersMap);
  gettersAry.forEach(([key]) => {
    // convert to method
    const methodName = `${gettersMethodsRoot}['${key}']`;
    formulaStr = formulaStr.replace(handleReplacedKey(key), `${methodName}()`);
  });

  // replace '--' to '+', '--+' to '+', etc...
  formulaStr = formulaStr.replace(/-{2,}/g, match => match.length % 2 === 0 ? '+' : '-');

  const getTextVarName = value => `__HANDLE_FORMULA_TEXT_${value}__`;
  const textKeys = Object.keys(texts);
  textKeys.forEach((key, idx) => {
    formulaStr = formulaStr.replace(handleReplacedKey(key), getTextVarName(idx));
  });

  if (gettersAry.length !== 0) {
    methods[gettersMethodsRoot] = getters;
  }

  if (!isNumberString(formulaStr)) {
    try {
      if (pure) {
        formulaStr = (Function(`return (${formulaStr});`)()).toString();
      } else {
        formulaStr = parseFormula(formulaStr, { methods });
      }
    } catch (error) {
      console.groupCollapsed('[parse formula] Unable to parse formula:');
      console.warn(originalFormulaStr);
      console.log('Current formula: ', formulaStr);
      console.log(Array.from(arguments));
      console.warn(error);
      console.groupEnd();
      return '0';
    }
  }

  textKeys.forEach((key, idx) => {
    formulaStr = formulaStr.replace(new RegExp(getTextVarName(idx), 'g'), texts[key]);
  });

  if (toNumber && typeof formulaStr === 'string') {
    const num = parseFloat(formulaStr);
    return Number.isNaN(num) ? 0 : num;
  }

  if (formulaStr === 'true') {
    return true;
  }
  if (formulaStr === 'false') {
    return false;
  }

  return formulaStr;
}

export { handleFormula };
