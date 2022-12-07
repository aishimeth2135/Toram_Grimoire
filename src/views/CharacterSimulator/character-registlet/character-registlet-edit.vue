<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <div v-for="category in categorys" :key="category.id">
      <div class="text-sm text-primary-40 pt-2">
        {{ t(`registlet-query.category.${category.id}`) }}
      </div>
      <div class="divide-y-1 divide-primary-10">
        <div
          v-for="item in category.items"
          :key="item.id"
          class="flex items-center pl-3 pr-3 py-2 hover:bg-primary-5 cursor-pointer duration-150"
          @click="registletBuild.toggleItem(item)"
        >
          <cy-icon-text
            icon="game-icons:beveled-star"
            :class="{ 'opacity-0': !registletBuild.itemSelected(item) }"
          />
          <span
            class="ml-3"
            :class="
              registletBuild.itemSelected(item)
                ? 'text-primary-70'
                : 'text-gray-50'
            "
            >{{ item.name }}</span
          >
        </div>
      </div>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { RegistletBuild } from '@/lib/Character/RegistletBuild/RegistletBuild'
import { RegistletCategory } from '@/lib/Registlet/Registlet'

interface Props {
  visible: boolean
  registletBuild: RegistletBuild
}
interface Emits {
  (evt: 'close'): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const { t } = useI18n()

const categorys: RegistletCategory[] = [
  Grimoire.Registlet.statCategory,
  Grimoire.Registlet.skillCategory,
  Grimoire.Registlet.specialCategory,
]
</script>
