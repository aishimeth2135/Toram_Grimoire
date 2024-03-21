<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { SkillTypes } from '@/lib/Skill/Skill'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterSkillPreviewTab from './character-skill-preview-tab/character-skill-preview-tab.vue'
import CharacterSkillTab from './character-skill-tab/index.vue'

import { setupCharacterSkillBuildStore } from '../setup'

defineOptions({
  name: 'CharacterSkill',
})

const { t } = useI18n()

const currentTab = ref(0)

const characterStore = useCharacterStore()

const { skillBuilds, currentSkillBuild } = setupCharacterSkillBuildStore()

const selectedBuild = ref(currentSkillBuild.value) as Ref<SkillBuild | null>

const buildMatched = computed(
  () => selectedBuild.value === currentSkillBuild.value
)

const currentDisplayedTab = computed(() =>
  buildMatched.value ? currentTab.value : 2
)
</script>

<template>
  <CommonBuildPage
    v-if="selectedBuild"
    v-model:selected-build="selectedBuild"
    v-model:builds="skillBuilds"
    :current-build="currentSkillBuild"
    builds-readonly
    @select-build="characterStore.setCharacterSkillBuild"
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
      <div class="overflow-x-auto py-4">
        <div style="min-width: 25rem">
          <CharacterSkillTab
            v-if="currentDisplayedTab !== 2"
            :skill-build="selectedBuild"
            :type="
              currentDisplayedTab === 0 ? SkillTypes.Active : SkillTypes.Passive
            "
          />
          <CharacterSkillPreviewTab v-else :skill-build="selectedBuild" />
        </div>
      </div>
    </template>
  </CommonBuildPage>
  <cy-default-tips v-else>
    {{ t('character-simulator.skill-build.no-any-build-tips') }}
  </cy-default-tips>
</template>
