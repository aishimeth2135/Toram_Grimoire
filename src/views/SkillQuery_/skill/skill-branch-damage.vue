<template>
  <div>
    {{ displayData['name'] }}
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import type { Ref } from 'vue';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';

import RegisterLang from '@/setup/RegisterLang';

import DamageHandler from './branch-handlers/DamageHandler';

interface Prop {
  skillBranchItem: SkillBranchItem;
}

const props = defineProps<Prop>();
const { skillBranchItem } = toRefs(props) as { skillBranchItem: Ref<SkillBranchItem> };
const { lang, rootLang } = RegisterLang('Skill Query/Branch');

const displayData = computed(() => DamageHandler(skillBranchItem.value, { lang, rootLang }));
</script>
