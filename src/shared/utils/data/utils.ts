import escapeStringRegexp from 'escape-string-regexp'
import jsep from 'jsep'

import type { HandleFormulaGetters, HandleFormulaVars } from './index'

type HandledVars = HandleFormulaVars
type HandledGetters = HandleFormulaGetters

/**
 * Unwrap vars to one layer mapping
 * ex:
 * {
 *   a: {
 *     b: 2,
 *     c: {
 *       d: 100
 *     }
 *   },
 *   e: 200,
 *   f: [2, 3]
 * }
 * will output
 * {
 *   'a.b.c.d': 100
 *   'a.b': 2,
 *   'e': 200
 *   'f[0]': 2,
 *   'f[1]': 3
 * }
 * @param vars - vars object
 * @returns one layer mapping with Map
 */
function getVarsMap<T>(vars: HandledVars): Map<string, T> {
  const varsMap = new Map()
  const handleVarsMapping = (prefix: string, target: HandledVars) => {
    Object.entries(target).forEach(([key, value]) => {
      const mapKey = `${prefix ? prefix + '.' : ''}${key}`
      if (value === null || value === undefined) {
        varsMap.set(mapKey, 0)
        console.warn(`[handle formula] vars: ${mapKey} is null or undefined`)
      } else if (typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach((el, idx) => varsMap.set(`${mapKey}[${idx}]`, el))
        } else {
          handleVarsMapping(mapKey, value)
        }
      } else {
        varsMap.set(mapKey, value)
      }
    })
  }
  handleVarsMapping('', vars)
  return varsMap
}

function getGettersMap<T>(getters: HandledGetters): Map<string, () => T> {
  const gettersMap = new Map()
  const handleGettersMapping = (prefix: string, target: HandledGetters) => {
    Object.entries(target).forEach(([key, value]) => {
      const mapKey = `${prefix ? prefix + '.' : ''}${key}`
      if (value === null || value === undefined) {
        gettersMap.set(mapKey, () => 0)
        console.warn(`[handle formula] vars: ${mapKey} is null or undefined`)
      } else if (typeof value === 'object') {
        handleGettersMapping(mapKey, value)
      } else if (typeof value === 'function') {
        gettersMap.set(mapKey, value)
      } else {
        gettersMap.set(mapKey, () => 0)
        console.warn(`[handle formula] getter: ${mapKey} is not function`)
      }
    })
  }
  handleGettersMapping('', getters)
  return gettersMap
}

/**
 * sort by key.length to handle longer var first
 */
function varMapToArray<T>(map: Map<string, T>) {
  return Array.from(map).sort(([keya], [keyb]) => keyb.length - keya.length)
}

function handleReplacedKey(key: string) {
  return new RegExp(`${escapeStringRegexp(key)}(?![a-zA-Z0-9_$'])`, 'g')
}

const jsepTypes = {
  isArrayExpression(node: jsep.Expression): node is jsep.ArrayExpression {
    return node.type === 'ArrayExpression'
  },
  isBinaryExpression(node: jsep.Expression): node is jsep.BinaryExpression {
    return node.type === 'BinaryExpression'
  },
  isCallExpression(node: jsep.Expression): node is jsep.CallExpression {
    return node.type === 'CallExpression'
  },
  isIdentifier(node: jsep.Expression): node is jsep.Identifier {
    return node.type === 'Identifier'
  },
  isLiteral(node: jsep.Expression): node is jsep.Literal {
    return node.type === 'Literal'
  },
  isMemberExpression(node: jsep.Expression): node is jsep.MemberExpression {
    return node.type === 'MemberExpression'
  },
  isUnaryExpression(node: jsep.Expression): node is jsep.UnaryExpression {
    return node.type === 'UnaryExpression'
  },
  isConditionalExpression(
    node: jsep.Expression
  ): node is jsep.ConditionalExpression {
    return node.type === 'ConditionalExpression'
  },
}

export {
  getVarsMap,
  getGettersMap,
  varMapToArray,
  handleReplacedKey,
  jsepTypes,
}
