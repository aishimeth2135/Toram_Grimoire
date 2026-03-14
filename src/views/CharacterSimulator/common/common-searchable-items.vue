<script lang="ts" setup generic="Item extends { id: any }">
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
defineSlots<Slots>()

const itemClicked = (item: Item) => {
  emit('select-item', item)
}

const itemSelected = (item: Item) => {
  return props.selectedItemIds.includes(item.id)
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
      <CardRow
        v-for="item in items"
        :key="item.id"
        class="flex cursor-pointer items-center px-4 py-2"
        :item="item"
        hover
      >
        <IconSelection :selected="itemSelected(item)" class="mr-3.5" />
        <slot name="item" :item="item" :selected="itemSelected(item)" />
      </CardRow>
    </CardRowsDelegation>
  </CardRowsWrapper>
</template>
