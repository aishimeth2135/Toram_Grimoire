<template>
  <div>
    <SkillBranchLayoutNormal :container="container">
      <template #title>
        <cy-icon-text
          class="mr-3"
          icon="ri-sword-fill"
          text-color="purple"
        >
          {{ container.get('name') }}
        </cy-icon-text>
        <div class="detail">
          <span class="prop">{{ container.get('damage_type') }}</span>
          <span v-if="container.get('type')" class="prop">
            {{ container.get('type') }}
          </span>
        </div>
      </template>
      <SkillDamageFormula :container="container" />
    </SkillBranchLayoutNormal>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRefs } from 'vue';
import type { Ref } from 'vue';

import { SkillBranchItem } from '@/lib/Skill/SkillComputingContainer';

import RegisterLang from '@/setup/RegisterLang';

import DamageHandler from './branch-handlers/DamageHandler';
import SkillBranchLayoutNormal from './layouts/skill-branch-layout-normal.vue';
import SkillDamageFormula from './layouts/skill-damage-formula.vue';

interface Prop {
  skillBranchItem: SkillBranchItem;
}

const props = defineProps<Prop>();
const { skillBranchItem } = toRefs(props) as { skillBranchItem: Ref<SkillBranchItem> };
const { lang, rootLang } = RegisterLang('Skill Query/Branch');

const container = computed(() => DamageHandler(skillBranchItem.value, { lang, rootLang }));
</script>
