<script lang="ts" setup>
import { ref } from 'vue'
import Draggable from 'vuedraggable'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { StatRestriction } from '@/lib/Character/Stat'

import FloatPageContentTabsWrapper from '@/components/app-layout/float-page/float-page-content-tabs-wrapper.vue'
import FloatPageContent from '@/components/app-layout/float-page/float-page-content.vue'
import FloatPageMain from '@/components/app-layout/float-page/float-page-main.vue'
import FloatPageSub from '@/components/app-layout/float-page/float-page-sub.vue'

import CommonPropInput from '../common/common-prop-input.vue'
import CharacterEquipmentDetailsCloneStat from './character-equipment-details-clone-stat.vue'
import CharacterEquipmentDetailsSelectStat from './character-equipment-details-select-stat.vue'
import EquipmentPropInputContainer from './equipment-prop-input-container.vue'

interface Props {
  equipment: CharacterEquipment
}

const props = defineProps<Props>()

const getStatKey = (stat: StatRestriction) => stat.statId

const enum SelectStatTab {
  Common,
  Clone,
}

const currentSelectStatTab = ref<SelectStatTab>(SelectStatTab.Common)

const cloneStats = (stats: StatRestriction[]) => {
  stats = stats.filter(
    stat => !props.equipment.stats.some(_stat => _stat.equals(stat))
  )
  // eslint-disable-next-line vue/no-mutating-props
  props.equipment.stats.push(...stats)
  currentSelectStatTab.value = SelectStatTab.Common
}
</script>

<template>
  <FloatPageContentTabsWrapper>
    <cy-tabs v-model="currentSelectStatTab">
      <cy-tab :value="SelectStatTab.Common">
        <cy-icon icon="mdi:format-list-bulleted" />
      </cy-tab>
      <cy-tab :value="SelectStatTab.Clone">
        <cy-icon icon="mdi:transfer" />
      </cy-tab>
    </cy-tabs>
    <FloatPageContent v-if="currentSelectStatTab === SelectStatTab.Common">
      <FloatPageMain>
        <Draggable
          v-model="
            // eslint-disable-next-line vue/no-mutating-props
            equipment.stats
          "
          class="space-y-6 px-1"
          :item-key="getStatKey"
          handle=".drag-handle"
        >
          <template #item="{ element: stat }">
            <EquipmentPropInputContainer>
              <CommonPropInput
                v-model:value="stat.value"
                type="number"
                :title="stat.title"
              />
              <template #append>
                <cy-button-icon
                  icon="mdi:close-circle-outline"
                  small
                  color="gray"
                  class="ml-4"
                  @click="equipment.removeStat(stat)"
                />
              </template>
              <template #end>
                <cy-icon
                  icon="ic:baseline-drag-indicator"
                  class="drag-handle flex-shrink-0 cursor-pointer"
                />
              </template>
            </EquipmentPropInputContainer>
          </template>
        </Draggable>
      </FloatPageMain>
      <FloatPageSub>
        <CharacterEquipmentDetailsSelectStat :equipment="equipment" />
      </FloatPageSub>
    </FloatPageContent>
    <FloatPageContent v-else-if="currentSelectStatTab === SelectStatTab.Clone">
      <CharacterEquipmentDetailsCloneStat
        :target-equipment="equipment"
        @submit="cloneStats"
      />
    </FloatPageContent>
  </FloatPageContentTabsWrapper>
</template>
