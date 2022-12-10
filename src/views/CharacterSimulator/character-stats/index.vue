<template>
  <section>
    <div ref="categorysElement">
      <div v-for="data in categoryResults" :key="data.name" class="mb-4 px-2">
        <fieldset class="border-t border-solid border-primary-30">
          <legend class="ml-3 py-0 px-2">
            <cy-icon-text icon="mdi-creation" text-color="primary-30" small>
              {{ data.name }}
            </cy-icon-text>
          </legend>
        </fieldset>
        <div>
          <cy-popover
            v-for="stat in data.stats"
            :key="stat.id"
            class="relative mx-2 my-1 inline-flex cursor-pointer border-b border-solid border-primary-30 px-2"
            show-triggers="hover click"
          >
            <template v-if="!stat.origin.isBoolStat">
              <span class="mr-3">{{ stat.name }}</span>
              <span class="text-primary-60">{{ stat.displayValue }}</span>
            </template>
            <span v-else class="text-primary-60">{{ stat.name }}</span>
            <template #popper>
              <div class="py-2 px-4">
                <CharacterStatDetail :character-stat-result="stat" />
              </div>
            </template>
          </cy-popover>
        </div>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
export default {
  name: 'CharacterStats',
}
</script>

<script lang="ts" setup>
import { Ref, computed, ref } from 'vue'

import CharacterStatDetail from './character-stat-detail.vue'

import { setupCharacterStore } from '../setup'

const { characterStatCategoryResults } = setupCharacterStore()

const categorysElement: Ref<HTMLElement | null> = ref(null)

const categoryResults = computed(() => {
  return characterStatCategoryResults.value
    .map(result => ({
      name: result.name,
      stats: result.stats.filter(stat => !stat.hidden),
    }))
    .filter(item => item.stats.length > 0)
})
</script>
