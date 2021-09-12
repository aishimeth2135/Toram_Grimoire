import { isNumberString } from '@/shared/utils/string';
import { getVarsMap, getGettersMap, varMapToArray, handleReplacedKey, jsepTypes } from './utils';

import jsep from 'jsep';

type ValidVarValue = string | number | Function;
type ParseFormulaVars = {
  [key: string]: ValidVarValue | ParseFormulaVars;
};
type ValidObjectVar = {
  [key: string]: ValidVarValue;
};

function parseFormula(formulaStr: string, { vars = {} }: { vars?: ParseFormulaVars } = {}): string | number {
  const unknowSnippet = (value: unknown) => typeof value === 'string';
  // const handleIdentifier = (node: jsep.Identifier, parent: object = null) => {
  //   if (parent === null) {
  //     if (window[node.name]) {
  //       return window[node.name];
  //     }
  //     return vars[node.name];
  //   }
  //   return parent[node.name];
  // };
  const handle = (node: jsep.Expression): ValidVarValue | object => {
    if (node.type === 'Literal') {
      return node.value as (number | string);
    }
    if (jsepTypes.isUnaryExpression(node)) {
      return jsepTypes.isLiteral(node.argument) ?
        (node.argument.value as number) * -1 :
        '-' + handle(node.argument);
    }
    if (jsepTypes.isBinaryExpression(node)) {
      const left = handle(node.left) as number;
      const right = handle(node.right) as number;
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
      // if (jsepTypes.isIdentifier(object)) {
      //   if (object.name in vars) {
      //     console.log(object, vars);
      //     return vars[object.name] as ValidVarValue;
      //   }
      //   if (object.name in window) {
      //     return vars[object.name] as ValidVarValue;
      //   }
      //   return property.name as string;
      // }
      const parent = handle(object) as (ValidObjectVar | string);
      if (typeof parent !== 'string') {
        return parent[handle(property) as string];
      }
      return `${parent}.${handle(property) as string}`;
      // if (!node.computed) {
      //   if (jsepTypes.isMemberExpression(node.object)) {
      //     return handleIdentifier(node.property, handle(node.object));
      //   }
      //   return handleIdentifier(node.property, handleIdentifier(node.object));
      // }
      // const parent = jsepTypes.isIdentifier(node.object) ? handleIdentifier(node.object) : handle(node.object);
      // return parent[handle(node.property)];
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
      const test = handleConditionalNode(node.test);
      return handle(test ? node.consequent : node.alternate);
    }
    return 0;
  };
  return handle(jsep(formulaStr)) as number | string;
}

function handleConditionalNode(rootNode: jsep.Expression): boolean {
  const handle = (node: jsep.Expression): boolean => {
    if (jsepTypes.isLiteral(node)) {
      return node.value as boolean;
    }
    if (jsepTypes.isBinaryExpression(node)) {
      const left = handle(node.left);
      const right = handle(node.right);
      const operator = node.operator;
      if (operator === '&&')
        return left && right;
      if (operator === '||')
        return left || right;
    }
    return false;
  };
  return handle(rootNode);
}

function parseConditional(formulaStr: string) {
  return handleConditionalNode(jsep(formulaStr));
}

type HandleFormulaVars = {
  [key: string]: number | string | HandleFormulaVars;
};
type HandleFormulaTexts = {
  [key: string]: string | HandleFormulaTexts;
};
type HandleFormulaMethods = {
  [key: string]: Function | HandleFormulaMethods;
};
type HandleFormulaGetters = {
  [key: string]: () => number | string | HandleFormulaGetters;
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

  /** If given formula is empty, it will return options.defaultValue. */
  defaultValue?: string | number | null;
};

function handleFormula(formulaStr: string, {
  vars = {},
  texts = {},
  methods = {},
  getters = {},
  toNumber = false,
  defaultValue = null,
}: HandleFormulaOptions = {}): number | string {
  if (formulaStr === '') {
    if (defaultValue === null) {
      return toNumber ? 0 : '0';
    }
    return defaultValue;
  }
  const originalFormulaStr = formulaStr;
  const varsMap = getVarsMap<string | number>(vars);
  const gettersMap = getGettersMap<string | number>(getters);

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

  const getTextVarName = (value: number) => `__HANDLE_FORMULA_TEXT_${value}__`;
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

  textKeys.forEach((key, idx) => {
    formulaStr = formulaStr.replace(new RegExp(getTextVarName(idx), 'g'), texts[key] as string);
  });

  if (toNumber && typeof formulaStr === 'string') {
    const num = parseFloat(formulaStr);
    return Number.isNaN(num) ? 0 : num;
  }

  return formulaStr;
}

type HandleConditionalVars = {
  [key: string]: boolean | HandleConditionalVars;
};

type HandleConditionalOptions = {
  /** mapping of vars */
  vars?: HandleConditionalVars;

  /** If given formula is undefined, it will return options.defaultValue. */
  defaultValue?: boolean;
};

function handleConditional(formulaStr: string, {
  vars = {},
  defaultValue = true,
}: HandleConditionalOptions = {}) {
  if (formulaStr === '') {
    return defaultValue;
  }
  const originalFormulaStr = formulaStr;

  const varsMap = getVarsMap<boolean>(vars);
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
    console.log(vars);
    console.warn(error);
    console.groupEnd();
  }
  return result;
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

export { handleConditional, handleFormula };
export type { HandleFormulaVars, HandleFormulaGetters, HandleConditionalVars };
