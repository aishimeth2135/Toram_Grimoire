<template>
  <div>
    <Render />
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'
import { h } from 'vue'

import BookPageSectionContent from './book-page-section-content.vue'
import BookPageSectionDetail from './book-page-section-detail.vue'
import BookPageSectionEquipment from './book-page-section-equipment.vue'

import { BookPageSection } from '../setup/Book'
import { BookPageSectionTypes } from '../setup/Book/enums'

interface Props {
  section: BookPageSection
}

const props = defineProps<Props>()

const sectionComponent = computed(() => {
  if (props.section.type === BookPageSectionTypes.Content) {
    return BookPageSectionContent
  }
  if (props.section.type === BookPageSectionTypes.Detail) {
    return BookPageSectionDetail
  }
  if (props.section.type === BookPageSectionTypes.Equipment) {
    return BookPageSectionEquipment
  }
  return null
})

const Render = () => {
  return h(sectionComponent, { section: props.section })
}
</script>
