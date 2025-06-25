<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { CharacterEquipment, EquipmentCrystal } from '@/lib/Character/CharacterEquipment'
import { StatRecorded, StatValueSourceTypes } from '@/lib/Character/Stat'
import { BagPotion } from '@/lib/Items/BagItem'
import { RegistletItemBase } from '@/lib/Registlet/RegistletItem'
import { SkillBranch, SkillBranchNames } from '@/lib/Skill/Skill'

interface Props {
  stat: StatRecorded
}

defineProps<Props>()

const { t } = useI18n()
</script>

<template>
  <div class="space-y-1 py-1 pl-2 pr-3 text-sm">
    <div v-for="(src, idx) in stat.sources" :key="idx" class="flex items-center space-x-2">
      <cy-icon icon="ic-round-add" small />
      <template v-if="src.type === StatValueSourceTypes.Skill">
        <div
          v-if="(src.src as SkillBranch).name === SkillBranchNames.Passive"
          class="text-primary-30"
        >
          {{ t('character-simulator.skill-build.passive-skills') }}
        </div>
        <div v-else class="text-primary-30">
          {{ t('character-simulator.skill-build.active-skills') }}
        </div>
        <div>
          {{ (src.src as SkillBranch).parent.parent.name }}
        </div>
      </template>
      <template v-else-if="src.type === StatValueSourceTypes.Equipment">
        <div class="text-orange-30">
          {{ t('common.Equipment.category.' + (src.src as CharacterEquipment).type) }}
        </div>
        <div>
          {{ (src.src as CharacterEquipment).name }}
        </div>
      </template>
      <template v-else-if="src.type === StatValueSourceTypes.Crystal">
        <div class="text-cyan-40">
          {{ t('character-simulator.character-stat-detail.crystal') }}
        </div>
        <div>
          {{ (src.src as EquipmentCrystal).name }}
        </div>
      </template>
      <div v-else-if="src.type === StatValueSourceTypes.Food" class="text-emerald-30">
        {{ t('character-simulator.character-stat-detail.food') }}
      </div>
      <template v-else-if="src.type === StatValueSourceTypes.Registlet">
        <div class="text-blue-40">
          {{ t('common.Registlet.title') }}
        </div>
        <div>{{ (src.src as RegistletItemBase).name }}</div>
      </template>
      <template v-else-if="src.type === StatValueSourceTypes.Potion">
        <div class="text-orange-30">
          {{ t('character-simulator.potion-build.potion') }}
        </div>
        <div>{{ (src.src as BagPotion).name }}</div>
      </template>
      <div class="text-primary-50">
        {{ stat.showValue(src.value) }}
      </div>
    </div>
  </div>
</template>
