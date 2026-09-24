import type {
  HandleFormulaMethods,
  HandleFormulaTexts,
  HandleFormulaVars,
} from '@/shared/utils/data'

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
