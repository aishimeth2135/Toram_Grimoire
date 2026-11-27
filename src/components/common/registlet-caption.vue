<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { StatTypes } from '@/lib/Character/Stat'
import type { RegistletItemBase } from '@/lib/Registlet/RegistletItem'

import RegistletCaptionValue from './registlet-caption-value.vue'

interface Props {
  registletItem: RegistletItemBase
  rowsClass?: string
}

const props = defineProps<Props>()

const { t } = useI18n()

const handleValue = (str: string) =>
  str.replace(/Lv/g, t('registlet-query.detail.registlet-level')).replace(/\*/g, '×')

const statDisplay = computed(() => {
  const item = props.registletItem
  if (!item.isStat()) {
    return null
  }

  const { statBase, statType } = item
  return statType === StatTypes.Constant
    ? { title: statBase.text, tail: '' }
    : statBase.getShowData(statType, 0)
})
</script>

<template>
  <div>
    <div v-if="statDisplay" class="flex items-center">
      <div>{{ statDisplay.title }}</div>
      <div>+</div>
      <div class="border-primary-20 text-primary-60 ml-2 border-x px-2">
        {{ handleValue(registletItem.rows[0].value) + statDisplay.tail }}
      </div>
    </div>
    <div v-else :class="rowsClass">
      <template v-for="row in registletItem.rows" :key="row.type + row.value">
        <div v-if="row.type === 'caption'">
          <RegistletCaptionValue :text="row.value" :handle-value="handleValue" />
        </div>
        <div v-else-if="row.type === 'remark'" class="text-primary-40 text-sm">
          {{ row.value }}
        </div>
      </template>
    </div>
  </div>
</template>
