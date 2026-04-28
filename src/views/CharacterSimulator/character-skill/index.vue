<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useCharacterStore } from '@/stores/views/character'
import { useCharacterSkillBuildStore } from '@/stores/views/character/skill-build'

import Notify from '@/shared/setup/Notify'
import Cyteria from '@/shared/utils/Cyteria'

import { SkillBuild, decodeSkillBuild, encodeSkillBuild } from '@/lib/Character/SkillBuild'
import { SkillTypes } from '@/lib/Skill/Skill'

import { CharacterSimulatorRouteNames } from '@/router/Character'

import CommonBuildPage from '../common/common-build-page.vue'
import CharacterSkillPreviewTab from './character-skill-preview-tab/character-skill-preview-tab.vue'
import CharacterSkillTab from './character-skill-tab/index.vue'

defineOptions({
  name: 'CharacterSkill',
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { notify } = Notify()

const currentTab = ref(2)

const characterStore = useCharacterStore()

const skillStore = useCharacterSkillBuildStore()
const { skillBuilds, currentSkillBuild: selectedBuild } = storeToRefs(skillStore)

const currentSkillBuild = computed(() => characterStore.currentCharacterState.skillBuild)

const buildMatched = computed(() => selectedBuild.value === currentSkillBuild.value)

const currentDisplayedTab = computed(() => (buildMatched.value ? currentTab.value : 2))

const addSkillBuild = () => {
  selectedBuild.value = skillStore.createSkillBuild()
}

const shareUrl = computed(() => {
  const encoded = encodeSkillBuild(selectedBuild.value!)
  const resolved = router.resolve({
    name: CharacterSimulatorRouteNames.Skill,
    query: { build: encoded },
  })
  return window.location.origin + resolved.href
})

const copyShareUrl = () => {
  if (Cyteria.copyToClipboard(shareUrl.value)) {
    notify(t('character-simulator.skill-build.share-url-copied'))
  }
}

const removeSkillBuild = () => {
  if (!selectedBuild.value) {
    return
  }
  const idx = skillStore.removeSkillBuild(selectedBuild.value)
  selectedBuild.value = skillBuilds.value[idx]
}

onMounted(() => {
  const encoded = route.query.build
  if (typeof encoded !== 'string') {
    return
  }
  router.replace({ query: {} })
  const data = decodeSkillBuild(encoded)
  if (!data) {
    notify(t('character-simulator.skill-build.share-url-load-failed'))
    return
  }
  const build = SkillBuild.load(null, data)
  skillStore.appendSkillBuild(build, false)
  selectedBuild.value = build
  notify(t('character-simulator.skill-build.share-url-loaded'))
})
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
      <div class="mb-1">
        <cy-button-action icon="mdi:link-variant" @click="copyShareUrl">
          {{ t('character-simulator.skill-build.share-url-button') }}
        </cy-button-action>
      </div>
      <cy-tabs :model-value="currentDisplayedTab" @update:model-value="currentTab = $event">
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
          :type="currentDisplayedTab === 0 ? SkillTypes.Active : SkillTypes.Passive"
        />
        <CharacterSkillPreviewTab v-else :skill-build="selectedBuild" />
      </div>
    </template>
  </CommonBuildPage>
  <cy-default-tips v-else>
    {{ t('character-simulator.skill-build.no-any-build-tips') }}
  </cy-default-tips>
</template>
