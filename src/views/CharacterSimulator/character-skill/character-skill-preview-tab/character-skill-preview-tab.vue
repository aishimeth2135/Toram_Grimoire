<script lang="ts" setup>
import { type ComponentPublicInstance, computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { SkillBuild } from '@/lib/Character/SkillBuild'
import { Skill, SkillTree } from '@/lib/Skill/Skill'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'

import CommonEditModeButton from '../../common/common-edit-mode-button.vue'
import CharacterSkillBuildExport from './character-skill-build-export.vue'
import CharacterSkillTreePreview from './character-skill-tree-preview.vue'
import CharacterSkillTreeSelect from './character-skill-tree-select.vue'

interface Props {
  skillBuild: SkillBuild
}

const props = defineProps<Props>()

const { t } = useI18n()

const skillTreeRefs = reactive(new Map<string, HTMLElement | null>())

const goSkillTree = (target: SkillTree) => {
  skillTreeRefs.get(target.skillTreeId)?.scrollIntoView()
}

interface SkillLevelData {
  skill: Skill
  level: number
}

const displayedSkillTrees = computed(() => {
  const skillBuild = props.skillBuild

  return skillBuild.selectedSkillTrees.map(skillTree => {
    const skillLevels: SkillLevelData[] = []
    skillTree.skills.forEach(skill => {
      if (props.skillBuild.hasSkill(skill)) {
        skillLevels.push({
          skill,
          level: skillBuild.getSkillLevel(skill),
        })
      }
    })
    return {
      skillTree,
      skillLevelSum: props.skillBuild.getSkillTreePointSum(skillTree),
    }
  })
})

const skillPointSum = computed(() => {
  let skillLevel = 0
  let starGemLevel = 0

  displayedSkillTrees.value.forEach(({ skillLevelSum }) => {
    skillLevel += skillLevelSum.level
    starGemLevel += skillLevelSum.starGemLevel
  })

  return {
    skillLevel,
    starGemLevel,
  }
})

const skillTreesDefaultEditing = ref(false)
</script>

<template>
  <div>
    <div class="flex flex-wrap px-2 pt-2">
      <div v-if="displayedSkillTrees.length > 0" class="pb-2 text-sm">
        <div class="text-primary-60">
          {{ $t('character-simulator.skill-build.skill-trees-directory.title') }}
        </div>
        <div class="text-gray-40 mt-1">
          {{ $t('character-simulator.skill-build.skill-trees-directory.caption') }}
        </div>
      </div>
      <div v-else class="text-primary-60 space-y-1 text-sm">
        <div>
          {{ t('character-simulator.skill-build.no-any-skill-tips.0') }}
        </div>
        <div>
          {{ t('character-simulator.skill-build.no-any-skill-tips.1') }}
        </div>
      </div>
      <div class="ml-auto flex items-start space-x-3 pb-2">
        <CharacterSkillBuildExport
          v-if="displayedSkillTrees.length > 0"
          :skill-build="skillBuild"
        />
        <CharacterSkillTreeSelect :skill-build="skillBuild" />
      </div>
    </div>
    <template v-if="displayedSkillTrees.length > 0">
      <div
        v-for="{ skillTree, skillLevelSum } in displayedSkillTrees"
        :key="skillTree.skillTreeId"
        class="text-primary-50 hover:text-primary-80 flex flex-wrap items-center px-3 py-2 duration-150"
      >
        <div class="flex cursor-pointer items-center" @click="goSkillTree(skillTree)">
          <cy-icon class="text-primary-30 mr-3" icon="mdi:book-open-variant-outline" />
          <div class="w-36 truncate">
            {{ skillTree.name }}
          </div>
        </div>
        <div class="ml-4 flex items-center">
          <cy-icon class="text-primary-30" icon="mdi:star-four-points-outline" width="0.875rem" />
          <span class="text-red-60 ml-1 w-8">
            {{ skillLevelSum.level }}
          </span>
          <cy-icon
            class="text-blue-30 ml-4"
            icon="mdi:star-four-points-circle-outline"
            width="0.875rem"
          />
          <span class="text-blue-60 ml-1">
            {{ skillLevelSum.starGemLevel }}
          </span>
        </div>
      </div>
      <div class="w-xs border-primary-10 mt-2 flex items-center border-t pl-[12.675rem] pt-0.5">
        <cy-icon class="text-primary-30" icon="mdi:star-four-points-outline" width="0.875rem" />
        <span class="text-red-60 ml-1 w-8">
          {{ skillPointSum.skillLevel }}
        </span>
        <cy-icon
          class="text-blue-30 ml-4"
          icon="mdi:star-four-points-circle-outline"
          width="0.875rem"
        />
        <span class="text-blue-60 ml-1">
          {{ skillPointSum.starGemLevel }}
        </span>
      </div>
      <div class="mt-2 flex justify-end px-3.5">
        <CommonEditModeButton v-model:is-editing="skillTreesDefaultEditing" />
      </div>
      <CardRowsWrapper class="mt-4 space-y-3 pt-2">
        <CharacterSkillTreePreview
          v-for="{ skillTree } in displayedSkillTrees"
          :key="skillTree.skillTreeId"
          :ref="
            component =>
              skillTreeRefs.set(
                skillTree.skillTreeId,
                (component as ComponentPublicInstance)?.$el ?? null
              )
          "
          :skill-build="skillBuild"
          :skill-tree="skillTree"
          :default-editing="skillTreesDefaultEditing"
        />
      </CardRowsWrapper>
    </template>
  </div>
</template>
