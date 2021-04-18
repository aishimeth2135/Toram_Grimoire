<template>
  <span class="inline-flex items-center">
    <span class="text-orange">{{ $lang('equipped with: prefix text') }}</span>
    <span class="mx-1 text-green inline-flex items-center">
      <template v-for="t in equipmentTexts">
        <cy-icon-text v-if="t.text === '+'"
          :key="'text-i-' + t.iid"
          iconify-name="ic-round-add" />
        <cy-icon-text v-else-if="t.text === '/'"
          :key="'text-i-' + t.iid"
          iconify-name="mdi-slash-forward" />
        <span v-else-if="t.text === '(' || t.text === ')'"
          :key="'separate-' + t.iid"
          class="border-l border-solid border-light-2 inline-block h-4 mx-2" />
        <span v-else :key="'text-' + t.iid">
          {{ t.text }}
        </span>
      </template>
    </span>
    <span class="text-orange">{{ $lang('equipped with: suffix text') }}</span>
  </span>
</template>
<script>
export default {
  props: ['equipmentTexts']
}
</script>