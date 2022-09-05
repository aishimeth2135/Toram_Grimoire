<template>
  <span class="inline-flex items-center">
    <i18n-t
      keypath="character-simulator.character-stat-detail.equipped-with-text"
      tag="div"
      scope="global"
      class="text-orange-60"
    >
      <template #equip>
        <span class="mx-1 text-emerald-60 inline-flex items-center">
          <template v-for="text in equipmentTexts" :key="'text-i-' + text.iid">
            <cy-icon-text
              v-if="text.text === '+'"
              icon="ic-round-add"
            />
            <cy-icon-text
              v-else-if="text.text === '/'"
              icon="mdi-slash-forward"
            />
            <span
              v-else-if="text.text === '(' || text.text === ')'"
              :key="'separate-' + text.iid"
              class="border-l border-solid border-primary-30 inline-block h-4 mx-2"
            />
            <span v-else :key="'text-' + text.iid">
              {{ text.text }}
            </span>
          </template>
        </span>
      </template>
    </i18n-t>
  </span>
</template>

<script lang="ts" setup>
interface Props {
  equipmentTexts: {
    iid: number;
    text: string;
  }[];
}

defineProps<Props>()
</script>
