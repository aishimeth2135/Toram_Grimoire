import {
  SkillBranchItem,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputing'
import type { HandleBranchValuePropsMap } from '@/lib/Skill/SkillComputing/compute'

import {
  HandleBranchLangPropsMap,
  HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import MapContainer from './handle/MapContainer'

export default function BasicHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const props = cloneBranchProps(branchItem)

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    mp_cost: value => !!value,
    range: value => !!value,
    skill_type: value => !!value,
    in_combo: value => !!value,
    action_time: value => !!value,
    casting_time: value => !!value,
  })
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>({
    casting_time: 's',
  })
  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>({
    skill_type: { type: 'normal' },
    in_combo: { type: 'normal' },
    action_time: { type: 'normal' },
  })

  if (props.get('mp_cost') !== '0') {
    valuePropsMap.append('mp_cost')
  } else {
    langAttrsMap.set('mp_cost', { type: 'normal' })
  }
  if (['main', 'magic_device', 'katana'].includes(props.get('range')!)) {
    langAttrsMap.append('range')
  } else if (props.get('range') === 'no_limit') {
    langAttrsMap.append('range')
  } else {
    valuePropsMap.set('range', 'm')
  }
  const titles = [
    'mp_cost',
    'range',
    'skill_type',
    'in_combo',
    'action_time',
    'casting_time',
  ]

  return handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    titles,
  })
}
