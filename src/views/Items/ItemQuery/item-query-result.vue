<template>
  <div>
    <div ref="topElement"></div>
    <CardRowsWrapper class="mx-1">
      <div class="overflow-x-auto">
        <CardRows class="min-w-min">
          <ItemQueryResultItem v-for="eq in currentItems" :key="eq.origin!.id" :equipment="eq" />
        </CardRows>
      </div>
    </CardRowsWrapper>
    <div v-if="equipments.length > PAGINATION_STEP" class="mt-3">
      <cy-pagination v-model:value="page" :max-page="maxPage" @changed="pageChanged" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { nextTick, toRef, useTemplateRef } from 'vue'

import { usePageControl } from '@/shared/composables/PageControl'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import ItemQueryResultItem from './item-query-result-item.vue'

interface Props {
  equipments: CharacterEquipment[]
}

const props = defineProps<Props>()

const PAGINATION_STEP = 30

const { currentItems, page, maxPage } = usePageControl({
  items: toRef(() => props.equipments),
  step: PAGINATION_STEP,
})

const topElement = useTemplateRef('topElement')
const pageChanged = async () => {
  await nextTick()
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
