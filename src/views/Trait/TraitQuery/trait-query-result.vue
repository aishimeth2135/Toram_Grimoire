<template>
  <div>
    <div ref="topElement"></div>
    <CardRowsWrapper class="mx-1">
      <div class="overflow-x-auto">
        <CardRows class="min-w-min">
          <TraitQueryResultItem
            v-for="item in currentItems"
            :key="item.id"
            :item="item"
            :default-visible="defaultVisible"
          />
        </CardRows>
      </div>
    </CardRowsWrapper>
    <div class="mt-3">
      <cy-pagination v-model:value="page" :max-page="maxPage" @changed="pageChanged" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, nextTick, useTemplateRef } from 'vue'

import PageControl from '@/shared/setup/PageControl'

import type { EquipmentTraitItem } from '@/lib/EquipmentTrait'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import TraitQueryResultItem from './trait-query-result-item.vue'

interface Props {
  traitItems: EquipmentTraitItem[]
  defaultVisible: boolean
}

const props = defineProps<Props>()

const { currentItems, page, maxPage } = PageControl({
  items: computed(() => props.traitItems),
  step: 30,
})

const topElement = useTemplateRef('topElement')
const pageChanged = async () => {
  await nextTick()
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
