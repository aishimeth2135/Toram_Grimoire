<template>
  <div class="border-1 border-primary-30 rounded p-2 pr-4">
    <div class="flex items-center">
      <cy-button-toggle
        v-model:selected="
          // eslint-disable-next-line vue/no-mutating-props
          item.enabled
        "
      >
        {{ item.base.name }}
      </cy-button-toggle>
      <div class="flex items-center ml-auto">
        <cy-input-counter
          v-model:value="
            // eslint-disable-next-line vue/no-mutating-props
            item.level
          "
          inline
          class="!flex"
        />
        <cy-button-icon
          icon="ic:round-delete-outline"
          class="ml-4"
          color="gray"
          @click="item.remove()"
        />
      </div>
    </div>
    <div v-if="detailVisible" class="p-2 pl-4">
      <div
        v-if="!!(item.base.link instanceof StatBase)"
        class="flex items-center"
      >
        <div>{{ item.base.link.text }}</div>
        <div>+</div>
        <div class="ml-2 border-x border-primary-20 px-2 text-primary-60">
          {{ handleValue(item.base.rows[0].value) }}
        </div>
      </div>
      <template v-else>
        <template v-for="row in item.base.rows" :key="row.type + row.value">
          <RenderCaptionValue v-if="row.type === 'caption'" :text="row.value" />
          <div
            v-else-if="row.type === 'remark'"
            class="text-sm text-primary-40"
          >
            {{ row.value }}
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import { RegistletItem } from '@/lib/Character/RegistletBuild/RegistletBuild'
import { StatBase } from '@/lib/Character/Stat'

import { getRegistletCaptionRender } from '@/views/Registlet/RegistletQuery/setup'

interface Props {
  item: RegistletItem
  detailVisible?: boolean
}

withDefaults(defineProps<Props>(), {
  detailVisible: false,
})

const { t } = useI18n()

const handleValue = (str: string) =>
  str
    .replace(/Lv/g, t('registlet-query.detail.registlet-level'))
    .replace(/\*/g, '×')

const RenderCaptionValue = getRegistletCaptionRender(handleValue)
</script>
