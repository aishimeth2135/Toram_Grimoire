<template>
  <div>
    {{ displayData['name'] }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import type { Ref } from 'vue';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';
import type { HandleBranchValueAttrsMap } from '@/lib/Skill/SkillComputingContainer/compute';

import RegisterLang from '@/setup/RegisterLang';

import { cloneBranchAttrs, handleDisplayData, keysToAttrMap } from './utils';
import type { HandleDisplayDataOptionFilters, HandleBranchLangAttrsMap } from './utils';

interface Prop {
  skillBranchItem: SkillBranchItem;
}

const props = defineProps<Prop>();
const { skillBranchItem } = toRefs(props) as { skillBranchItem: Ref<SkillBranchItem> };

const { lang, rootLang } = RegisterLang('Skill Query/Branch');

const displayData = computed(() => {
  const branchItem = skillBranchItem.value;
  const filters = {
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
  } as HandleDisplayDataOptionFilters;
  const valueAttrsMap = {
    'multiplier': { beforeHighlight: value => value + '%' },
    'constant': null,
    'extra_constant': null,
    'frequency': { beforeHighlight: value => value + rootLang('global/times') },
    'ailment_chance': { beforeHighlight: value => value + '%' },
    'duration': null,
    'cycle': null,
    'radius': null,
    'angel': null,
    'start_position_offsets': null,
    'end_position_offsets': null,
    'move_distance': null,
  } as HandleBranchValueAttrsMap;
  if (branchItem.attrs['target_offset'] !== 'auto') {
    valueAttrsMap['target_offset'] = null;
  }
  const langAttrsMap = keysToAttrMap<HandleBranchLangAttrsMap>(['damage_type', 'type', 'title', 'element']);

  const attrs = cloneBranchAttrs(branchItem);
  // const customDatas = {} as Record<string, string>;

  if (attrs['base'] === 'auto') {
    const baseSuffix = branchItem.suffixBranches.find(bch => bch.name === 'base');
    if (baseSuffix) {
      const baseSuffixAttrs = baseSuffix.attrs;
      if (baseSuffixAttrs['type'] !== 'custom') {
        attrs['@custom-base-caption'] = baseSuffixAttrs['type'];
        attrs['base'] = `@custom/${baseSuffixAttrs['type']}`;
        langAttrsMap['base'] = null;
        langAttrsMap['@custom-base-caption'] = {
          afterHandle: value => value,
        };
        // langs.push('base', {
        //   name: '@custom-base-caption',
        //   afterHandle: v => this.createTagButtons(this.handleMarkText(v, 'text-purple')),
        // });
      } else {
        if (baseSuffixAttrs['title'] === 'auto') {
          attrs['base'] = '@custom/default';
          langAttrsMap['base'] = null;
        } else {
          attrs['base'] = baseSuffixAttrs['title'];
        }
        if (baseSuffixAttrs['caption']) {
          attrs['@custom-base-caption'] = baseSuffixAttrs['caption'];
        }
      }
    } else {
      attrs['base'] = attrs['damage_type'] === 'physical' ? 'atk' : 'matk';
      langAttrsMap['base'] = null;
    }
  }

  return handleDisplayData(branchItem, attrs, {
    values: valueAttrsMap,
    langs: langAttrsMap,
    filters,
    langHandler: lang,
  });
});
</script>
