<template>
  <div class="flex flex-col items-center w-28">
    <div class="w-full flex justify-center relative">
      <div
        class="combo-skill-circle"
        :class="{
          'combo-skill-invalid': !comboSkillState.valid && currentSkill,
          'has-skill': !!currentSkill,
        }"
        @click="selectComboSkill(comboSkillState.comboSkill)"
      >
        <cy-icon-text
          v-if="currentSkill"
          :icon="skillIconPath!"
          icon-src="image"
          icon-width="2.5rem"
          class="cursor-pointer"
          :class="{ 'opacity-50': !comboSkillState.valid }"
        />
      </div>
      <cy-button-icon
        icon="mdi:delete-outline"
        class="absolute top-0 right-0"
        @click="comboSkillState.comboSkill.remove()"
      />
    </div>
    <div v-if="currentSkill && comboSkillState.valid" class="mt-2 flex flex-col items-center">
      <div class="mb-2">
        <cy-options
          v-model:value="comboSkillState.comboSkill.tag/* eslint-disable-line vue/no-mutating-props */"
          :options="ComboSkillTagOptions"
        >
          <template #title="{ shown }">
            <cy-button-circle
              :selected="shown"
              small
              :icon="getTagIcon(comboSkillState.comboSkill.tag)"
            />
          </template>
          <template #item="{ id, value }">
            <cy-icon-text :icon="getTagIcon(value)">{{ t('character-simulator.combo.tags.' + id) }}</cy-icon-text>
          </template>
        </cy-options>
      </div>
      <div class="text-red">{{ comboSkillState.rate }}%</div>
      <div class="text-water-blue">{{ comboSkillState.mpCost }}</div>
      <div v-if="damageRatio !== null" class="text-blue-purple">{{ damageRatio }}%</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'

import { ComboSkillState } from '@/lib/Character/CharacterCombo'
import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'
import { CharacterComboTags } from '@/lib/Character/CharacterCombo/enums'

import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  comboSkillState: ComboSkillState;
  damageRatio?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  damageRatio: null,
})

const { t } = useI18n()

const currentSkill = computed(() => props.comboSkillState.comboSkill.skill)

const ComboSkillTagOptions = [
  null,
  CharacterComboTags.Consecutive,
  CharacterComboTags.Smite,
  CharacterComboTags.Save,
  CharacterComboTags.Swift,
  CharacterComboTags.MindsEye,
  CharacterComboTags.Tough,
  CharacterComboTags.Tenacity,
  CharacterComboTags.Invincible,
  CharacterComboTags.Bloodsucker,
  CharacterComboTags.Reflection,
].map(value => ({
  id: value === null ? 'none' : value,
  value,
}))

const getTagIcon = (tag: CharacterComboTags | null) => {
  if (tag === null) {
    return 'mdi:selection-ellipse'
  }
  const idx = ComboSkillTagOptions.findIndex(item => item.value === tag)
  return idx > -1 ? `mdi:numeric-${idx + 1}-circle-outline` : 'mdi:selection-ellipse'
}

const skillIconPath = computed(() => currentSkill.value ? getSkillIconPath(currentSkill.value) : null)

const { selectComboSkill } = inject(CharacterSimulatorInjectionKey)!
</script>

<style lang="postcss" scoped>
.combo-skill-circle {
  @apply
    w-12 h-12
    bg-white
    border-1 rounded-full border-light-2 hover:border-light-3
    flex items-center justify-center
    cursor-pointer duration-200;

  &.has-skill:not(.combo-skill-invalid) {
    background: linear-gradient(to bottom, #fff, #ffd1ea, #ff9ed3);
  }

  &.combo-skill-invalid {
    @apply bg-white;
  }
}
</style>
