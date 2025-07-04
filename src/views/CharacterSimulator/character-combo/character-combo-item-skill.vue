<template>
  <div class="flex w-28 flex-col items-center">
    <div class="relative flex w-full justify-center">
      <div
        class="combo-skill-circle"
        :class="{
          'combo-skill-invalid': !comboSkillState.valid && currentSkill,
          'has-skill': !!currentSkill,
        }"
        @click="selectComboSkill(comboSkillState.comboSkill)"
      >
        <cy-icon
          v-if="currentSkill"
          :icon="skillIconPath!"
          width="2.5rem"
          class="cursor-pointer"
          :class="{ 'opacity-50': !comboSkillState.valid }"
        />
      </div>
      <cy-button-icon
        icon="mdi:delete-outline"
        class="absolute right-0 top-0"
        @click="comboSkillState.comboSkill.remove()"
      />
    </div>
    <div v-if="currentSkill && comboSkillState.valid" class="mt-2 flex flex-col items-center">
      <div class="mb-2">
        <cy-options
          v-model:value="
            /* eslint-disable-next-line vue/no-mutating-props */
            comboSkillState.comboSkill.tag
          "
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
            <cy-icon-text :icon="getTagIcon(value)">{{
              t('character-simulator.combo.tags.' + id)
            }}</cy-icon-text>
          </template>
        </cy-options>
      </div>
      <div class="text-red-60">{{ comboSkillState.rate }}%</div>
      <div class="text-blue-60">{{ comboSkillState.mpCost }}</div>
      <div v-if="damageRatio !== null" class="text-violet-60">{{ damageRatio }}%</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterComboTags, type ComboSkillState } from '@/lib/Character/CharacterCombo'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import { useCharacterSimulatorState } from '../setup'

interface Props {
  comboSkillState: ComboSkillState
  damageRatio?: number | null
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

const skillIconPath = computed(() =>
  currentSkill.value ? getSkillIconPath(currentSkill.value) : null
)

const { selectComboSkill } = useCharacterSimulatorState()
</script>

<style scoped>
@reference "@/tailwind.css";

.combo-skill-circle {
  @apply flex h-12 w-12 cursor-pointer items-center justify-center rounded-full border-1 border-primary-30 bg-white duration-200 hover:border-primary-50;

  &.has-skill:not(.combo-skill-invalid) {
    background: linear-gradient(to bottom, #fff, #ffd1ea, #ff9ed3);
  }

  &.combo-skill-invalid {
    @apply bg-white;
  }
}
</style>
