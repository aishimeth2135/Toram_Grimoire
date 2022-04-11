<template>
  <cy-button-border
    :icon="null"
    border-color="light"
    border-color-hover="light-3"
    :selected="selected"
    :class="{
      'py-1': iconDatas.every(iconData => iconData.icons.every(icon => !icon.text)),
    }"
  >
    <template #icon>
      <template v-for="(iconData, idx) in iconDatas" :key="iconData.iid">
        <cy-icon-text
          v-if="idx !== 0"
          icon="mdi-slash-forward"
          icon-color="light-3"
        />
        <div class="flex items-center space-x-1">
          <template v-for="icon in iconData.icons" :key="icon.iid">
            <cy-icon-text
              v-if="!icon.text"
              :icon="icon.icon"
              :icon-src="icon.src"
            />
            <cy-icon-text
              v-else
              :icon="icon.icon"
              :icon-src="icon.src"
              display-block
            >
              <span class="text-sm">{{ icon.text || '' }}</span>
            </cy-icon-text>
          </template>
        </div>
      </template>
    </template>
  </cy-button-border>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { EquipmentRestriction } from '@/lib/Skill/SkillComputingContainer'
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'

interface Props {
  equipments: EquipmentRestriction[];
  selected?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
})

const { t } = useI18n()

const iconDatas = computed(() => {
  return props.equipments.map((equip, idx) => {
    const icons: { icon: string; src: string; text?: string }[] = []
    const fields = (['main', 'sub', 'body'] as const).filter(key => equip[key] !== null)
    if (fields.length === 0) {
      icons.push({ icon: 'mdi:checkbox-multiple-blank-circle-outline', src: 'iconify', text: t('skill-query.equipment.none') })
    }
    const operatorIcon = 'ic-round-add'
    fields.forEach((key, fieldIdx) => {
      if (fieldIdx !== 0) {
        icons.push({ icon: operatorIcon, src: 'iconify' })
      } else {
        if (fields.length === 1 && key === 'sub') {
          icons.push({ icon: 'mdi:radiobox-marked', src: 'iconify' })
          icons.push({ icon: 'ic-round-add', src: 'iconify' })
        }
      }
      const icon = CharacterEquipment.getImagePath(equip[key]!)
      icons.push({ icon, src: 'image' })
    })
    return {
      icons: icons.map((icon, iid) => ({ ...icon, iid })),
      iid: idx,
    }
  })
})
</script>

<style lang="postcss" scoped>
.skill-equipment-button {
  @apply inline-flex items-center space-x-2 border-b-1 border-transparent hover:border-light-2 px-3 cursor-pointer;

  &.selected {
    @apply border-light-4 hover:border-light-4;
  }
}
</style>
