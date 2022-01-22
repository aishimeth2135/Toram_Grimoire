import { markText } from '@/shared/utils/view'
import Grimoire from '@/shared/Grimoire'

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer'
import type { HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute'

import { cloneBranchAttrs, handleDisplayData } from './utils'
import MapContainer from './utils/MapContainer'
import type { HandleDisplayDataOptionFilters, HandleBranchLangAttrsMap } from './utils'
import ProrationHandler from './ProrationHandler'
import { createTagButtons } from '../../utils'

export default function DamageHandler<BranchItem extends SkillBranchItem>(branchItem: BranchItem) {
  const { t } = Grimoire.i18n

  const attrs = cloneBranchAttrs(branchItem, {
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
    'type': value => value !== 'single',
    'title':  value => value === 'normal_attack',
    'range_damage': value => value !== 'unused',
    'unsheathe_damage': value => value !== 'unused',
    'ailment_name': value => !!value,
  })
  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>({
    'multiplier': '%',
    'constant': null,
    'extra_constant': null,
    'frequency': t('global.times'),
    'ailment_chance': '%',
    'duration': null,
    'cycle': null,
  })
  if (branchItem.attr('target_offset') !== 'auto') {
    valueAttrsMap.append('target_offset')
  }
  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>([
    'damage_type',
    'type',
    'title',
    'element',
    'range_damage',
    'unsheathe_damage',
    'judgment',
    'frequency_judgment',
  ])

  const pureDatas = ['name', 'ailment_name', 'end_condition']

  if (attrs['base'] === 'auto') {
    const baseSuffix = branchItem.suffixBranches.find(bch => bch.name === 'base')
    if (baseSuffix) {
      if (baseSuffix.attr('type') !== 'custom') {
        attrs['@custom-base-caption'] = baseSuffix.attr('type')
        attrs['base'] = `@custom.${baseSuffix.attr('type')}`
        langAttrsMap.append('base')
        langAttrsMap.set('@custom-base-caption', {
          afterHandle: value => createTagButtons(markText(value, { mark: 'text-purple' })),
        })
      } else {
        if (baseSuffix.attr('title') === 'auto') {
          attrs['base'] = '@custom.default'
          langAttrsMap.append('base')
        } else {
          attrs['base'] = baseSuffix.attr('title')
          pureDatas.push('base')
        }
        if (baseSuffix.attr('caption')) {
          attrs['@custom-base-caption'] = baseSuffix.attr('caption')
          pureDatas.push('@custom-base-caption')
        }
      }
    } else {
      attrs['base'] = attrs['damage_type'] === 'physical' ? 'atk' : 'matk'
      langAttrsMap.append('base')
    }
  } else {
    langAttrsMap.append('base')
  }
  if (attrs['detail_display'] === 'auto') {
    attrs['detail_display'] = attrs['title'] === 'normal_attack' ? '0' : '1'
  }

  if (attrs['frequency_judgment'] === 'auto') {
    attrs['frequency_judgment'] = attrs['title'] !== 'each' ? 'single' : 'multiple'
  }

  const prorationBch = branchItem.suffixBranches.find(suf => suf.name === 'proration')
  if (prorationBch) {
    const _data = ProrationHandler(prorationBch);
    ['damage', 'proration', 'damage: title', 'proration: title'].forEach(key => {
      attrs['@proration/' + key] = _data.get(key)
    })
    pureDatas.push('@proration/damage', '@proration/damage: title', '@proration/proration', '@proration/proration: title')
  }

  const result = handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    pureDatas,
  })

  // result.value['@frequency-visible'] = branchItem.attrs['title'] === 'each' ? '1' : '0';

  return result
}
