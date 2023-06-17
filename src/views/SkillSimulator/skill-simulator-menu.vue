<template>
  <AppLayoutBottom>
    <template #default>
      <div class="flex items-center space-x-2 px-2">
        <cy-button-plain
          :icon="mode === 'skill' ? 'bx:bxs-book-bookmark' : 'bx:bx-star'"
          @click="mode = mode === 'skill' ? 'star-gem' : 'skill'"
        >
          {{
            mode === 'skill'
              ? t('skill-simulator.skill-level')
              : t('skill-simulator.star-gem-level')
          }}
        </cy-button-plain>
        <cy-button-plain
          :icon="`mdi:numeric-${levelUnit}-circle-outline`"
          @click="toggleLevelUnit"
        >
          {{ `Lv.${levelUnit}` }}
        </cy-button-plain>
        <cy-button-plain
          :icon="
            increase
              ? 'ic:round-add-circle-outline'
              : 'ic:round-remove-circle-outline'
          "
          @click="increase = !increase"
        >
          {{
            increase
              ? t('skill-simulator.increase-level')
              : t('skill-simulator.decrease-level')
          }}
        </cy-button-plain>
      </div>
    </template>
    <template v-if="currentSkillBuild" #side-buttons>
      <cy-button-circle
        icon="ic:baseline-settings"
        color="bright"
        float
        toggle
        :selected="contents.mainMenu"
        @click="toggle('contents/mainMenu', null, false)"
      />
      <cy-button-circle
        icon="carbon:location-current"
        color="cyan"
        float
        toggle
        :selected="contents.goSkillTree"
        @click="toggle('contents/goSkillTree', null, false)"
      />
      <cy-button-circle
        icon="uil:books"
        color="orange"
        float
        toggle
        :selected="contents.selectSkillTree"
        @click="toggle('contents/selectSkillTree', null, false)"
      />
    </template>
    <template #side-contents>
      <cy-transition v-if="currentSkillBuild" mode="out-in">
        <AppLayoutBottomContent v-if="contents.mainMenu" class="space-y-2 p-3">
          <div class="flex items-center">
            <cy-title-input
              v-model:value="currentSkillBuild.name"
              icon="mdi-clipboard-text-outline"
            />
            <cy-options
              :value="currentSkillBuild"
              :options="
                skillBuilds.map(skillBuild => ({
                  id: skillBuild.instanceId,
                  value: skillBuild,
                }))
              "
              addable
              @update:value="store.setCurrentSkillBuild($event)"
              @add-item="
                characterStore.setCharacterSkillBuild(store.createSkillBuild())
              "
            >
              <template #title>
                <cy-button-circle icon="ant-design:build-outlined" small />
              </template>
              <template #item="{ value }">
                <cy-icon-text>
                  {{ value.name }}
                </cy-icon-text>
              </template>
            </cy-options>
          </div>
          <div class="flex items-center">
            <cy-button-action
              icon="bx:copy-alt"
              @click="store.copyCurrentSkillBuild()"
            >
              {{ t('global.copy') }}
            </cy-button-action>
            <cy-button-action
              icon="ic-baseline-delete-outline"
              color="secondary"
              @click="removeCurrentSkillBuild"
            >
              {{ t('global.remove') }}
            </cy-button-action>
          </div>
          <div class="mt-3 space-x-2 border-t border-primary-30 pt-3">
            <cy-button-action
              icon="uil:image-download"
              @click="emit('export-image')"
            >
              {{ t('skill-simulator.export-image.title') }}
            </cy-button-action>
            <cy-button-action
              icon="mdi:note-text-outline"
              @click="emit('export-text')"
            >
              {{ t('skill-simulator.export-text-title') }}
            </cy-button-action>
          </div>
        </AppLayoutBottomContent>
        <AppLayoutBottomContent
          v-else-if="contents.selectSkillTree"
          class="space-y-2 px-4 py-3"
        >
          <div v-for="stc in skillTreeCategorys" :key="`stc-${stc.id}`">
            <div>
              <cy-icon-text icon="uil:books" color="orange" small>{{
                stc.name
              }}</cy-icon-text>
            </div>
            <div class="pl-2">
              <cy-button-check
                v-for="st in stc.skillTrees"
                :key="`st-${st.skillTreeId}`"
                :selected="selectedSkillTrees.includes(st)"
                @click="currentSkillBuild!.toggleSkillTreeSelected(st)"
              >
                {{ st.name }}
              </cy-button-check>
            </div>
          </div>
        </AppLayoutBottomContent>
        <AppLayoutBottomContent
          v-else-if="contents.goSkillTree"
          class="space-y-2 px-4 py-3"
        >
          <cy-default-tips
            v-if="selectedSkillTrees.length === 0"
            icon="bx:message-rounded-edit"
            class="my-6"
          >
            {{ t('skill-simulator.default-tips') }}
          </cy-default-tips>
          <template v-else>
            <div
              v-for="categoryItem in jumpSkillTreeCategorys"
              :key="`stc-${categoryItem.origin.id}`"
            >
              <div>
                <cy-icon-text icon="uil:books" color="orange" small>{{
                  categoryItem.origin.name
                }}</cy-icon-text>
              </div>
              <div class="pl-2">
                <cy-button-plain
                  v-for="st in categoryItem.skillTrees"
                  :key="`st-${st.skillTreeId}`"
                  icon="bx:bxs-book-bookmark"
                  class="pr-2"
                  @click="emit('go-skill-tree', st)"
                >
                  {{ st.name }}
                </cy-button-plain>
              </div>
            </div>
          </template>
        </AppLayoutBottomContent>
        <div v-else class="flex items-center space-x-2.5">
          <div
            class="flex items-center space-x-1.5 whitespace-nowrap border border-primary-30 bg-white px-2 py-1"
          >
            <cy-icon-text icon="mdi:script-outline" small>
              {{ t('skill-simulator.skill-level-point') }}
            </cy-icon-text>
            <div class="text-sm text-primary-50">
              {{ skillPointSum.level }}
            </div>
          </div>
          <div
            class="flex items-center space-x-1.5 whitespace-nowrap border border-primary-30 bg-white px-2 py-1"
          >
            <cy-icon-text icon="mdi:judaism" small>
              {{ t('skill-simulator.star-gem-level-point') }}
            </cy-icon-text>
            <div class="text-sm text-blue-60">
              {{ skillPointSum.starGemLevel }}
            </div>
          </div>
        </div>
      </cy-transition>
    </template>
  </AppLayoutBottom>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { useCharacterStore } from '@/stores/views/character'

import Grimoire from '@/shared/Grimoire'
import Notify from '@/shared/setup/Notify'
import ToggleService from '@/shared/setup/ToggleService'

import { SkillTree } from '@/lib/Skill/Skill'

import AppLayoutBottomContent from '@/components/app-layout/app-layout-bottom-content.vue'
import AppLayoutBottom from '@/components/app-layout/app-layout-bottom.vue'

import { MenuData, MenuMode, setupSkillBuildStore } from './setup'

interface Emits {
  (evt: 'update-menu-data', data: MenuData): void
  (evt: 'go-skill-tree', skillTree: SkillTree): void
  (evt: 'export-image'): void
  (evt: 'export-text'): void
}
const emit = defineEmits<Emits>()

const { t } = useI18n()
const { notify } = Notify()

const characterStore = useCharacterStore()

const mode = ref<MenuMode>('skill')
const levelUnit = ref(5)
const increase = ref(true)

const levelUnitList = [1, 5, 10]
const toggleLevelUnit = () => {
  const idx = levelUnitList.indexOf(levelUnit.value) + 1
  levelUnit.value = levelUnitList[idx === levelUnitList.length ? 0 : idx]
}

watch([mode, levelUnit, increase], ([newMode, newLevelUnit, newIncrease]) => {
  emit('update-menu-data', {
    levelUnit: newLevelUnit * (newIncrease ? 1 : -1),
    mode: newMode,
  })
})

const skillTreeCategorys = Grimoire.Skill.skillRoot.skillTreeCategorys

const { store, skillBuilds, currentSkillBuild } = setupSkillBuildStore()
const selectedSkillTrees = computed<SkillTree[]>(
  () => currentSkillBuild.value?.selectedSkillTrees ?? []
)

const jumpSkillTreeCategorys = computed(() => {
  const categorys = skillTreeCategorys.map(category => {
    const skillTrees = category.skillTrees.filter(_st =>
      selectedSkillTrees.value.includes(_st)
    )
    return {
      origin: category,
      skillTrees,
    }
  })
  return categorys.filter(item => item.skillTrees.length !== 0)
})

const removeCurrentSkillBuild = () => {
  store.removeCurrentSkillBuild()
  notify(
    t('skill-simulator.remove-build-tips'),
    undefined,
    'skill-simulator.remove-build-tips'
  )
}

const { contents, toggle } = ToggleService({
  contents: ['mainMenu', 'selectSkillTree', 'goSkillTree'] as const,
})

const skillPointSum = computed(() => {
  if (!currentSkillBuild.value) {
    return {
      level: 0,
      starGemLevel: 0,
    }
  }
  return currentSkillBuild.value.skillPointSum
})
</script>
