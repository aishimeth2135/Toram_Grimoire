<script lang="ts" setup generic="Item extends { id: any }">
import { h } from 'vue'

import CardRow from '@/components/card/card-row.vue'
import CardRowsDelegation from '@/components/card/card-rows-delegation.vue'
import CardRowsWrapper from '@/components/card/card-rows-wrapper.vue'
import IconSelection from '@/components/common/icon-selection.vue'

import CommonSearchInput from '../common/common-search-input.vue'

interface Props {
  searchText: string
  placeholder?: string
  items: Item[]
  selectedItemIds: any[]
}
interface Emits {
  (evt: 'update:search-text', value: string): void
  (evt: 'select-item', value: Item): void
}

interface RenderItemContext {
  item: Item
  selected: boolean
}
interface Slots {
  item(context: RenderItemContext): any
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()
const slots = defineSlots<Slots>()

const itemClicked = (item: Item) => {
  emit('select-item', item)
}

const RenderItem = ({ item }: { item: Item }) => {
  const selected = props.selectedItemIds.includes(item.id)

  const itemNode = slots.item({
    item: item,
    selected,
  })
  const iconNode = h(IconSelection, { selected, class: 'mr-3.5' }, itemNode)
  return h(
    CardRow,
    { item, hover: true, class: 'flex cursor-pointer items-center px-4 py-2' },
    iconNode
  )
}
</script>

<template>
  <CardRowsWrapper class="wd-lg:max-h-none flex h-full max-h-[24rem] max-w-[20rem] flex-col">
    <div class="pb-1">
      <CommonSearchInput
        :model-value="searchText"
        :placeholder="placeholder"
        is-header
        @update:model-value="emit('update:search-text', $event)"
      />
    </div>
    <CardRowsDelegation class="grow overflow-y-auto py-2" @row-clicked="itemClicked">
      <RenderItem v-for="item in items" :key="item.id" :item="item" />
    </CardRowsDelegation>
  </CardRowsWrapper>
</template>
