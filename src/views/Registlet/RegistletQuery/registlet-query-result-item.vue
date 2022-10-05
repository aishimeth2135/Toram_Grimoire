<template>
  <div>
    <div
      class="sticky top-0 z-1 min-w-max"
      :class="{ 'bg-white': detailVisible }"
      @click="detailVisible = !detailVisible"
    >
      <cy-list-item>
        <div class="w-60 flex flex-shrink-0 py-0.5">
          <cy-icon-text
            icon="mdi:book-outline"
            :text-color="detailVisible ? 'red-70' : 'primary-90'"
          >
            {{ item.name }}
          </cy-icon-text>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="pb-3 pl-4 pr-3 bg-white max-w-full">
        <div class="border border-l-2 border-red-10 rounded py-3 px-4 mt-1 mb-2">
          <div v-if="(item.link instanceof StatBase)" class="flex items-center">
            <div>{{ item.link.text }}</div>
            <div>+</div>
            <div class="ml-2 px-2 border-x border-primary-20 text-primary-60">
              {{ handleValue(item.rows[0].value) }}
            </div>
          </div>
          <div v-else class="space-y-2">
            <template v-for="row in item.rows" :key="row.type + row.value">
              <div v-if="row.type === 'caption'" v-html="handleCaptionValue(row.value)">
              </div>
              <div v-else-if="row.type === 'remark'" class="text-sm text-primary-40">
                {{ row.value }}
              </div>
            </template>
          </div>
        </div>
        <div>
          <table class="border-separate border-spacing-y-2 border-spacing-x-4">
            <tr>
              <td class="text-stone-40 text-sm text-right">{{ t('registlet-query.detail.obtain-levels') }}</td>
              <td class="text-primary-60">
                <div v-if="item.obtainLevels.length > 0" class="flex items-center space-x-2">
                  <div v-for="level in item.obtainLevels" :key="level" class="bg-emerald-5 text-emerald-60 rounded px-2">
                    {{ level }}
                  </div>
                </div>
                <template v-else>
                  {{ t('registlet-query.detail.obtain-levels-all') }}
                </template>
              </td>
            </tr>
            <tr>
              <td class="text-stone-40 text-sm text-right">{{ t('registlet-query.detail.max-level') }}</td>
              <td class="text-primary-60">
                {{ item.maxLevel }}
              </td>
            </tr>
            <tr>
              <td class="text-stone-40 text-sm text-right">{{ t('registlet-query.detail.powder-cost') }}</td>
              <td class="text-primary-60">
                <span>{{ item.powderCost }}</span>
                <span class="ml-3 text-blue-40">{{ `(${item.powderCostAdditional})` }}</span>
              </td>
            </tr>
          </table>
        </div>
      </div>
    </cy-transition>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { RegistletItemBase } from '@/lib/Registlet/Registlet'
import { StatBase } from '@/lib/Character/Stat'

import { useRegistletQueryState } from './setup'

interface Props {
  item: RegistletItemBase;
}

defineProps<Props>()

const { t } = useI18n()
const registletQueryState = useRegistletQueryState()

const detailVisible = ref(registletQueryState.itemDefaultVisible)

watch(() => registletQueryState.itemDefaultVisible, value => {
  detailVisible.value = value
})

const handleValue = (str: string) => str.replace(/Lv/g, t('registlet-query.detail.registlet-level'))

const handleCaptionValue = (str: string) => str.replace(/\$\{([^}]+)\}/g, (match, p1) => {
  return `<span class="inline-block border-x border-primary-30 text-primary-60 px-2 mx-2">${handleValue(p1)}</span>`
})
</script>
