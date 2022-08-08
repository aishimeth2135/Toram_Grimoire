import { markText } from '@/shared/utils/view'
import Grimoire from '@/shared/Grimoire'

import SkillComputingContainer, { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchValuePropsMap } from '@/lib/Skill/SkillComputingContainer/compute'
import { SkillBranchNames } from '@/lib/Skill/Skill/enums'

import { cloneBranchProps, handleDisplayData } from './utils'
import MapContainer from './utils/MapContainer'
import type { HandleDisplayDataOptionFilters, HandleBranchLangPropsMap } from './utils'
import ProrationHandler from './ProrationHandler'
import { createTagButtons } from '../../utils'

export default function DamageHandler<BranchItem extends SkillBranchItem>(computing: SkillComputingContainer, branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    name: t('skill-query.branch.damage.base-name'),
  })

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    'constant': value => value !== '0',
    'multiplier': value => value !== '0',
    'extra_constant': value => value !== '0',
    'is_place': value => value === '1',
    'frequency': value => value !== '1',
    'base': value => value !== 'none',
    'element': value => value !== 'none',
    'dual_element': value => value !== 'none',
    'type': value => value !== 'single',
    'title':  value => value === 'normal_attack',
    'range_damage': value => value !== 'unused',
    'unsheathe_damage': value => value !== 'unused',
    'judgment': value => value !== 'none',
    'ailment_name': value => !!value,
    'frequency_judgment': value => value !== 'none',
    'combo_rate': value => value === '0',
  })
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>({
    'multiplier': '%',
    'constant': null,
    'extra_constant': null,
    'frequency': t('global.times'),
    'ailment_chance': '%',
    'duration': null,
    'cycle': null,
  })
  if (branchItem.prop('target_offset') !== 'auto') {
    valuePropsMap.append('target_offset')
  }
  const langAttrsMap = new MapContainer<HandleBranchLangPropsMap>([
    'damage_type',
    'type',
    'title',
    'element',
    'dual_element',
    'range_damage',
    'unsheathe_damage',
    'judgment',
    'frequency_judgment',
    'is_place',
    'combo_rate',
  ])

  const pureDatas = ['name', 'ailment_name', 'end_condition']

  if (props.get('base') === 'auto') {
    const baseSuffix = branchItem.suffixBranches.find(bch => bch.is(SkillBranchNames.Base))
    if (baseSuffix) {
      if (baseSuffix.prop('type') !== 'custom') {
        props.set('@custom-base-caption', baseSuffix.prop('type'))
        props.set('base', `@custom.${baseSuffix.prop('type')}`)
        langAttrsMap.append('base')
        langAttrsMap.set('@custom-base-caption', {
          afterHandle: value => createTagButtons(markText(value, { mark: 'text-purple' })),
        })
      } else {
        if (baseSuffix.prop('title') === 'auto') {
          props.set('base', '@custom.default')
          langAttrsMap.append('base')
        } else {
          props.set('base', baseSuffix.prop('title'))
          pureDatas.push('base')
        }
        if (baseSuffix.prop('caption')) {
          props.set('@custom-base-caption', baseSuffix.prop('caption'))
          pureDatas.push('@custom-base-caption')
        }
      }
    } else {
      props.set('base', props.get('damage_type') === 'physical' ? 'atk' : 'matk')
      langAttrsMap.append('base')
    }
  } else {
    langAttrsMap.append('base')
  }
  if (props.get('detail_display') === 'auto') {
    props.set('detail_display', props.get('title') === 'normal_attack' ? '0' : '1')
  }

  if (props.get('frequency_judgment') === 'auto') {
    props.set('frequency_judgment', props.get('title') !== 'each' ? 'single' : 'multiple')
  }

  const prorationBch = branchItem.suffixBranches.find(suf => suf.is(SkillBranchNames.Proration))
  if (prorationBch) {
    const _data = ProrationHandler(computing, prorationBch);
    ['damage', 'proration', 'damage: title', 'proration: title'].forEach(key => {
      props.set('@proration/' + key, _data.get(key))
    })
    pureDatas.push('@proration/damage', '@proration/damage: title', '@proration/proration', '@proration/proration: title')
  }

  const result = handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })

  // result.value['@frequency-visible'] = branchItem.props['title'] === 'each' ? '1' : '0';

  return result
}
