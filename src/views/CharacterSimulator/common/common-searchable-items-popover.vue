<script lang="ts" setup generic="Item extends CommonItem">
import { type VNodeChild, computed } from 'vue'

import type { CommonItem } from '@/lib/common/Items.ts'

import CommonSearchableItems from './common-searchable-items.vue'

interface Props {
  searchText: string
  placeholder?: string
  items: Item[]
  selectedItemIds: any[]
  placement?: 'top' | 'bottom'
  closeOnSelect?: boolean
}
interface Emits {
  (evt: 'update:search-text', value: string): void
  (evt: 'select-item', value: Item): void
}
interface Slots {
  default(): VNodeChild
  item(context: { item: Item; selected: boolean }): VNodeChild
}

const props = withDefaults(defineProps<Props>(), {
  placement: 'bottom',
  closeOnSelect: false,
})
const emit = defineEmits<Emits>()
defineSlots<Slots>()

const selectItem = (item: Item, hide: () => void) => {
  emit('select-item', item)
  if (props.closeOnSelect) {
    hide()
  }
}

const popoverPlacement = computed<string | undefined>(() => {
  return {
    top: 'top-start',
    bottom: 'bottom-start',
  }[props.placement]
})
</script>

<template>
  <cy-popover
    class="text-primary-80 mr-2 flex grow cursor-pointer items-start text-ellipsis py-1.5 pl-3 pr-2"
    :placement="popoverPlacement"
    custom
  >
    <div class="flex min-h-6 items-center truncate">
      <slot />
    </div>
    <cy-icon
      class="icon-first-line ml-auto"
      :icon="
        placement === 'bottom'
          ? 'ic:round-keyboard-double-arrow-down'
          : 'ic:round-keyboard-double-arrow-up'
      "
    />
    <template #popper="{ hide }">
      <div class="flex max-h-96 flex-col bg-white">
        <CommonSearchableItems
          :search-text="searchText"
          :placeholder="placeholder"
          :items="items"
          :selected-item-ids="selectedItemIds"
          class="max-h-none! min-h-0 grow"
          @update:search-text="emit('update:search-text', $event)"
          @select-item="selectItem($event, hide)"
        >
          <template #item="context">
            <slot name="item" v-bind="context" />
          </template>
        </CommonSearchableItems>
      </div>
    </template>
  </cy-popover>
</template>
