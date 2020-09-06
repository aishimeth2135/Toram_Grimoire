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
    <cy-input-counter v-for="baseStat in character.baseStats"
      class="counter" :key="baseStat.name"
      :value="baseStat.value" :range="[0, 500]"
      @set-value="setBaseStat(baseStat, $event)">
      <template v-slot:title>
        <cy-icon-text iconify-name="mdi-rhombus-outline">
          {{ baseStat.name }}
        </cy-icon-text>
      </template>
    </cy-input-counter>
    <div class="select-optional-base-stat">
      <div class="title">
        <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle-outline"
          text-size="small" text-color="purple">
          {{ langText('character optional base stat') }}
        </cy-icon-text>
      </div>
      <cy-flex-layout>
        <cy-button type="border" iconify-name="ic-round-close"
          :selected="!character.hasOptinalBaseStat()"
          @click="clearOptionalBaseStat">
          {{ globalLangText('global/none') }}
        </cy-button>
        <cy-button v-for="p in characterOptionalBaseStatList"
          iconify-name="mdi-checkbox-multiple-blank-circle-outline"
          :selected="character.baseStat(p) ? true : false"
          type="border" :key="p" @click="setOptionalBaseStat(p)">
          {{ p }}
        </cy-button>
      </cy-flex-layout>
    </div>
  </section>
</template>
<script>
import { Character } from "@lib/CharacterSystem/CharacterStat/class/main.js";

export default {
  props: ['characterState'],
  inject: ['globalLangText', 'langText'],
  computed: {
    character() {
      return this.characterState.origin;
    },
    characterOptionalBaseStatList() {
      return Character.OPTIONAL_BASE_STAT_LIST;
    }
  },
  methods: {
    setOptionalBaseStat(name) {
      this.character.setOptinalBaseStat(name);
    },
    clearOptionalBaseStat() {
      this.character.clearOptinalBaseStat();
    },
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
  margin-bottom: 0.8rem;
}

.select-optional-base-stat {
  padding-top: 0.6rem;
  margin-top: 1rem;
  padding-left: 0.4rem;
  border-top: 0.1rem solid var(--primary-light);

  > .title {
    margin-bottom: 0.3rem;
  }
}
</style>