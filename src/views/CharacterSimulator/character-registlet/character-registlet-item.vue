<template>
  <CardRow class="relative py-2 pl-2 pr-4" :class="item.enabled ? 'opacity-100' : 'opacity-60'">
    <cy-button-icon
      icon="ic:round-delete-outline"
      color="gray"
      class="absolute right-3 top-3.5"
      @click="item.remove()"
    />
    <div class="flex flex-wrap items-center">
      <div class="mr-auto flex items-center" style="min-width: 14rem">
        <cy-button-check
          v-model:selected="
            // eslint-disable-next-line vue/no-mutating-props
            item.enabled
          "
        />
        <div class="ml-1 text-primary-80">{{ item.base.name }}</div>
      </div>
      <div v-if="item.enabled" class="ml-10 mr-6 flex items-center">
        <span class="text-primary-30">Lv.</span>
        <cy-input-counter
          v-model:value="
            // eslint-disable-next-line vue/no-mutating-props
            item.level
          "
          inline
          class="!flex"
        />
      </div>
    </div>
    <div v-if="item.enabled && detailVisible" class="p-2 pl-10">
      <div v-if="!!(item.base.link instanceof StatBase)" class="flex items-center">
        <div>{{ item.base.link.text }}</div>
        <div>+</div>
        <div class="ml-2 border-x border-primary-20 px-2 text-primary-60">
          {{ handleValue(item.base.rows[0].value) }}
        </div>
      </div>
      <template v-else>
        <template v-for="row in item.base.rows" :key="row.type + row.value">
          <RenderCaptionValue v-if="row.type === 'caption'" :text="row.value" />
          <div v-else-if="row.type === 'remark'" class="text-sm text-primary-40">
            {{ row.value }}
          </div>
        </template>
      </template>
    </div>
  </CardRow>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import type { RegistletItem } from '@/lib/Character/RegistletBuild'
import { StatBase } from '@/lib/Character/Stat'

import CardRow from '@/components/card/card-row.vue'
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
  str.replace(/Lv/g, t('registlet-query.detail.registlet-level')).replace(/\*/g, '×')

const RenderCaptionValue = getRegistletCaptionRender(handleValue)
</script>
