import type { GetLangHandler } from '@/shared/services/Language';
import { markText } from '@/shared/utils/view';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import type { HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import { cloneBranchAttrs, handleDisplayData, createTagButtons } from './utils';
import MapContainer from './utils/MapContainer';
import type { HandleDisplayDataOptionFilters, HandleBranchLangAttrsMap } from './utils';
import ProrationHandler from './ProrationHandler';

export default function DamageHandler(branchItem: SkillBranchItem, { lang, rootLang }: {
  lang: GetLangHandler;
  rootLang: GetLangHandler;
}) {
  const filters = new MapContainer<HandleDisplayDataOptionFilters>({
    'constant': value => value !== '0',
    'multiplier': value => value !== '0',
    'extra_constant': value => value !== '0',
    'is_place': value => value !== '0',
    'frequency': value => value !== '1',
    'name': {
      validation: value => value !== '',
      defaultValue: lang('damage/base name'),
    },
    'base': value => value !== 'none',
    'element': value => value !== 'none',
    'type': value => value !== 'single',
    'title':  value => value !== 'normal_attack',
    'move_distance': value => !!value,
    'angel': value => !!value,
    'start_position_offsets': {
      validation: value => value !== '',
      calc: true,
    },
    'end_position_offsets': {
      validation: value => value !== '',
      calc: true,
    },
  });
  const valueAttrsMap = new MapContainer<HandleBranchValueAttrsMap>({
    'multiplier': '%',
    'constant': null,
    'extra_constant': null,
    'frequency': rootLang('global/times'),
    'ailment_chance': '%',
    'duration': null,
    'cycle': null,
    'radius': 'm',
    'angel': '°',
    'start_position_offsets': 'm',
    'end_position_offsets': 'm',
    'move_distance': 'm',
  });
  if (branchItem.attrs['target_offset'] !== 'auto') {
    valueAttrsMap.append('target_offset');
  }
  const langAttrsMap = new MapContainer<HandleBranchLangAttrsMap>(['damage_type', 'type', 'title', 'element']);

  const attrs = cloneBranchAttrs(branchItem);
  // const customDatas = {} as Record<string, string>;

  if (attrs['base'] === 'auto') {
    const baseSuffix = branchItem.suffixBranches.find(bch => bch.name === 'base');
    if (baseSuffix) {
      const baseSuffixAttrs = baseSuffix.attrs;
      if (baseSuffixAttrs['type'] !== 'custom') {
        attrs['@custom-base-caption'] = baseSuffixAttrs['type'];
        attrs['base'] = `@custom/${baseSuffixAttrs['type']}`;
        langAttrsMap.append('base');
        langAttrsMap.set('@custom-base-caption', {
          afterHandle: value => createTagButtons(markText(value, { mark: 'text-purple' })),
        });
      } else {
        if (baseSuffixAttrs['title'] === 'auto') {
          attrs['base'] = '@custom/default';
          langAttrsMap.append('base');
        } else {
          attrs['base'] = baseSuffixAttrs['title'];
        }
        if (baseSuffixAttrs['caption']) {
          attrs['@custom-base-caption'] = baseSuffixAttrs['caption'];
        }
      }
    } else {
      attrs['base'] = attrs['damage_type'] === 'physical' ? 'atk' : 'matk';
      langAttrsMap.append('base');
    }
  } else {
    langAttrsMap.append('base');
  }
  if (attrs['detail_display'] === 'auto') {
    attrs['detail_display'] = attrs['title'] === 'normal_attack' ? '0' : '1';
  }

  const labels = [
    'effective_area',
    'radius',
    'move_distance',
    'angle',
    'start_position_offsets',
    'end_position_offsets',
  ];

  const prorationBch = branchItem.suffixBranches.find(suf => suf.name === 'proration');
  if (prorationBch) {
    const _data = ProrationHandler(prorationBch, { lang });
    ['damage', 'proration', 'damage: title', 'proration: title'].forEach(key => {
      attrs['@proration/' + key] = _data.get(key);
    });
  }

  const result = handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap.value,
    langs: langAttrsMap.value,
    filters: filters.value,
    labels,
    langHandler: lang,
  });

  // result.value['@frequency-visible'] = branchItem.attrs['title'] === 'each' ? '1' : '0';

  return result;
}
