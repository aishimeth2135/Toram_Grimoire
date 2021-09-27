import jsep from 'jsep';

import { isNumberString } from '@/shared/utils/string';

import { getVarsMap, getGettersMap, varMapToArray, handleReplacedKey, jsepTypes } from './utils';

type PureValue = string | number | boolean;
type CommonValue = PureValue | boolean[] | string[] | number[];
type CommonFunction = (...args: any[]) => PureValue;
type CommonValueExtended = CommonValue | CommonFunction;
type ParseFormulaVars = {
  [key: string]: CommonValueExtended | ParseFormulaVars;
};

function calcNumberBinaryExpression(left: number, operator: string, right: number): number {
  if (operator === '+')
    return left + right;
  if (operator === '-')
    return left - right;
  if (operator === '*')
    return left * right;
  if (operator === '/')
    return left / right;
  return 0;
}

function parseFormula(formulaStr: string, { vars = {} }: { vars?: ParseFormulaVars } = {}): PureValue {
  const unknowSnippet = (value: unknown) => typeof value === 'string';
  const handle = (node: jsep.Expression): CommonValueExtended | object => {
    if (jsepTypes.isLiteral(node)) {
      return node.value as PureValue;
    }
    if (jsepTypes.isUnaryExpression(node)) {
      return jsepTypes.isLiteral(node.argument) ?
        (node.argument.value as number) * -1 :
        '-' + handle(node.argument);
    }
    if (jsepTypes.isBinaryExpression(node)) {
      let left = handle(node.left) as (number | boolean);
      let right = handle(node.right) as (number | boolean);
      if (typeof left === 'string' && isNumberString(left))
        left = parseFloat(left);
      if (typeof right === 'string' && isNumberString(right))
        right = parseFloat(right);
      const operator = node.operator;
      if (unknowSnippet(left) || unknowSnippet(right))
        return `${left}${operator}${right}`;
      if (operator === '+' || operator === '-' || operator === '*' || operator === '/') {
        if (typeof left === 'boolean')
          left = left ? 1 : 0;
        if (typeof right === 'boolean')
          right = right ? 1 : 0;
        return calcNumberBinaryExpression(left, operator, right);
      }
      if (operator === '&&')
        return left && right;
      if (operator === '||')
        return left || right;
    }
    if (jsepTypes.isIdentifier(node)) {
      if (node.name in vars) {
        return vars[node.name];
      }
      if (node.name === 'Math') {
        return window.Math;
      }
      return node.name;
    }
    if (jsepTypes.isMemberExpression(node)) {
      const object = node.object;
      const property = node.property;
      const parent = handle(object) as (ParseFormulaVars | string);
      if (typeof parent !== 'string') {
        return parent[handle(property) as string];
      }
      return `${parent}.${handle(property) as string}`;
    }
    if (jsepTypes.isCallExpression(node)) {
      const args: unknown[] = node.arguments.map(arg => handle(arg));
      if (args.some(arg => unknowSnippet(arg))) {
        const chain = [];
        let cur = node.callee;
        while (jsepTypes.isMemberExpression(cur)) {
          chain.push(cur.computed ? cur.property.value : cur.property.name);
          cur = cur.object;
        }
        chain.push(cur.name);
        return `${chain.reverse().join('.')}(${args.join(', ')})`;
      }
      const callee = handle(node.callee) as Function;
      return callee(...args);
    }
    if (jsepTypes.isArrayExpression(node)) {
      const els: unknown[] = node.elements.map(el => handle(el));
      if (els.some(el => unknowSnippet(el))) {
        return `[${els.join(', ')}]`;
      }
      return els;
    }
    if (jsepTypes.isConditionalExpression(node)) {
      const test = handle(node.test);
      return handle(test ? node.consequent : node.alternate);
    }
    return 0;
  };
  return handle(jsep(formulaStr)) as PureValue;
}

type HandleFormulaVars = {
  [key: string]: CommonValue | HandleFormulaVars;
};
type HandleFormulaTexts = {
  [key: string]: string | HandleFormulaTexts;
};
type HandleFormulaMethods = {
  [key: string]: CommonFunction | HandleFormulaMethods;
};
type HandleFormulaGetters = {
  [key: string]: (() => PureValue) | HandleFormulaGetters;
};

type HandleFormulaOptions = {
  /** mapping of vars */
  vars?: HandleFormulaVars;
  /** mapping of texts */
  texts?: HandleFormulaTexts;
  /** mapping of methods */
  methods?: HandleFormulaMethods;
  /** mapping of getters */
  getters?: HandleFormulaGetters;
  /** If true, result will convert to number */
  toNumber?: boolean;
  /** If true, result will convert to boolean */
  toBoolean?: boolean;
  /** If given formula is empty, it will return options.defaultValue. */
  defaultValue?: PureValue | null;
};

function handleFormula(formulaStr: string, {
  vars = {},
  texts = {},
  methods = {},
  getters = {},
  toNumber = false,
  toBoolean = false,
  defaultValue = null,
}: HandleFormulaOptions = {}): PureValue {
  if (formulaStr === '') {
    if (defaultValue === null) {
      if (toNumber) {
        return 0;
      }
      if (toBoolean) {
        return false;
      }
      return '0';
    }
    return defaultValue;
  }
  const originalFormulaStr = formulaStr;

  const gettersMap = getGettersMap<string | number>(getters);
  const gettersMethodsRoot = '__HANDLE_FORMULA_GETTERS__';
  const gettersAry = varMapToArray(gettersMap);
  gettersAry.forEach(([key]) => {
    // convert to method
    const methodName = `${gettersMethodsRoot}['${key}']`;
    formulaStr = formulaStr.replace(handleReplacedKey(key), `${methodName}()`);
  });

  // replace '--' to '+', '--+' to '+', etc...
  formulaStr = formulaStr.replace(/-{2,}/g, match => match.length % 2 === 0 ? '+' : '-');

  const textsMap = getVarsMap<string>(texts);
  const getTextVarName = (value: number) => `__HANDLE_FORMULA_TEXT_${value}__`;
  const textsAry = varMapToArray(textsMap);
  textsAry.forEach(([key], idx) => {
    formulaStr = formulaStr.replace(handleReplacedKey(key), getTextVarName(idx));
  });

  if (gettersAry.length !== 0) {
    methods[gettersMethodsRoot] = getters;
  }

  if (!isNumberString(formulaStr)) {
    try {
      formulaStr = parseFormula(formulaStr, {
        vars: { ...vars, ...methods },
      }).toString();
    } catch (error) {
      console.groupCollapsed('[parse formula] Unable to parse formula:');
      console.warn(originalFormulaStr);
      console.log('Current: ', formulaStr);
      console.log({ vars, texts, methods, getters });
      console.warn(error);
      console.groupEnd();
      return '0';
    }
  }

  formulaStr = formulaStr
    .replace(/^(-?\d+(?:\.\d+)?)([*/])(-?\d+(?:\.\d+)?)/g, (match, left, operator, right) => {
      left = parseFloat(left);
      right = parseFloat(right);
      return calcNumberBinaryExpression(left, operator, right).toString();
    })
    .replace(/([^/\d])(-?\d+(?:\.\d+)?)([*/])(-?\d+(?:\.\d+)?)/g, (match, pre,  left, operator, right) => {
      left = parseFloat(left);
      right = parseFloat(right);
      return pre + calcNumberBinaryExpression(left, operator, right).toString();
    })
    .replace(/(-?\d+(?:\.\d+)?)([+-])(-?\d+(?:\.\d+)?)/g, (match, left, operator, right) => {
      left = parseFloat(left);
      right = parseFloat(right);
      return calcNumberBinaryExpression(left, operator, right).toString();
    });

  textsAry.forEach(([key], idx) => {
    formulaStr = formulaStr.replace(new RegExp(getTextVarName(idx), 'g'), textsMap.get(key) as string);
  });

  if (toNumber && typeof formulaStr === 'string') {
    const num = parseFloat(formulaStr);
    return Number.isNaN(num) ? 0 : num;
  }

  if (toBoolean) {
    if (typeof formulaStr === 'string') {
      return formulaStr === 'true' ? true : false;
    }
    return !!formulaStr;
  }

  return formulaStr;
}

// console.log(handleFormula('test.a.c(123)', {
//   methods: {
//     test: {
//       a: {
//         c: (value: number) => value * 100,
//       },
//     },
//   },
// }));

export { handleFormula };
export type { HandleFormulaVars, HandleFormulaTexts, HandleFormulaGetters };
