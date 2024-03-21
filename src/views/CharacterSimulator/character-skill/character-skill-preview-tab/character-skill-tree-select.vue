<script lang="ts" setup>
import Grimoire from '@/shared/Grimoire'

import { SkillBuild } from '@/lib/Character/SkillBuild'

import CardRow from '@/components/card/card-row.vue'
import CardRows from '@/components/card/card-rows.vue'

import CommonSelectionIcon from '../../common/common-selection-icon.vue'

interface Props {
  skillBuild: SkillBuild
}

defineProps<Props>()

const allSkillTreeCategorys = Grimoire.Skill.skillRoot.skillTreeCategorys.map(
  category => {
    return {
      category,
      skillTrees: category.skillTrees,
    }
  }
)
</script>

<template>
  <cy-popover placement="bottom-end">
    <template #default="{ shown }">
      <cy-button-circle small icon="mdi:edit" :selected="shown" />
    </template>
    <template #popper>
      <div class="px-3 py-2">
        <div
          v-for="{ category, skillTrees } in allSkillTreeCategorys"
          :key="category.id"
        >
          <div class="py-0.5 text-sm text-primary-40">
            {{ category.name }}
          </div>
          <CardRows class="pb-2">
            <CardRow
              v-for="skillTree in skillTrees"
              :key="skillTree.skillTreeId"
              class="cursor-pointer px-2 py-1.5"
              hover
              @click="skillBuild.toggleSkillTreeSelected(skillTree)"
            >
              <CommonSelectionIcon
                :selected="skillBuild.hasSkillTree(skillTree)"
              />
              {{ skillTree.name }}
            </CardRow>
          </CardRows>
        </div>
      </div>
    </template>
  </cy-popover>
</template>
