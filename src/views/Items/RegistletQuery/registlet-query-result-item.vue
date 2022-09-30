<template>
  <div>
    <div
      class="sticky top-0 z-1 min-w-max"
      :class="{ 'bg-white': detailVisible }"
      @click="detailVisible = !detailVisible"
    >
      <cy-list-item>
        <div class="w-40 flex flex-shrink-0 py-0.5">
          <cy-icon-text
            icon="material-symbols:book-outline-rounded"
            icon-src="image"
            :text-color="detailVisible ? 'orange-60' : 'primary-90'"
          >
            {{ item.name }}
          </cy-icon-text>
        </div>
      </cy-list-item>
    </div>
    <cy-transition>
      <div v-if="detailVisible" class="pt-2 pb-3 pl-6 pr-4 bg-white max-w-full">
        <table class="border-separate border-spacing-y-3">
          <tr>
            <td>{{ t('registlet-query.detail.obtain-levels') }}</td>
            <td>
              <div class="flex items-center space-x-2">
                <div v-for="level in item.obtainLevels" :key="level" class="bg-emerald-5 text-emerald-60 rounded">
                  {{ level }}
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td>{{ t('registlet-query.detail.max-level') }}</td>
            <td>
            </td>
          </tr>
          <tr>
            <td>{{ t('registlet-query.detail.powder-cost') }}</td>
            <td>
            </td>
          </tr>
        </table>
      </div>
    </cy-transition>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

import { RegistletItemBase } from '@/lib/Registlet/Registlet'

interface Props {
  item: RegistletItemBase;
}

defineProps<Props>()

const { t } = useI18n()

const detailVisible = ref(false)
</script>
