import { isNumberString } from '@/shared/utils/string';
import { getVarsMap, getGettersMap, varMapToArray, handleReplacedKey } from './utils';

import jsep from 'jsep';
import type { Expression } from 'jsep';

function parseFormula(formulaStr: string, { vars = {} }: { vars?: unknown } = {}) {
  const unknowSnippet = value => typeof value === 'string';
  const handleIdentifier = (node, parent = null) => {
    if (parent === null) {
      if (window[node.name]) {
        return window[node.name];
      }
      return vars[node.name];
    }
    return parent[node.name];
  };
  const handle = (node) => {
    if (node.type === 'Literal') {
      return node.value;
    }
    if (node.type === 'UnaryExpression') {
      return node.argument.type === 'Literal' ?
        handle(node.argument) * -1 :
        '-' + handle(node.argument);
    }
    if (node.type === 'BinaryExpression') {
      const left = handle(node.left);
      const right = handle(node.right);
      const operator = node.operator;
      if (unknowSnippet(left) || unknowSnippet(right))
        return `${left}${operator}${right}`;
      if (operator === '+')
        return left + right;
      if (operator === '-')
        return left - right;
      if (operator === '*')
        return left * right;
      if (operator === '/')
        return left / right;
    }
    if (node.type === 'Identifier') {
      return node.name;
    }
    if (node.type === 'MemberExpression') {
      if (!node.computed) {
        if (node.object.type === 'MemberExpression') {
          return handleIdentifier(node.property, handle(node.object));
        }
        return handleIdentifier(node.property, handleIdentifier(node.object));
      }
      const parent = node.object.type === 'MemberExpression' ? handle(node.object) : handleIdentifier(node.object);
      return parent[handle(node.property)];
    }
    if (node.type === 'CallExpression') {
      const args = node.arguments.map(arg => handle(arg));
      if (args.some(arg => unknowSnippet(arg))) {
        const chain = [];
        let cur = node.callee;
        while (cur.type === 'MemberExpression') {
          chain.push(cur.computed ? cur.property.value : cur.property.name);
          cur = cur.object;
        }
        chain.push(cur.name);
        return `${chain.reverse().join('.')}(${args.join(', ')})`;
      }
      const callee = node.callee.type === 'Identifier' ? handleIdentifier(node.callee) : handle(node.callee);
      return callee.apply(null, args);
    }
    if (node.type === 'ArrayExpression') {
      const els = node.elements.map(el => handle(el));
      if (els.some(el => unknowSnippet(el))) {
        return `[${els.join(', ')}]`;
      }
    }
    if (node.type === 'Compound') {
      const els = handle(node.body[0]);
      const key = handle(node.body[1][node.body[1].length - 1]);
      if (unknowSnippet(els) || unknowSnippet(key)) {
        return `[${els.join(', ')}][${key}]`;
      }
    }
    if (node.type === 'ConditionalExpression') {
      const test = parseConditional(node.test);
      return handle(test ? node.consequent : node.alternate);
    }
    return 0;
  };
  return handle(jsep(formulaStr));
}

function parseConditional(formulaStr: string) {
  const handle = (node) => {
    if (node.type === 'Literal') {
      return node.value;
    }
    if (node.type === 'LogicalExpression') {
      const left = handle(node.left);
      const right = handle(node.right);
      const operator = node.operator;
      if (operator === '&&')
        return left && right;
      if (operator === '||')
        return left || right;
    }
  }
  return handle(jsep(formulaStr));
}

type HandleFormulaVars = {
  [x: string]: number | string | HandleFormulaVars
}
type HandleFormulaTexts = {
  [x: string]: string | HandleFormulaTexts
}
type HandleFormulaMethods = {
  [x: string]: Function | HandleFormulaMethods
}
type HandleFormulaGetters = {
  [x: string]: () => number | string | HandleFormulaGetters
}

type HandleFormulaOptions = {
  /** mapping of vars */
  vars?: HandleFormulaVars

  /** mapping of texts */
  texts?: HandleFormulaTexts

  /** mapping of methods */
  methods?: HandleFormulaMethods

  /** mapping of getters */
  getters?: HandleFormulaGetters

  /** If true, result will convert to number */
  toNumber?: false

  /** If given formula is empty, it will return options.defaultValue. */
  defaultValue?: string | number
}

function handleFormula(formulaStr: string, {
    vars = {},
    texts = {},
    methods = {},
    getters = {},
    toNumber = false,
    defaultValue = null,
  }: HandleFormulaOptions = {}) {
  if (formulaStr === '') {
    if (defaultValue === undefined) {
      return toNumber ? 0 : '0';
    }
    return defaultValue;
  }
  const originalFormulaStr = formulaStr;
  const varsMap = getVarsMap(vars);
  const gettersMap = getGettersMap(getters);

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
      formulaStr = parseFormula(formulaStr, {
        vars: { ...methods },
      });
    } catch (error) {
      console.groupCollapsed('[parse formula] Unable to parse formula:');
      console.warn(originalFormulaStr);
      console.log('Current: ', formulaStr);
      console.log(Array.from(arguments));
      console.warn(error);
      console.groupEnd();
      return '0';
    }
  }

  textKeys.forEach((key, idx) => {
    formulaStr = formulaStr.replace(new RegExp(getTextVarName(idx), 'g'), texts[key] as string);
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

type HandleConditionalVars = {
  [x: string]: boolean | HandleConditionalVars
};

type HandleConditionalOptions = {
  /** mapping of vars */
  vars?: HandleConditionalVars

  /** If given formula is undefined, it will return options.defaultValue. */
  defaultValue?: string | number
}

function handleConditional(formulaStr: string, {
  vars = {},
  defaultValue = null,
}: HandleConditionalOptions = {}) {
  if (formulaStr === '') {
    if (defaultValue === undefined) {
      return true;
    }
    return defaultValue;
  }
  const originalFormulaStr = formulaStr;

  const varsMap = getVarsMap(vars);
  varMapToArray(varsMap).forEach(([key, value]) => {
    formulaStr = formulaStr.replace(handleReplacedKey(key), typeof value === 'boolean' ? value.toString() : 'true');
  });

  let result = true;
  try {
    result = parseConditional(formulaStr);
  } catch (error) {
    console.groupCollapsed('[parse formula] Unable to parse conditional:');
    console.warn(originalFormulaStr);
    console.log('Current: ', formulaStr);
    console.log(Array.from(arguments));
    console.warn(error);
    console.groupEnd();
  }
  return result;
}

export { handleConditional, handleFormula };
export type { HandleFormulaVars, HandleFormulaGetters, HandleConditionalVars };
