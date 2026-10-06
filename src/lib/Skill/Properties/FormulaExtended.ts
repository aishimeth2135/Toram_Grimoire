import Grimoire from '@/shared/Grimoire'
import type {
  HandleFormulaMethods,
  HandleFormulaTexts,
  HandleFormulaVars,
} from '@/shared/utils/data'

const FORMULA_REPLACED_VARS = [
  'BSTR',
  'BINT',
  'BAGI',
  'BVIT',
  'BDEX',
  'TEC',
  'CRT',
  'LUK',
  'MEN',
  'STR',
  'INT',
  'AGI',
  'VIT',
  'DEX',
  'shield_refining',
  'dagger_atk',
  'target_def',
  'target_level',
  'guard_power',
] as const

export function getFormulaReplacedTexts(): HandleFormulaTexts {
  return Object.fromEntries(
    FORMULA_REPLACED_VARS.map(name => [
      `$${name}`,
      Grimoire.i18n.t(`skill-query.branch.formula-replaced-text.${name}`),
    ])
  )
}

export interface FormulaExtendedData {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods?: HandleFormulaMethods
}

interface FormulaExtendedTarget {
  vars: HandleFormulaVars
  texts: HandleFormulaTexts
  methods: HandleFormulaMethods
}

export function mergeFormulaExtendedData(
  target: FormulaExtendedTarget,
  source: FormulaExtendedData
): void {
  Object.assign(target.vars, source.vars)
  Object.assign(target.texts, source.texts)
  if (source.methods) {
    Object.assign(target.methods, source.methods)
  }
}
