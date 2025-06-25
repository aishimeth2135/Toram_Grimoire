<script lang="ts" setup>
import { computed, provide, reactive } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import { RegistletCategoryIds, RegistletItemBaseSkill } from '@/lib/Registlet/RegistletItem'
import type { Skill } from '@/lib/Skill/Skill'
import type { SkillItem } from '@/lib/Skill/SkillComputing'

import SideFloat from '@/components/app-layout/side-float/side-float.vue'
import { ComputingContainerInjectionKey } from '@/views/SkillQuery/injection-keys'

import { setStackValue } from './character-skill-tab/utils'

interface Props {
  visible: boolean
  skillItem: SkillItem
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const { skillComputingContainer, currentCharacterState } = useCharacterStore()

const currentRegistletBuild = computed(() => currentCharacterState.registletBuild)

interface SkillRegistletItemState {
  item: RegistletItemBaseSkill
  level: number
  enabled: boolean
}

const getSkillRegistletItemsState = (skill: Skill): SkillRegistletItemState[] => {
  if (!currentRegistletBuild.value) {
    return []
  }

  const itemStates: SkillRegistletItemState[] = []

  currentRegistletBuild.value.items.forEach(registletItem => {
    if (registletItem.base.category.id === RegistletCategoryIds.Skill) {
      const base = registletItem.base as RegistletItemBaseSkill
      if (base.link.includes(skill)) {
        itemStates.push(
          reactive({
            item: computed(() => base),
            level: computed(() => registletItem.level),
            enabled: computed(() => registletItem.enabled),
          })
        )
      }
    }
  })

  return itemStates
}

provide(ComputingContainerInjectionKey, {
  rootComputingContainer: skillComputingContainer,
  setStackValue,
  getSkillRegistletItemsState,
  currentSkillItem: computed(() => props.skillItem),
})
</script>

<template>
  <SideFloat :visible="visible" @close="emit('close')"> </SideFloat>
</template>
