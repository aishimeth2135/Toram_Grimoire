<template>
  <div>
    <div ref="topElement"></div>
    <CardRowsWrapper class="mx-1">
      <div class="overflow-x-auto">
        <CardRows class="min-w-min">
          <RegistletQueryResultItem
            v-for="item in currentItems"
            :key="item.id"
            :item="item"
          />
        </CardRows>
      </div>
    </CardRowsWrapper>
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
import { Ref, computed, nextTick, ref } from 'vue'

import { RegistletItemBase } from '@/lib/Registlet/Registlet'

import PageControl from '@/setup/PageControl'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import RegistletQueryResultItem from './registlet-query-result-item.vue'

interface Props {
  registletItems: RegistletItemBase[]
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
