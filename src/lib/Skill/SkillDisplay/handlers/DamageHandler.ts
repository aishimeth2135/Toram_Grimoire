import Grimoire from '@/shared/Grimoire'

import { SkillBranchNames } from '@/lib/Skill/Skill'
import {
  SkillBranchItem,
  type SkillBranchResultSource,
  SkillComputingContainer,
} from '@/lib/Skill/SkillComputing'

import type { HandleBranchTextPropsMap, HandleBranchValuePropsMap } from '../compute'
import ProrationHandler from './ProrationHandler'
import {
  type HandleBranchLangPropsMap,
  type HandleDisplayDataOptionFilters,
  cloneBranchProps,
  handleDisplayData,
} from './handle'
import MapContainer from './handle/MapContainer'

export default function DamageHandler<BranchItem extends SkillBranchItem>(
  computing: SkillComputingContainer,
  branchItem: BranchItem
) {
  const { t } = Grimoire.i18n

  const props = cloneBranchProps(branchItem, {
    name: t('skill-query.branch.damage.base-name'),
  })

  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    constant: value => value !== '0',
    multiplier: value => value !== '0',
    extra_constant: value => value !== '0',
    is_place: value => value === '1',
    frequency: value => value !== '1',
    base: value => value !== 'none',
    element: value => value !== 'none',
    dual_element: value => value !== 'none',
    type: value => value !== 'single',
    title: value => value === 'normal_attack',
    range_damage: value => value !== 'unused',
    unsheathe_damage: value => value !== 'unused',
    judgment: value => value !== 'none',
    ailment_name: value => !!value,
    frequency_judgment: value => value !== 'none',
    combo_rate: value => value === '0',
  })
  const valuePropsMap = new MapContainer<HandleBranchValuePropsMap>({
    multiplier: '%',
    constant: null,
    extra_constant: null,
    frequency: null,
    ailment_chance: '%',
    duration: null,
    cycle: null,
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

  const textPropsMap = new MapContainer<HandleBranchTextPropsMap>([])
  const pureDatas = ['name', 'ailment_name', 'end_condition']
  const sources: Record<string, SkillBranchResultSource[]> = {}

  if (props.get('base') === 'auto') {
    sources.base = [{ branch: branchItem, key: 'base' }]
    const baseSuffix = branchItem.suffixBranches.find(bch => bch.is(SkillBranchNames.Base))
    if (baseSuffix) {
      sources.base.push({ branch: baseSuffix, key: 'type' }, { branch: baseSuffix, key: 'title' })
      sources['@custom-base-caption'] = [
        { branch: baseSuffix, key: baseSuffix.prop('type') === 'custom' ? 'caption' : 'type' },
      ]

      if (baseSuffix.prop('type') !== 'custom') {
        props.set('@custom-base-caption', baseSuffix.prop('type'))
        props.set('base', `@custom.${baseSuffix.prop('type')}`)
        langAttrsMap.append('base')
        langAttrsMap.set('@custom-base-caption', { handleAsText: true })
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
          textPropsMap.append('@custom-base-caption')
        }
      }
    } else {
      sources.base.push({ branch: branchItem, key: 'damage_type' })
      props.set('base', props.get('damage_type') === 'physical' ? 'atk' : 'matk')
      langAttrsMap.append('base')
    }
  } else {
    langAttrsMap.append('base')
  }

  if (props.get('frequency_judgment') === 'auto') {
    sources.frequency_judgment = [
      { branch: branchItem, key: 'frequency_judgment' },
      { branch: branchItem, key: 'title' },
    ]
    props.set('frequency_judgment', props.get('title') !== 'each' ? 'single' : 'multiple')
  }

  const result = handleDisplayData(computing, branchItem, props, {
    values: valuePropsMap.value,
    texts: textPropsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
    sources,
  })

  const prorationBranch = branchItem.suffixBranches.find(suffix =>
    suffix.is(SkillBranchNames.Proration)
  )
  if (prorationBranch) {
    const proration = ProrationHandler(computing, prorationBranch)
    for (const key of ['damage', 'proration']) {
      const item = proration.result(key)
      if (item) {
        result.setResult('@proration/' + key, item, proration.title(key))
      }
    }
  }
  return result
}
