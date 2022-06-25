<template>
  <div class="flex flex-col items-center w-32">
    <div class="flex">
      <div
        class="w-12 h-12 border-1 rounded-full border-light hover:border-light-2 flex items-center justify-center cursor-pointer duration-200"
        @click="selectComboSkill(comboSkillState.comboSkill)"
      >
        <cy-icon-text
          v-if="currentSkill"
          :icon="skillIconPath!"
          icon-src="image"
          icon-width="2.75rem"
          class="cursor-pointer"
        />
      </div>
      <cy-popover v-if="currentSkill">
        <cy-button-icon icon="mdi-sword" />
        <template #popper>
          <div v-if="currentSkill && skillResultsState" class="p-3">
            <div class="mb-2">
              <cy-icon-text small text-color="purple">{{ currentSkill.name }}</cy-icon-text>
            </div>
            <div>
              <CharacterDamageSkillResultItem
                v-for="result in skillResultsState.results"
                ref="resultItemRefs"
                :key="result.container.instanceId"
                :result="result"
              />
            </div>
          </div>
        </template>
      </cy-popover>
    </div>
    <div v-if="currentSkill" class="mt-2 flex flex-col items-center">
      <div>
        <cy-options
          v-model:value="comboSkillState.comboSkill.tag/* eslint-disable-line vue/no-mutating-props */"
          :options="ComboSkillTagOptions"
        >
          <template #title="{ shown }">
            <cy-button-action :selected="shown">
              <template v-if="comboSkillState.comboSkill.tag" #default>
                {{ t('character-simulator.combo.tags.' + comboSkillState.comboSkill.tag) }}
              </template>
            </cy-button-action>
          </template>
          <template #item="{ value }">
            <cy-icon-text>{{ t('character-simulator.combo.tags.' + value) }}</cy-icon-text>
          </template>
        </cy-options>
      </div>
      <div class="text-red">{{ comboSkillState.rate }}%</div>
      <div class="text-water-blue">{{ comboSkillState.mpCost }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, inject, ref, Ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillResultsState } from '@/stores/views/character/setup'

import { ComboSkillState } from '@/lib/Character/CharacterCombo'
import { getSkillIconPath } from '@/lib/Skill/utils/DrawSkillTree'
import { CharacterComboTags } from '@/lib/Character/CharacterCombo/enums'

import CharacterDamageSkillResultItem from '../character-damage/character-damage-skill-result-item.vue'

import { setupCharacterStore } from '../setup'
import { CharacterSimulatorInjectionKey } from '../injection-keys'

interface Props {
  comboSkillState: ComboSkillState;
}

const props = defineProps<Props>()

const { t } = useI18n()
const { store } = setupCharacterStore()

const currentSkill = computed(() => props.comboSkillState.comboSkill.skill)

const ComboSkillTagOptions = [
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
  id: value,
  value,
}))

const skillResultsState = computed(() => {
  const skill = currentSkill.value
  if (!skill) {
    return null
  }
  return (store.damageSkillResultStates as SkillResultsState[]).find(state => state.skill.skillId === skill.skillId) ?? null
})

const skillIconPath = computed(() => currentSkill.value ? getSkillIconPath(currentSkill.value) : null)

const resultItemRefs: Ref<(InstanceType<typeof CharacterDamageSkillResultItem>)[]> = ref([])

const expectedResultSum = computed(() => {
  return resultItemRefs.value
    .filter(item => item.valid)
    .reduce((cur, item) => cur + item.expectedResult, 0)
})

const { selectComboSkill } = inject(CharacterSimulatorInjectionKey)!

defineExpose({
  expectedResultSum,
})
</script>
