<template>
  <cy-button-action
    :icon="null"
    :selected="selected"
    :class="{
      'py-1': iconDatas.every(iconData =>
        iconData.icons.every(icon => !icon.text)
      ),
    }"
  >
    <template #default>
      <div class="flex items-center">
        <template v-for="(iconData, idx) in iconDatas" :key="iconData.iid">
          <cy-icon
            v-if="idx !== 0"
            icon="mdi-slash-forward"
            class="text-primary-50"
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
                block
                text-minimize
              >
                {{ icon.text || '' }}
              </cy-icon-text>
            </template>
          </div>
        </template>
      </div>
    </template>
  </cy-button-action>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { CharacterEquipment } from '@/lib/Character/CharacterEquipment'
import { EquipmentRestrictions } from '@/lib/Character/Stat'

import { IconSrc } from '@/components/cyteria/icon/setup'

interface Props {
  equipments: EquipmentRestrictions[]
  selected?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  selected: false,
})

const { t } = useI18n()

interface IconItem {
  icon: string
  src: IconSrc
  text?: string
}

const iconDatas = computed(() => {
  return props.equipments.map((equip, idx) => {
    const icons: IconItem[] = []
    const fields = (['main', 'sub', 'body'] as const).filter(
      key => equip[key] !== null
    )
    if (fields.length === 0) {
      icons.push({
        icon: 'mdi:checkbox-multiple-blank-circle-outline',
        src: 'iconify',
        text: t('skill-query.equipment.none'),
      })
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
  @apply inline-flex cursor-pointer items-center space-x-2 border-b-1 border-transparent px-3 hover:border-primary-30;

  &.selected {
    @apply border-primary-60 hover:border-primary-60;
  }
}
</style>
