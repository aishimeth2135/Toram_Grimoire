<template>
  <cy-modal :visible="visible" footer @close="emit('close')">
    <div class="sticky top-0 mb-3">
      <cy-title-input
        v-model:value="searchText"
        icon="ic:baseline-search"
        clearable
      />
    </div>
    <div>
      <div v-for="category in categoryResults" :key="category.id">
        <div class="text-sm text-primary-40 pt-2">
          {{ t(`registlet-query.category.${category.id}`) }}
        </div>
        <CardRows class="mt-1">
          <CardRow
            v-for="item in category.items"
            :key="item.id"
            class="flex items-center pl-3 pr-3 py-2 hover:!bg-primary-5 cursor-pointer duration-150"
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
            >
              {{ item.name }}
            </span>
          </CardRow>
        </CardRows>
      </div>
    </div>
  </cy-modal>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'

import Grimoire from '@/shared/Grimoire'

import { RegistletBuild } from '@/lib/Character/RegistletBuild/RegistletBuild'
import { RegistletCategory, RegistletItemBase } from '@/lib/Registlet/Registlet'

import CardRow from '@/components/card/card-row.vue'
import CardRows from '@/components/card/card-rows.vue'

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

const searchText = ref('')

const categoryResults = computed<{ id: string; items: RegistletItemBase[] }[]>(
  () => {
    if (!searchText.value) {
      return categorys
    }
    return categorys
      .map(category => ({
        id: category.id,
        items: category.items.filter(item =>
          item.name.includes(searchText.value)
        ),
      }))
      .filter(item => item.items.length > 0)
  }
)
</script>
