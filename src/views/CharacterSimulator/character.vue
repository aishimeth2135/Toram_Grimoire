<template>
  <section>
    <div class="top">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text iconify-name="bx-bxs-face">
              {{ character.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item v-for="(chara, i) in characterStates" :key="chara.iid"
            @click="$emit('update:current-character-state-index', i)">
            <cy-icon-text iconify-name="bx-bx-face">
              {{ chara.origin.name }}
            </cy-icon-text>
          </cy-list-item>
          <cy-list-item @click="$emit('create-character')">
            <cy-icon-text iconify-name="ic-round-add-circle-outline">
              {{ langText('append character') }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
    </div>
    <div class="content-title">
      <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle-outline"
        text-size="small" text-color="purple">
        {{ langText('character name') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <cy-title-input iconify-name="mdi-clipboard-text-outline">
        <input type="text" v-model="character.name">
      </cy-title-input>
    </div>
    <div class="content-title">
      <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle-outline"
        text-size="small" text-color="purple">
        {{ langText('character level') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <cy-input-counter class="counter"
        :value="character.level" :range="[0, 250]"
        @set-value="setLevel($event)">
        <template v-slot:title>
          <cy-icon-text iconify-name="bx-bxs-user">
            {{ langText('character level') }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
    </div>
    <div class="content-title">
      <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle-outline"
        text-size="small" text-color="purple">
        {{ langText('character stat points') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <cy-input-counter v-for="baseStat in character.normalBaseStats"
        class="counter" :key="baseStat.name"
        :value="baseStat.value" :range="[0, 500]"
        @set-value="setBaseStat(baseStat, $event)">
        <template v-slot:title>
          <cy-icon-text iconify-name="mdi-rhombus-outline">
            {{ baseStat.name }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
      <cy-transition type="fade-slide-right" mode="out-in">
        <cy-input-counter v-if="character.hasOptinalBaseStat()"
          :key="character.optionalBaseStat.name" class="counter"
          :value="character.optionalBaseStat.value" :range="[0, 255]"
          @set-value="setBaseStat(character.optionalBaseStat, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-rhombus-outline">
              {{ character.optionalBaseStat.name }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </cy-transition>
    </div>
    <div class="content-title">
      <cy-icon-text iconify-name="mdi-checkbox-multiple-blank-circle-outline"
        text-size="small" text-color="purple">
        {{ langText('character optional base stat') }}
      </cy-icon-text>
    </div>
    <div class="content">
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
import Vuex from "vuex";
import store from "@store/main";

import { Character } from "@lib/CharacterSystem/CharacterStat/class/main.js";

export default {
  store,
  props: ['characterState'],
  inject: ['globalLangText', 'langText'],
  computed: {
    ...Vuex.mapState('character', {
      'characterStates': 'characters'
    }),
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
  margin-bottom: 0.6rem;
}

.content-title {
  margin-top: 1rem;
  margin-bottom: 0.6rem;
  padding-left: 0.3rem;
}

.content {
  padding-left: 1rem;
}
</style>