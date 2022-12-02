<template>
  <cy-modal :visible="visible" footer>
    <div v-for="category in categorys" :key="category.id">
      <div>{{ t(`registlet-query.category.${category.id}`) }}</div>
      <div class="divide-y-1 divide-primary-20">
        <div
          v-for="item in category.items"
          :key="item.id"
          class="flex items-center pl-5 pr-4 py-2"
          @click="toggleItem(item)"
        >
          <cy-icon-text
            icon="game-icons:beveled-star"
            :class="{ 'opacity-0': itemSelected(item) }"
          />
          <span class="ml-3">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { RegistletBuild } from '@/lib/Character/RegistletBuild/RegistletBuild'
import { RegistletCategory, RegistletItemBase } from '@/lib/Registlet/Registlet'

interface Props {
  visible: boolean
  registletBuild: RegistletBuild
}

const props = defineProps<Props>()

const { t } = useI18n()

const categorys: RegistletCategory[] = [
  Grimoire.Registlet.statCategory,
  Grimoire.Registlet.skillCategory,
  Grimoire.Registlet.specialCategory,
]

const itemSelectedMap: Map<string, boolean> = reactive(new Map())

watch(
  () => props.registletBuild,
  value => {
    categorys.forEach(category => {
      category.items.forEach(item => itemSelectedMap.set(item.id, false))
    })
    value.items.forEach(item => itemSelectedMap.set(item.base.id, true))
  },
  { immediate: true }
)

const itemSelected = (item: RegistletItemBase) => itemSelectedMap.get(item.id)

const toggleItem = (itemBase: RegistletItemBase) => {
  if (itemSelected(itemBase)) {
    const idx = props.registletBuild.items.findIndex(
      item => item.base.id === itemBase.id
    )
    if (idx > -1) {
      // eslint-disable-next-line vue/no-mutating-props
      props.registletBuild.items.splice(idx, 1)
    }
  } else {
    props.registletBuild.appendItem(itemBase)
  }
}
</script>
