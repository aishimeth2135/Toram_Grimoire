<template>
  <div
    v-if="currentContainer"
    class="flex items-start"
    :style="{ marginLeft: root ? '1.8rem' : (maxLayer - layer) * 0.5 + 'rem' }"
    :class="{ 'opacity-50': currentContainer.hidden }"
  >
    <div
      class="w-20 rounded-md bg-primary-10 bg-opacity-50 p-2 text-center text-primary-80"
      :class="{ 'opacity-60': !currentContainerEnabled }"
    >
      {{ currentContainerResult }}
    </div>
    <div class="space-y-4">
      <div
        v-for="container in editableContainers"
        :key="container.base.id"
        class="flex items-start"
      >
        <div class="flex h-10 items-center">
          <cy-button-toggle
            v-model:selected="container.enabled"
            :disabled="!container.base.controls.toggle"
          />
        </div>
        <div
          class="space-y-2"
          :class="{ 'opacity-60': !container.enabled && !container.hidden }"
        >
          <div
            v-for="item in getContainerItems(container)"
            :key="item.base.id"
            class="flex items-center"
          >
            <cy-input-counter
              v-if="editedItem !== item"
              v-model:value="item.value"
              :range="[item.base.min, item.base.max]"
              :step="item.base.step"
              input-width="3rem"
            >
              <template #title>
                <cy-icon-text v-if="!container.selectable">
                  <span
                    v-if="!item.isCustom()"
                    v-html="
                      markText(
                        t('damage-calculation.item-base-titles.' + item.base.id)
                      )
                    "
                  ></span>
                  <template v-else>
                    {{ (item as CalcItemCustom).name }}
                  </template>
                </cy-icon-text>
                <cy-button-check
                  v-else
                  inline
                  :selected="container.currentItem === item"
                  @click="container!.selectItem(item.base.id)"
                >
                  {{ t('damage-calculation.item-base-titles.' + item.base.id) }}
                </cy-button-check>
              </template>
              <template #unit>
                {{ item.base.unit }}
              </template>
            </cy-input-counter>
            <cy-title-input
              v-else-if="item instanceof CalcItemCustom"
              v-model:value="item.name"
              class="w-64"
              @keyup.enter="toggleEditedItem(null)"
            />
            <cy-button-icon
              v-if="item.isCustom()"
              icon="ant-design:edit-outlined"
              class="ml-3"
              :selected="editedItem === item"
              @click="toggleEditedItem(item)"
            />
            <cy-button-icon
              v-if="item.isCustom()"
              icon="jam:close-circle"
              class="ml-2"
              @click="removeCustomItem(item)"
            />
          </div>
          <div
            v-if="container.customItemAddable"
            class="flex w-64 cursor-pointer items-center justify-center border border-primary-50 bg-white p-1.5 opacity-60 duration-300 hover:opacity-100"
            @click="createCustomItem"
          >
            <cy-icon-text
              icon="ic:round-add-circle-outline"
              text-color="primary-50"
            >
              {{ t('damage-calculation.create-custom-item') }}
            </cy-icon-text>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div
    v-else
    class="relative border-primary-50 border-opacity-70 py-3 px-2"
    :class="{ 'border-l-2': !root }"
    style="margin-left: -0.2rem"
  >
    <div v-if="typeof calcStructItem !== 'string'">
      <template
        v-if="
          calcStructItem.operator === '+' || calcStructItem.operator === '*'
        "
      >
        <DamageCalculationItem
          :calc-struct-item="calcStructItem.left"
          :layer="layer + 1"
        />
        <div>
          <cy-icon-text
            :icon="
              calcStructItem.operator === '+'
                ? 'mono-icons:add'
                : 'eva:close-fill'
            "
            icon-width="2rem"
            class="mt-1"
            :style="{ 'margin-left': (maxLayer + 2 - layer) * 0.5 + 'rem' }"
          />
        </div>
        <DamageCalculationItem
          :calc-struct-item="calcStructItem.right"
          :layer="layer + 1"
        />
      </template>
      <template
        v-else-if="
          calcStructItem.operator === '+++' || calcStructItem.operator === '***'
        "
      >
        <template
          v-for="(structItem, idx) in handleCalcStructList(calcStructItem)"
          :key="getCalcItemId(structItem)"
        >
          <div v-if="idx !== 0">
            <cy-icon-text
              :icon="
                calcStructItem.operator === '+++'
                  ? 'mono-icons:add'
                  : 'eva:close-fill'
              "
              icon-width="2rem"
              class="mt-1"
              :style="{ 'margin-left': (maxLayer + 2 - layer) * 0.5 + 'rem' }"
            />
          </div>
          <DamageCalculationItem
            :calc-struct-item="structItem"
            :layer="layer + 1"
          />
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
export default {
  name: 'DamageCalculationItem',
}
</script>

<script lang="ts" setup>
import { storeToRefs } from 'pinia'
import { computed, inject, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'

import { useDamageCalculationStore } from '@/stores/views/damage-calculation'

import { numberToFixed } from '@/shared/utils/number'
import { markText } from '@/shared/utils/view'

import {
  CalcItem,
  CalcItemContainer,
  CalcItemCustom,
} from '@/lib/Calculation/Damage/Calculation'
import {
  CalcStructAction,
  CalcStructItem,
  CalcStructMultiple,
  isCalcStructItem,
} from '@/lib/Calculation/Damage/Calculation/base'
import { ContainerTypes } from '@/lib/Calculation/Damage/Calculation/enums'

import { DamageCalculationRootInjectionKey } from './injection-keys'

interface Props {
  calcStructItem: CalcStructItem
  root?: boolean
  layer?: number
}

const props = withDefaults(defineProps<Props>(), {
  root: false,
  layer: 0,
})

const { calcStructItem } = toRefs(props)

const { t } = useI18n()

const store = useDamageCalculationStore()

const { currentCalculation } = storeToRefs(store)

const { currentCalcMode } = inject(DamageCalculationRootInjectionKey)!
const maxLayer = computed(() => currentCalcMode.value.maxLayer)

const currentContainer = computed(() => {
  if (typeof calcStructItem.value === 'string') {
    return currentCalculation.value.containers.get(calcStructItem.value) ?? null
  }
  return null
})

const editableContainers = computed(() => {
  if (!currentContainer.value) {
    return []
  }
  if (currentContainer.value.base.isVirtual) {
    return currentContainer.value.base.references.map(
      reference =>
        currentContainer.value!.belongCalculation.containers.get(reference)!
    )
  }
  return [currentContainer.value]
})

const currentContainerEnabled = computed(() =>
  editableContainers.value.some(container => container.enabled)
)

const currentContainerResult = computed(() => {
  if (currentContainer.value) {
    const container = currentContainer.value
    let res = container.result()
    if (!container.base.floorResult) {
      res = numberToFixed(res, 2)
    }
    return container.base.isMultiplier ? res + '%' : res
  }
  return 0
})

const getContainerItems = (container: CalcItemContainer) => {
  if (!container.selectable && container.base.type === ContainerTypes.Options) {
    return [container.currentItem]
  }
  return [...Array.from(container.items.values()), ...container.customItems]
}

const handleCalcStructList = (structItem: CalcStructMultiple) => {
  if (structItem.operator === '+++') {
    return structItem.list
  }
  return structItem.list.filter(item =>
    isCalcStructItem(item)
  ) as CalcStructItem[]
}

const getCalcItemId = (
  structItem: CalcStructItem | CalcStructAction
): string => {
  if (!isCalcStructItem(structItem)) {
    return structItem
  }
  if (typeof structItem === 'string') {
    return structItem
  }
  if (structItem.operator === '+' || structItem.operator === '*') {
    return `(${getCalcItemId(structItem.left)})${
      structItem.operator
    }(${getCalcItemId(structItem.right)})`
  }
  if (structItem.operator === '+++' || structItem.operator === '***') {
    return structItem.list
      .map(item => `(${getCalcItemId(item)})`)
      .join(structItem.operator)
  }
  return structItem.toString()
}

const createCustomItem = () => {
  if (!currentContainer.value || !currentContainer.value) {
    return
  }
  const newItem = currentContainer.value.createCustomItem()
  if (newItem) {
    newItem.name = t(
      'damage-calculation.item-base-titles.' +
        currentContainer.value.currentItem.base.id
    )
  }
}
const removeCustomItem = (item: CalcItemCustom) => {
  if (!currentContainer.value) {
    return
  }
  currentContainer.value.removeCustomItem(item)
}

const editedItem = ref<CalcItem | null>(null)

const toggleEditedItem = (item: CalcItem | null) => {
  editedItem.value = editedItem.value === item ? null : item
}
</script>
