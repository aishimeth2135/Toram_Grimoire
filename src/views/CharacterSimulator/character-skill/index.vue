<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import { SkillTypes } from '@/lib/Skill/Skill'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterSkillPreviewTab from './character-skill-preview-tab/character-skill-preview-tab.vue'
import CharacterSkillTab from './character-skill-tab/index.vue'

defineOptions({
  name: 'CharacterSkill',
})

const { t } = useI18n()

const currentTab = ref(2)

const characterStore = useCharacterStore()

const skillStore = useCharacterSkillBuildStore()
const { skillBuilds, currentSkillBuild: selectedBuild } =
  storeToRefs(skillStore)

const currentSkillBuild = computed(
  () => characterStore.currentCharacterState.skillBuild
)

const buildMatched = computed(
  () => selectedBuild.value === currentSkillBuild.value
)

const currentDisplayedTab = computed(() =>
  buildMatched.value ? currentTab.value : 2
)

const addSkillBuild = () => {
  selectedBuild.value = skillStore.createSkillBuild()
}

const removeSkillBuild = () => {
  if (!selectedBuild.value) {
    return
  }
  const idx = skillStore.removeSkillBuild(selectedBuild.value)
  selectedBuild.value = skillBuilds.value[idx]
}
</script>

<template>
  <CommonBuildPage
    v-if="selectedBuild"
    v-model:selected-build="selectedBuild"
    v-model:builds="skillBuilds"
    :current-build="currentSkillBuild"
    @select-build="characterStore.setCharacterSkillBuild"
    @add-build="addSkillBuild"
    @copy-build="skillStore.appendSkillBuild(selectedBuild.clone(), false)"
    @remove-build="removeSkillBuild"
  >
    <template #content>
      <cy-tabs
        :model-value="currentDisplayedTab"
        @update:model-value="currentTab = $event"
      >
        <cy-tab :value="0" :disabled="!buildMatched">
          {{ t('character-simulator.skill-build.active-skills') }}
        </cy-tab>
        <cy-tab :value="1" :disabled="!buildMatched">
          {{ t('character-simulator.skill-build.passive-skills') }}
        </cy-tab>
        <cy-tab :value="2">
          {{ t('character-simulator.skill-build.skills-preview') }}
        </cy-tab>
      </cy-tabs>
      <div class="min-w-[22.5rem] overflow-x-auto py-4">
        <CharacterSkillTab
          v-if="currentDisplayedTab !== 2"
          :skill-build="selectedBuild"
          :type="
            currentDisplayedTab === 0 ? SkillTypes.Active : SkillTypes.Passive
          "
        />
        <CharacterSkillPreviewTab v-else :skill-build="selectedBuild" />
      </div>
    </template>
  </CommonBuildPage>
  <cy-default-tips v-else>
    {{ t('character-simulator.skill-build.no-any-build-tips') }}
  </cy-default-tips>
</template>
