import Grimoire from '@/shared/Grimoire'

import {
  SkillBranchItem,
  SkillComputingContainer,
  resolveStackDefaultValue,
  resolveStackName,
} from '@/lib/Skill/SkillComputing'

import type { HandleBranchValuePropsMap } from '../compute'
import { type HandleDisplayDataOptionFilters, cloneBranchProps, handleDisplayData } from './handle'
import MapContainer from './handle/MapContainer'

export default function StackHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    name: () => resolveStackName(branchItem, t('skill-query.branch.stack.base-name')),
  })

  props.set('default', resolveStackDefaultValue(props))
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    max: value => !!value,
  })
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>(['min', 'max'])
  const pureValues = ['default', 'step']
  const pureDatas = ['name', 'unit']

  return handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    filters: filters.value,
    pureValues,
    pureDatas,
    sources:
      branchItem.prop('default') === 'auto'
        ? {
            default: [
              { branch: branchItem, key: 'default' },
              { branch: branchItem, key: 'min' },
            ],
          }
        : {},
  })
}
