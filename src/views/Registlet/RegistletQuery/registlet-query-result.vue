<template>
  <div>
    <div ref="topElement"></div>
    <div class="overflow-x-auto">
      <div class="min-w-min divide-y divide-primary-20">
        <RegistletQueryResultItem
          v-for="item in currentItems"
          :key="item.id"
          :item="item"
        />
      </div>
    </div>
    <div class="mt-3">
      <cy-pagination
        v-model:value="page"
        :max-page="maxPage"
        @changed="pageChanged"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, nextTick, Ref, computed } from 'vue'

import { RegistletItemBase } from '@/lib/Registlet/Registlet'

import PageControl from '@/setup/PageControl'

import RegistletQueryResultItem from './registlet-query-result-item.vue'

interface Props {
  registletItems: RegistletItemBase[];
}

const props = defineProps<Props>()

const { currentItems, page, maxPage } = PageControl({
  items: computed(() => props.registletItems),
  step: 30,
})

const topElement: Ref<HTMLElement | null> = ref(null)
const pageChanged = async () => {
  await nextTick()
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
