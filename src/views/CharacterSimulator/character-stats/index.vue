<template>
  <section>
    <div ref="categorysElement">
      <div
        v-for="data in categoryResults"
        :key="data.name"
        class="px-2 mb-4"
      >
        <fieldset class="border-t border-solid border-light">
          <legend class="py-0 px-2 ml-3">
            <cy-icon-text
              icon="mdi-creation"
              text-color="purple"
              size="small"
            >
              {{ data.name }}
            </cy-icon-text>
          </legend>
        </fieldset>
        <div class="pl-4">
          <span
            v-for="stat in data.stats"
            :key="stat.id"
            class="stat-scope px-2 mx-2 my-1 inline-flex cursor-pointer relative border-b border-solid border-light"
            :data-stat-id="stat.id"
          >
            <template v-if="!stat.origin.isBoolStat">
              <span class="mr-3">{{ stat.name }}</span>
              <span class="text-light-4">{{ stat.displayValue }}</span>
            </template>
            <span v-else class="text-light-4">{{ stat.name }}</span>
          </span>
        </div>
      </div>
    </div>
    <cy-hover-float
      ref="statHoverFloatComponent"
      :element="categorysElement"
      target="span[data-stat-id]"
      @element-hover="statHover"
    >
      <CharacterStatDetail
        v-if="currentHoverStat"
        :character-stat-result="currentHoverStat"
      />
    </cy-hover-float>
  </section>
</template>

<script lang="ts">
export default {
  name: 'CharacterStats',
}
</script>

<script lang="ts" setup>
import { computed, nextTick, ref, Ref, watch } from 'vue'

import { CharacterStatResultWithId } from '@/stores/views/character/setup'

import CharacterStatDetail from './character-stat-detail.vue'

import { setupCharacterStore } from '../setup'

const { characterStatCategoryResults } = setupCharacterStore()

const categorysElement: Ref<HTMLElement | null> = ref(null)
const statHoverFloatComponent: Ref<{ update: Function } | null> = ref(null)

const categoryResults = computed(() => {
  return characterStatCategoryResults.value.map(result => ({
    name: result.name,
    stats: result.stats.filter(stat => !stat.hidden),
  }))
})

const currentHoverStatId = ref<string | null>(null)
const currentHoverStat = computed(() => {
  if (!currentHoverStatId.value) {
    return null
  }
  let stat: CharacterStatResultWithId | null = null
  characterStatCategoryResults.value.some(categoryResult => {
    const find = categoryResult.stats.find(stat => stat.id === currentHoverStatId.value)
    if (find) {
      stat = find
      return true
    }
  })
  return stat as (CharacterStatResultWithId | null)
})

const statHover = (el: HTMLElement) => {
  const id = el.getAttribute('data-stat-id')
  if (id) {
    currentHoverStatId.value = id
  }
}

watch(categoryResults, async () => {
  await nextTick()
  statHoverFloatComponent.value?.update()
}, { immediate: true, deep: true })
</script>
