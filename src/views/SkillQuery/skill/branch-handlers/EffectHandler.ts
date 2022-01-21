import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchTextAttrsMap, HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import { cloneBranchAttrs, handleDisplayData } from './utils'
import type { HandleBranchLangAttrsMap, HandleDisplayDataOptionFilters } from './utils'
import MapContainer from './utils/MapContainer'

export default function EffectHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const attrs = cloneBranchAttrs(branchItem, {
    name: t('skill-query.branch.effect.base-name'),
  })

  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>({
    radius: 'm',
    duration: {
      beforeHighlight: value => t('skill-query.branch.duration-caption', { duration: value }),
    },
  })
  const textAttrsMap = new MapContainer<HandleBranchTextAttrsMap>(['caption', 'condition', 'end_condition'])
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
  if (['auto', 'hit'].includes(attrs['condition'])) {
    if (attrs['condition'] === 'auto' && branchItem.realName === SkillBranchNames.Next) {
      attrs['condition'] = '@next'
    }
    langAttrsMap.append('condition')
  }

  const pureDatas = ['name', 'target']

  return handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    texts: textAttrsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })
}
