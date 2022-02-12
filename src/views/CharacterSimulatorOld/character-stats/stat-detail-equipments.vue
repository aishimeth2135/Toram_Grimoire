<template>
  <span class="inline-flex items-center">
    <span class="text-orange">{{ $lang('equipped with: prefix text') }}</span>
    <span class="mx-1 text-green inline-flex items-center">
      <template v-for="t in equipmentTexts">
        <cy-icon-text
          v-if="t.text === '+'"
          :key="'text-i-' + t.iid"
          icon="ic-round-add"
        />
        <cy-icon-text
          v-else-if="t.text === '/'"
          :key="'text-i-' + t.iid"
          icon="mdi-slash-forward"
        />
        <span
          v-else-if="t.text === '(' || t.text === ')'"
          :key="'separate-' + t.iid"
          class="border-l border-solid border-light-2 inline-block h-4 mx-2"
        />
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
  RegisterLang: {
    root: 'Character Simulator/show character stats',
  },
  props: ['equipmentTexts'],
}
</script>
