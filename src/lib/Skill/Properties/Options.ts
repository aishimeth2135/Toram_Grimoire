import Grimoire from '@/shared/Grimoire'
import { isNumberString } from '@/shared/utils/string'

import { ResultContainerTypes } from '../../common/ResultContainer'
import { SkillBranchNames } from '../Skill'
import { SkillBranchItemSuffix } from '../SkillComputing/SkillBranchItem'
import { SkillBranchResult } from '../SkillComputing/SkillBranchResult'
import { normalizeBooleanProperty } from './Boolean'
import { type ComputedBranchHelperResult, computeBranchValue } from './Formula'

interface OptionsPropertyConfig {
  rootKey?: SkillBranchNames
  type?: 'auto' | 'normal' | 'value' | 'boolean'
  afterHandle?: ((value: string) => string) | null
  handleAsText?: boolean
}

export interface OptionsPropertyMap {
  [key: string]: OptionsPropertyConfig | null
}

export type OptionsPropertyResults<PropertyMap extends OptionsPropertyMap> = {
  [key in keyof PropertyMap]: SkillBranchResult
}

export function handleOptionsProperties<PropertyMap extends OptionsPropertyMap>(
  helper: ComputedBranchHelperResult,
  properties: Map<string, string>,
  propertyMap: PropertyMap
): OptionsPropertyResults<PropertyMap> {
  const { t } = Grimoire.i18n
  const { branchItem } = helper
  const results = {} as Record<keyof PropertyMap, SkillBranchResult>

  ;(Object.keys(propertyMap) as (keyof PropertyMap)[]).forEach(propertyKey => {
    const {
      type = 'auto',
      rootKey,
      afterHandle = null,
    } = (propertyMap[propertyKey] || {}) as OptionsPropertyConfig
    const value = properties.get(propertyKey as string)
    if (!value) {
      return
    }

    let resultValue = value
    let displayValue: string
    if (type === 'value') {
      const computedValue = computeBranchValue(value, helper)
      const sign =
        isNumberString(computedValue) && parseFloat(computedValue) < 0 ? 'negative' : 'positive'
      const normalizedValue = sign === 'negative' ? -1 * parseFloat(computedValue) : computedValue
      displayValue = t(
        `skill-query.branch.${rootKey ?? branchItem.name}.${String(propertyKey)}.${sign}`,
        { value: normalizedValue.toString() }
      )
      resultValue = computedValue
    } else {
      const normalizedValue =
        type === 'auto' || type === 'boolean' ? normalizeBooleanProperty(value) : value
      let translationRoot: string
      if (rootKey) {
        translationRoot = rootKey
      } else {
        translationRoot = branchItem.name
        if (branchItem instanceof SkillBranchItemSuffix) {
          translationRoot = branchItem.mainBranch.name + ': ' + translationRoot
        }
      }
      const translatedValue = t(
        `skill-query.branch.${translationRoot}.${String(propertyKey)}.${normalizedValue}`
      )
      displayValue = afterHandle ? afterHandle(translatedValue) : translatedValue
    }

    const result = SkillBranchResult.create(
      ResultContainerTypes.String,
      branchItem,
      propertyKey as string,
      value,
      resultValue
    )
    result.initDisplayValue(displayValue)
    results[propertyKey] = result
  })

  return results
}
