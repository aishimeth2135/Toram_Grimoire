<script lang="ts" setup>
import { computed, provide, reactive } from 'vue'

import { useCharacterStore } from '@/stores/views/character'

import type { RegistletBuild } from '@/lib/Character/RegistletBuild'
import { RegistletCategoryIds, RegistletItemBaseSkill } from '@/lib/Registlet/RegistletItem'
import type { Skill } from '@/lib/Skill/Skill'
import type { SkillEffectItem, SkillItem } from '@/lib/Skill/SkillComputing'
import { getSkillIconPath } from '@/lib/Skill/drawSkillTree'

import SideFloat from '@/components/app-layout/side-float/side-float.vue'
import { ComputingContainerInjectionKey } from '@/components/views/skill/injection-keys'
import SkillEffect from '@/components/views/skill/skill-effect.vue'

import { setStackValue } from './character-skill-tab/utils'

interface Props {
  visible: boolean
  effectItem: SkillEffectItem
}
interface Emits {
  (evt: 'close'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const characterStore = useCharacterStore()

const currentRegistletBuild = computed<RegistletBuild | null>(
  () => characterStore.currentCharacterState.registletBuild
)

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
  rootComputingContainer: characterStore.postponedSkillComputingContainer,
  setStackValue,
  getSkillRegistletItemsState,
  currentSkillItem: computed<SkillItem>(() => props.effectItem.parent),
})
</script>

<template>
  <SideFloat :visible="visible" content-class="px-3 pb-6 pt-2" size="lg" @close="emit('close')">
    <div
      class="text-primary-60 border-primary-20 gap-icon mb-4 flex items-center border-b px-3 pb-2"
    >
      <cy-icon :icon="getSkillIconPath(effectItem.parent.skill)" />
      {{ effectItem.parent.skill.name }}
    </div>
    <SkillEffect :effect-item="effectItem" />
  </SideFloat>
</template>
