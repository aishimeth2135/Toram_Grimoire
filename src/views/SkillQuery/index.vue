<template>
  <AppLayoutMain>
    <cy-top-header class="cursor-pointer" @click="toggle('contents/search')">
      <cy-icon-text v-if="currentSkill" icon="bx:bxs-book-bookmark">
        {{ currentSkill.name }}
      </cy-icon-text>
      <div v-else class="ml-2 text-primary-30">
        {{ t('skill-query.search-tips') }}
      </div>
      <cy-button-icon class="ml-auto" icon="bx:bx-search" />
    </cy-top-header>
    <div class="px-1">
      <div ref="skillTreeCategoryMenuElement" class="p-1">
        <cy-button-action
          v-for="stc in skillRoot.skillTreeCategorys"
          :key="stc.id"
          icon="uil:books"
          :selected="currentSkillTreeCategory?.id === stc.id"
          @click="selectCurrentSkillTreeCategory(stc)"
        >
          {{ stc.name }}
        </cy-button-action>
      </div>
      <cy-hr />
      <div v-if="currentSkillTreeCategory" class="p-1">
        <cy-button-action
          v-for="st in currentSkillTreeCategory.skillTrees"
          :key="st.id"
          icon="bx:bxs-book-bookmark"
          :selected="currentSkillTree?.id === st.id"
          @click="selectCurrentSkillTree(st)"
        >
          {{ st.name }}
        </cy-button-action>
      </div>
      <div v-if="currentSkillTree" class="max-w-full overflow-x-auto">
        <SkillTreeDiagram
          :skill-tree="currentSkillTree"
          :current-skill="currentSkill"
          @skill-click="selectCurrentSkill"
        />
      </div>
    </div>
    <div
      v-if="currentSkillItem"
      ref="skillEffectElement"
      class="pt-10"
      style="min-height: 50vh"
    >
      <div v-if="contents.skillEffect" class="border-t-1 border-orange-60 pt-4">
        <SkillEffect
          v-model:selected-equipment="currentEquipment"
          @set-current-skill="selectCurrentSkill($event, true)"
        />
      </div>
      <div v-if="mainStore.devMode" class="mt-4">
        <cy-button-circle
          icon="ic:round-details"
          color="fuchsia"
          small
          toggle
          :selected="contents.skillDev"
          @click="toggle('contents/skillDev')"
        />
      </div>
      <SkillDevDetail
        v-if="contents.skillDev"
        :skill="currentSkillItem.skill"
        class="mt-2"
      />
    </div>
    <SkillQueryMenu
      v-if="currentSkillTree"
      v-model:selected-equipment="currentEquipment"
      :skill-computing-container="computingContainer"
      :skill-tree="currentSkillTree"
      :skill-item="currentSkillItem"
      @go-skill-top="goToSkillTop"
    />
    <SkillQuerySearch
      v-if="contents.search"
      @close="toggle('contents/search', false)"
      @submit="selectCurrentSkillFromSearch"
    />
  </AppLayoutMain>
</template>

<script setup lang="ts">
import { type ComputedRef, type Ref, computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { useMainStore } from '@/stores/app/main'

import Grimoire from '@/shared/Grimoire'
import ToggleService from '@/shared/setup/ToggleService'

import {
  Skill,
  SkillRoot,
  SkillTree,
  SkillTreeCategory,
} from '@/lib/Skill/Skill'

import AppLayoutMain from '@/components/app-layout/app-layout-main.vue'
import { AppRouteNames } from '@/router/enums'

import SkillEffect from './skill-effect.vue'
import SkillQueryMenu from './skill-query-menu/index.vue'
import SkillQuerySearch from './skill-query-search.vue'
import SkillTreeDiagram from './skill-tree-diagram.vue'
import SkillDevDetail from './skill/skill-dev-detail.vue'

import { setupComputingContainer, useSkillQueryState } from './setup'

defineOptions({
  name: 'SkillQuery',
})

const { toggle, contents } = ToggleService({
  contents: ['skillEffect', 'search', 'skillDev'] as const,
})

const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const mainStore = useMainStore()

const skillEffectElement: Ref<HTMLElement | null> = ref(null)
const jumpToSkillEffect = async () => {
  await nextTick()
  if (skillEffectElement.value) {
    skillEffectElement.value.scrollIntoView({ behavior: 'smooth' })
  }
}
const skillTreeCategoryMenuElement: Ref<HTMLElement | null> = ref(null)
const goToSkillTop = async () => {
  await nextTick()
  if (skillTreeCategoryMenuElement.value) {
    skillTreeCategoryMenuElement.value.scrollIntoView({ behavior: 'auto' })
  }
}

const skillRoot: ComputedRef<SkillRoot> = computed(
  () => Grimoire.Skill.skillRoot
)

const {
  currentSkill,
  currentSkillTree,
  currentSkillTreeCategory,
  currentEquipment,
} = useSkillQueryState()

const updateRouteParam = (skillId: string) => {
  router.replace({ name: 'SkillQuery', params: { skillId } })
}

const selectCurrentSkillTreeCategory = (stc: SkillTreeCategory) => {
  currentSkillTreeCategory.value = stc
  currentSkillTree.value = null
  currentSkill.value = null
  toggle('contents/skillEffect', false)
  updateRouteParam(stc.id.toString())
}

const selectCurrentSkillTree = (st: SkillTree) => {
  currentSkillTree.value = st
  currentSkill.value = null
  toggle('contents/skillEffect', false)
  updateRouteParam(st.skillTreeId)
}

const selectCurrentSkill = (skill: Skill, syncParent = false) => {
  if (syncParent) {
    currentSkillTreeCategory.value = skill.parent.parent
    currentSkillTree.value = skill.parent
  }
  currentSkill.value = skill
  toggle('contents/skillEffect', true)
  jumpToSkillEffect()

  updateRouteParam(skill.skillId)
}

const selectCurrentSkillFromSearch = (skill: Skill) => {
  toggle('contents/search')
  selectCurrentSkill(skill, true)
}

if (route.name === AppRouteNames.SkillQuery && currentSkill.value) {
  selectCurrentSkill(currentSkill.value, true)
}

if (route.params.skillId) {
  const skillId = route.params.skillId as string
  skillId.split('-').every((idStr, idx) => {
    const id = parseInt(idStr, 10)
    if (idx === 0) {
      const stc = skillRoot.value.skillTreeCategorys.find(
        item => item.id === id
      )
      if (stc) {
        selectCurrentSkillTreeCategory(stc)
        return true
      }
    } else if (idx === 1) {
      const st = currentSkillTreeCategory.value!.skillTrees.find(
        item => item.id === id
      )
      if (st) {
        selectCurrentSkillTree(st)
        return true
      }
    } else if (idx === 2) {
      const skill = currentSkillTree.value!.skills.find(item => item.id === id)
      if (skill) {
        selectCurrentSkill(skill)
        return true
      }
    }
    return false
  })
}

const { computingContainer, currentSkillItem } =
  setupComputingContainer(currentSkill)
</script>
