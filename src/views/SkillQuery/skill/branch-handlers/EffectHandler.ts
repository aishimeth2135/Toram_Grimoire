import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextPropsMap, HandleBranchValuePropsMap } from '@/lib/Skill/SkillComputingContainer/compute'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import { cloneBranchProps, handleDisplayData } from './utils'
import type { HandleBranchLangAttrsMap, HandleDisplayDataOptionFilters } from './utils'
import MapContainer from './utils/MapContainer'

export default function EffectHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    name: t('skill-query.branch.effect.base-name'),
  })

  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>({
    radius: 'm',
    duration: {
      beforeHighlight: value => t('skill-query.branch.duration-caption', { duration: value }),
    },
  })
  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>(['caption', 'condition', 'end_condition'])
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    caption: value => !!value,
    condition: value => value !== 'none',
    end_condition: value => !!value,
    type: value => value !== 'none',
    is_place: value => value !== '0',
    duration: value => value !== '0',
    target: value => !!value,
  })

  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['is_place', 'type'])
  if (['auto', 'hit'].includes(props['condition'])) {
    if (props['condition'] === 'auto' && branchItem.realName === SkillBranchNames.Next) {
      props['condition'] = '@next'
    }
    langAttrsMap.append('condition')
  }

  const pureDatas = ['name', 'target']

  return handleDisplayData(branchItem, props, {
    values: valuePropsMap.value,
    texts: textPropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })
}
