<template>
  <section>
    <cy-input-counter class="counter"
      :value="character.level" :range="[0, 210]"
      @set-value="setLevel($event)">
      <template v-slot:title>
        <cy-icon-text iconify-name="bx-bxs-user">
          {{ langText('character level') }}
        </cy-icon-text>
      </template>
    </cy-input-counter>
    <br />
    <template v-for="baseStat in character.baseStats">
      <cy-input-counter class="counter"
        :key="baseStat.name"
        :value="baseStat.value" :range="[0, 500]"
        @set-value="setBaseStat(baseStat, $event)">
        <template v-slot:title>
          <cy-icon-text iconify-name="mdi-rhombus-outline">
            {{ baseStat.name }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
      <br :key="baseStat.name + '-br'" />
    </template>
  </section>
</template>
<script>
export default {
  props: ['characterState'],
  inject: ['langText'],
  computed: {
    character() {
      return this.characterState.origin;
    }
  },
  methods: {
    setLevel(v) {
      this.character.level = v;
    },
    setBaseStat(baseStat, v) {
      baseStat.value = v;
    }
  }
}
</script>
<style lang="less" scoped>
.counter {
  margin: 0.4rem;
}
</style>