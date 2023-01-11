<template>
  <div>
    <div ref="topElement"></div>
    <CardRowsWrapper class="mx-1">
      <div class="overflow-x-auto">
        <CardRows class="min-w-min">
          <ItemQueryResultItem
            v-for="eq in currentItems"
            :key="eq.origin!.id"
            :equipment="eq"
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
import { Ref, nextTick, ref, toRefs } from 'vue'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

import PageControl from '@/setup/PageControl'

import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import CardRows from '@/components/card/card-rows.vue'

import ItemQueryResultItem from './item-query-result-item.vue'

interface Props {
  equipments: CharacterEquipment[]
}

const props = defineProps<Props>()

const { equipments } = toRefs(props)

const { currentItems, page, maxPage } = PageControl({
  items: equipments,
  step: 30,
})

const topElement: Ref<HTMLElement | null> = ref(null)
const pageChanged = async () => {
  await nextTick()
  topElement.value?.scrollIntoView({ behavior: 'smooth' })
}
</script>
