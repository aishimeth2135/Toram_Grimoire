<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { StatBase } from '@/lib/Character/Stat'
import type { RegistletItemBase } from '@/lib/Registlet/RegistletItem'

import RegistletCaptionValue from './registlet-caption-value.vue'

interface Props {
  registletItem: RegistletItemBase
  rowsClass?: string
}

defineProps<Props>()

const { t } = useI18n()

const handleValue = (str: string) =>
  str.replace(/Lv/g, t('registlet-query.detail.registlet-level')).replace(/\*/g, '×')
</script>

<template>
  <div>
    <div v-if="registletItem.link instanceof StatBase" class="flex items-center">
      <div>{{ registletItem.link.text }}</div>
      <div>+</div>
      <div class="border-primary-20 text-primary-60 ml-2 border-x px-2">
        {{ handleValue(registletItem.rows[0].value) }}
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
