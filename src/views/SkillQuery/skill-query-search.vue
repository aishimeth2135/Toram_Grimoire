<template>
  <teleport to="body">
    <cy-transition appear>
      <div class="bg-black/50 fixed left-0 top-0 z-100 h-full w-full" @click="emit('close')">
        <div style="max-width: 40rem" class="mx-auto py-5" @click.stop>
          <div>
            <cy-title-input
              ref="searchInputComponent"
              v-model:value="searchText"
              icon="bx:bx-search"
              @keyup.enter="selectSkillFromKeyup"
              @keyup.up="selectedSearchResultIdx -= 1"
              @keyup.down="selectedSearchResultIdx += 1"
              @keyup.esc="emit('close')"
            />
          </div>
          <div
            v-if="searchResult.length !== 0"
            class="mx-2 overflow-y-auto bg-white"
            style="max-height: 70vh"
          >
            <cy-list-item
              v-for="(skill, idx) in searchResult"
              :key="skill.skillId"
              :selected="selectedSearchResultIdx === idx"
              @click="emit('submit', skill)"
            >
              <SkillTitle :skill="skill" />
            </cy-list-item>
          </div>
        </div>
      </div>
    </cy-transition>
  </teleport>
</template>

<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'

import Grimoire from '@/shared/Grimoire'

import { Skill } from '@/lib/Skill/Skill'

import SkillTitle from './skill/layouts/skill-title.vue'

interface Emits {
  (evt: 'submit', skill: Skill): void
  (evt: 'close'): void
}

const emit = defineEmits<Emits>()

const skillRoot = computed(() => Grimoire.Skill.skillRoot)

const searchText = ref('')

const searchResult: ComputedRef<Skill[]> = computed(() => {
  if (searchText.value === '') {
    return []
  }
  const text = searchText.value.toLowerCase()
  const result: Skill[] = []
  skillRoot.value.skillTreeCategorys.forEach(stc => {
    stc.skillTrees.forEach(st => {
      const matchedSkills = st.skills.filter(skill => skill.name.toLowerCase().includes(text))
      result.push(...matchedSkills)
    })
  })
  return result
})

const _selectedSearchResultIdx = ref(-1)
const selectedSearchResultIdx: WritableComputedRef<number> = computed({
  get() {
    return _selectedSearchResultIdx.value
  },
  set(value) {
    if (value >= searchResult.value.length) {
      value = searchResult.value.length - 1
    }
    if (value < 0) {
      value = 0
    }
    _selectedSearchResultIdx.value = value
  },
})

watch(searchResult, () => {
  selectedSearchResultIdx.value = 0
})

const selectSkillFromKeyup = () => {
  const skill = searchResult.value[selectedSearchResultIdx.value]
  if (skill) {
    emit('submit', skill)
  }
}

const searchInputComponent: Ref<{ focus: () => void } | null> = ref(null)

onMounted(async () => {
  await nextTick()
  searchInputComponent.value?.focus()
})
</script>
