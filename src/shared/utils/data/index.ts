import jsep from 'jsep'

import { isNumberString } from '@/shared/utils/string'

import { getVarsMap, getGettersMap, varMapToArray, handleReplacedKey, jsepTypes } from './utils'

function trimBrackets(value: string) {
  while (value[0] === '(' && value[value.length - 1] === ')') {
    value = value.slice(1, value.length - 1)
  }
  return value
}

type PureValue = string | number | boolean
type CommonValue = PureValue | boolean[] | string[] | number[]
type CommonFunction = (...args: any[]) => PureValue
type CommonValueExtended = CommonValue | CommonFunction
type ParseFormulaVars = {
  [key: string]: CommonValueExtended | ParseFormulaVars;
}

function calcNumberBinaryExpression(left: number, operator: string, right: number): number {
  if (operator === '+') {
    return left + right
  }
  if (operator === '-') {
    return left - right
  }
  if (operator === '*') {
    return left * right
  }
  if (operator === '/') {
    return left / right
  }
  return 0
}

interface ParseFormulaOptions {
  /** if true, formula will for compile and param vars will be ignore */
  compile?: string;
}

/**
 * Parse formula. Computed the literal and identifier of formula.
 *
 * #### ex1:
 *   formula: "100+30*2+(10+10)*2"
 *   => "200"
 * #### ex2:
 *   formula: "100+a*2+b*3"
 *   vars: { a: 60, b: "40" }  // b will be convert to number before calculate
 *   => "300"
 * #### ex3:
 *   formula: "100+50+abc+200*3"
 *   => "150+abc+600"
 * #### ex4:
 *   formula: func1(20, 30)+100
 *   vars: { func1: (value1, value2) => value1 + value2 }
 *   => "50+100"
 *   => "150"
 * #### ex5:
 *   formula: "20*5+func1(20, 3)+100+foo+20*a+user.func2(20*b, user.age)+func1(20, c)+func1(20, user.age*bar)"
 *   vars: {
 *     func1: (value1, value2) => value1 * value2
 *     a: 5,
 *     b: 2,
 *     user: {
 *       age: 10,
 *       func2: (value1, value2) => value + value2
 *     },
 *   }
 *   => "100+60+100+foo+100+50+200+func1(20, 10*bar)"
 *   => "260+foo+350+func1(20, 10*bar)"
 *
 * note: "window.Math" will auto inject to vars as "Math"
 *
 * @param formulaStr - formula to parse
 * @param vars - given variables, this function will try to look inside variables
 *               when metting identifier and replace identifier with value of variable.
 *               If not found, identifier will keep its name in returned formula.
 * @param options
 * @returns parse result of formula
 */
function parseFormula(formulaStr: string, vars: ParseFormulaVars = {}, options: ParseFormulaOptions = {}): PureValue {
  // inject Math
  vars.Math = window.Math as unknown as ParseFormulaVars

  const _options = options
  const unknowSnippet = (value: unknown) => typeof value === 'string'
  const handleArray = (ary: jsep.Expression[], parentNode: jsep.Expression): unknown[] => {
    return ary
      .map(arg => handle(arg, parentNode))
      .map(el => typeof el === 'string' && isNumberString(el) ? parseFloat(el) : el)
  }
  function handle(node: jsep.Expression, parentNode: jsep.Expression | null): CommonValueExtended | object {
    if (jsepTypes.isLiteral(node)) {
      if (typeof node.value === 'string') {
        return node.raw as PureValue
      }
      return node.value as PureValue
    }
    if (jsepTypes.isUnaryExpression(node)) {
      const arg = handle(node.argument, node)
      return typeof arg !== 'string' || isNumberString(arg) ?
        (arg as number) * -1 :
        '-' + handle(node.argument, node)
    }
    if (jsepTypes.isBinaryExpression(node)) {
      let left = handle(node.left, node) as (number | boolean)
      let right = handle(node.right, node) as (number | boolean)
      if (typeof left === 'string' && isNumberString(left)) {
        left = parseFloat(left)
      }
      if (typeof right === 'string' && isNumberString(right)) {
        right = parseFloat(right)
      }
      const operator = node.operator
      if (unknowSnippet(left) || unknowSnippet(right)) {
        return ((operator === '+' || operator === '-') && !(parentNode && jsepTypes.isBinaryExpression(parentNode) && (parentNode.operator === '+' || parentNode.operator === '-'))) ?
          `(${left}${operator}${right})` :
          `${left}${operator}${right}`
      }
      if (operator === '+' || operator === '-' || operator === '*' || operator === '/') {
        if (typeof left === 'boolean') {
          left = left ? 1 : 0
        }
        if (typeof right === 'boolean') {
          right = right ? 1 : 0
        }
        return calcNumberBinaryExpression(left, operator, right)
      }
      if (operator === '&&') {
        return left && right
      }
      if (operator === '||') {
        return left || right
      }
    }
    if (jsepTypes.isIdentifier(node)) {
      const isRoot = !parentNode || !jsepTypes.isMemberExpression(parentNode) || parentNode.object === node
      if (_options.compile) {
        return isRoot ? `${_options.compile}['${node.name}']` : `['${node.name}']`
      }
      if (node.name in vars && isRoot) {
        return vars[node.name]
      }
      return node.name
    }
    if (jsepTypes.isMemberExpression(node)) {
      const object = node.object
      const property = node.property
      const parent = handle(object, node) as (ParseFormulaVars | string)
      if (typeof parent !== 'string') {
        return parent[handle(property, node) as string]
      }
      const child = (handle(property, node) + '')
      if (isNumberString(child)) {
        return `${parent}[${child}]`
      }
      return `${parent}${child.startsWith('[') ? '' : '.'}${child}`
    }
    if (jsepTypes.isCallExpression(node)) {
      const args = handleArray(node.arguments, node)
      if (args.some(arg => unknowSnippet(arg))) {
        const chain = []
        let cur = node.callee
        while (jsepTypes.isMemberExpression(cur)) {
          chain.push(cur.computed ? cur.property.value : cur.property.name)
          cur = cur.object
        }
        chain.push(cur.name)
        if (options.compile) {
          chain.push(options.compile)
        }
        const argStrings = (args as PureValue[]).map(arg => trimBrackets(arg.toString()))
        const funcName = (chain.reverse() as string[])
          .map((item, idx) => {
            if (idx === 0) {
              return item
            }
            return options.compile ? `['${item}']` : `.${item}`
          }).join('')
        return `${funcName}(${argStrings.join(', ')})`
      }
      const callee = handle(node.callee, node) as (Function | string)
      if (typeof callee === 'string') {
        const argStrings = (args as PureValue[]).map(arg => trimBrackets(arg.toString()))
        return `${callee}(${argStrings.join(', ')})`
      }
      return callee(...args)
    }
    if (jsepTypes.isArrayExpression(node)) {
      const els: unknown[] = handleArray(node.elements, node)
      if (els.some(el => unknowSnippet(el))) {
        return `[${els.join(', ')}]`
      }
      return els
    }
    if (jsepTypes.isConditionalExpression(node)) {
      const test = handle(node.test, node)
      return handle(test ? node.consequent : node.alternate, node)
    }
    return 0
  }

  return handle(jsep(formulaStr), null) as PureValue
}

type HandleFormulaVars = {
  [key: string]: CommonValue | HandleFormulaVars;
}
type HandleFormulaTexts = {
  [key: string]: string | string[] | HandleFormulaTexts;
}
type HandleFormulaMethods = {
  [key: string]: CommonFunction | HandleFormulaMethods;
}
type HandleFormulaGetters = {
  [key: string]: (() => PureValue) | HandleFormulaGetters;
}

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
  /** The returned value when given formula is empty. */
  defaultValue?: PureValue | null;
}

const HANDLE_FORMULA_EXTRA_PATTERN_1 = /^(-?\d+(?:\.\d+)?)([*/])(-?\d+(?:\.\d+)?)/g
const HANDLE_FORMULA_EXTRA_PATTERN_2 = /([^/\d])(-?\d+(?:\.\d+)?)([*/])(-?\d+(?:\.\d+)?)/g

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
        return 0
      }
      if (toBoolean) {
        return false
      }
      return '0'
    }
    return defaultValue
  }
  const originalFormulaStr = formulaStr

  const gettersMap = getGettersMap<string | number>(getters)
  const gettersMethodsRoot = '__HANDLE_FORMULA_GETTERS__'
  const gettersAry = varMapToArray(gettersMap)
  gettersAry.forEach(([key]) => {
    // convert to method
    const methodName = `${gettersMethodsRoot}['${key}']`
    formulaStr = formulaStr.replace(handleReplacedKey(key), `${methodName}()`)
  })

  // replace '--' to '+', '--+' to '+', etc...
  formulaStr = formulaStr.replace(/-{2,}/g, match => match.length % 2 === 0 ? '+' : '-')

  const textsMap = getVarsMap<string>(texts)
  const getTextVarName = (value: number) => `__HANDLE_FORMULA_TEXT_${value}__`
  const textsAry = varMapToArray(textsMap)
  textsAry.forEach(([key], idx) => {
    formulaStr = formulaStr.replace(handleReplacedKey(key), getTextVarName(idx))
  })

  if (gettersAry.length !== 0) {
    methods[gettersMethodsRoot] = getters
  }

  if (!isNumberString(formulaStr)) {
    try {
      formulaStr = parseFormula(formulaStr, { ...vars, ...methods }).toString()
    } catch (error) {
      console.groupCollapsed('[parse formula] Unable to parse formula:')
      console.warn(originalFormulaStr)
      console.log('Current: ', formulaStr)
      console.log({ vars, texts, methods, getters })
      console.warn(error)
      console.groupEnd()
      return '0'
    }
  }

  /**
   * extra handling
   * ex: convert "角色STR*6/2" to "角色STR*3"
   */
  formulaStr = formulaStr
    .replace(HANDLE_FORMULA_EXTRA_PATTERN_1, (match, left, operator, right) => {
      left = parseFloat(left)
      right = parseFloat(right)
      return calcNumberBinaryExpression(left, operator, right).toString()
    })
    .replace(HANDLE_FORMULA_EXTRA_PATTERN_2, (match, pre,  left, operator, right) => {
      left = parseFloat(left)
      right = parseFloat(right)
      return pre + calcNumberBinaryExpression(left, operator, right).toString()
    })
  // .replace(/(-?\d+(?:\.\d+)?)([+-])(-?\d+(?:\.\d+)?)/g, (match, left, operator, right) => {
  //   left = parseFloat(left);
  //   right = parseFloat(right);
  //   return calcNumberBinaryExpression(left, operator, right).toString();
  // });

  if (toNumber && typeof formulaStr === 'string') {
    const num = parseFloat(formulaStr)
    return Number.isNaN(num) ? 0 : num
  }

  if (toBoolean) {
    if (typeof formulaStr === 'string') {
      return formulaStr === 'true' ? true : false
    }
    return !!formulaStr
  }

  formulaStr = trimBrackets(formulaStr)

  textsAry.forEach(([key], idx) => {
    formulaStr = formulaStr.replace(new RegExp(getTextVarName(idx), 'g'), textsMap.get(key) as string)
  })

  return formulaStr
}

const _computeFormulaCaches: Map<string, Function> = new Map()

/**
 * Compute given formula to pure value by "vars". (Suppose all variables exist in "vars")
 * note: the method will compile given formula by Function constructor.
 *
 * @param formula - formula to compute
 * @param vars - variables mapping
 * @param defaultValue - default return value if error
 * @returns result after computing formula
 */
function computeFormula(formula: string, vars: Record<string, any>, defaultValue: any = 0): unknown {
  // auto inject Math
  vars.Math = window.Math

  let handle: Function
  if (_computeFormulaCaches.has(formula)) {
    handle = _computeFormulaCaches.get(formula)!
  } else {
    const paramName = '__VARS__'
    const body = parseFormula(formula, {}, { compile: paramName })
    let func: Function
    try {
      func = new Function(paramName, `return (${body});`)
    } catch (error) {
      console.warn('[computeFormula] unknown error when try to create function.')
      console.log({
        origin: formula,
        body: body,
      })
      console.log(error)
      func = () => defaultValue
    }
    _computeFormulaCaches.set(formula, func)
    handle = func
  }
  try {
    return handle(vars) as unknown
  } catch (err) {
    return defaultValue
  }
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

// setTimeout(() => {
//   console.log(handleFormula('300*reduceValue(-#test)/100', {
//     vars: {
//       '#test': '-100',
//     },
//     methods: {
//       reduceValue: (value: number) => {
//         const neg = value < 0;
//         value = Math.abs(value);
//         let rate = 1, res = neg ? 100 : 0;
//         while (value !== 0) {
//           const fixedValue = Math.min(value, 50);
//           res = neg ? res * (100 + fixedValue) / 100 : res + fixedValue / rate;
//           value -= fixedValue;
//           rate *= 2;
//         }

//         return neg ? -1 * (res - 100) : res;
//       },
//     },
//   }));
// }, 3000);

// setTimeout(() => {
//   // const vars = {
//   //   foo: {
//   //     bar: {
//   //       test: (value: number) => value * 100,
//   //     },
//   //   },
//   //   test: {
//   //     aa: {
//   //       bb: {
//   //         cc: 100,
//   //       },
//   //       cc: 23,
//   //     },
//   //   },
//   // }
//   console.log(parseFormula('foo.bar.test(10) + Math.floor(123) + test.aa.bb.cc + 50 + test.aa.cc', {}, { compile: '__VARS__' }))
// }, 1000)

export { handleFormula, computeFormula }
export type { HandleFormulaVars, HandleFormulaTexts, HandleFormulaGetters, HandleFormulaMethods }
