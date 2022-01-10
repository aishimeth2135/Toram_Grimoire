<template>
  <section>
    <div class="top">
      <cy-options>
        <template #title>
          <cy-list-item>
            <cy-icon-text icon="bx-bxs-face">
              {{ character.name }}
            </cy-icon-text>
          </cy-list-item>
        </template>
        <template #options>
          <cy-list-item
            v-for="(chara, idx) in characterStates"
            :key="chara.iid"
            :selected="idx === currentCharacterStateIndex"
            @click="store.setCurrentCharacter(idx)"
          >
            <cy-icon-text icon="bx-bx-face">
              {{ chara.origin.name }}
            </cy-icon-text>
          </cy-list-item>
          <cy-list-item @click="$emit('create-character')">
            <cy-icon-text icon="ic-round-add-circle-outline" text-color="light-3">
              {{ $lang('append character') }}
            </cy-icon-text>
          </cy-list-item>
        </template>
      </cy-options>
      <div class="buttons">
        <cy-button-border icon="mdi-content-copy" @click="copyCurrentCharacter">
          {{ $rootLang('global/copy') }}
        </cy-button-border>
        <cy-button-border icon="ic-baseline-delete-outline" @click="removeCurrentCharacter">
          {{ $rootLang('global/remove') }}
        </cy-button-border>
      </div>
    </div>
    <div class="content-title">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ $lang('character name') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <cy-title-input
        v-model:value="character.name"
        icon="mdi-clipboard-text-outline"
      />
    </div>
    <div class="content-title">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ $lang('character level') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <cy-input-counter
        class="counter"
        :value="character.level"
        :range="ranges.characterLevel"
        @update:value="setLevel($event)"
      >
        <template #title>
          <cy-icon-text icon="bx-bxs-user">
            {{ $lang('character level') }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
    </div>
    <div class="content-title">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ $lang('character stat points') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <cy-input-counter
        v-for="baseStat in character.normalBaseStats"
        :key="baseStat.name"
        class="counter"
        :value="baseStat.value"
        :range="ranges.baseStat"
        @update:value="setBaseStat(baseStat, $event)"
      >
        <template #title>
          <cy-icon-text icon="mdi-rhombus-outline">
            {{ baseStat.name }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
      <cy-transition type="fade-slide-right" mode="out-in">
        <cy-input-counter
          v-if="character.hasOptinalBaseStat()"
          :key="character.optionalBaseStat.name"
          class="counter"
          :value="character.optionalBaseStat.value"
          :range="ranges.optionalBaseStat"
          @update:value="setBaseStat(character.optionalBaseStat, $event)"
        >
          <template #title>
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ character.optionalBaseStat.name }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </cy-transition>
    </div>
    <div class="content-title">
      <cy-icon-text
        icon="mdi-checkbox-multiple-blank-circle-outline"
        size="small"
        text-color="purple"
      >
        {{ $lang('character optional base stat') }}
      </cy-icon-text>
    </div>
    <div class="content">
      <div class="flex items-center flex-wrap">
        <cy-button-border
          icon="ic-round-close"
          :selected="!character.hasOptinalBaseStat()"
          @click="clearOptionalBaseStat"
        >
          {{ $rootLang('global/none') }}
        </cy-button-border>
        <cy-button-border
          v-for="p in characterOptionalBaseStatList"
          :key="p"
          icon="mdi-checkbox-multiple-blank-circle-outline"
          :selected="character.baseStat(p) ? true : false"
          @click="setOptionalBaseStat(p)"
        >
          {{ p }}
        </cy-button-border>
      </div>
    </div>
  </section>
</template>

<script>
import { mapState } from 'pinia';

import { useCharacterStore } from '@/stores/views/character';

import { CharacterOptionalBaseStatTypes } from '@/lib/Character/Character/enums';

export default {
  name: 'CharacterSimulatorCharacter',
  RegisterLang: 'Character Simulator',
  props: ['characterState'],
  emits: ['create-character'],
  setup() {
    const store = useCharacterStore();
    return { store };
  },
  data() {
    return {
      ranges: {
        characterLevel: [1, 250],
        baseStat: [1, 500],
        optionalBaseStat: [1, 255],
      },
    };
  },
  computed: {
    ...mapState(useCharacterStore, {
      'characterStates': 'characters',
      'currentCharacterStateIndex': 'currentCharacterIndex',
    }),
    character() {
      return this.characterState.origin;
    },
    characterOptionalBaseStatList() {
      return Object.values(CharacterOptionalBaseStatTypes);
    },
  },
  methods: {
    removeCurrentCharacter() {
      if (this.characterStates.length <= 1) {
        this.$notify(this.$lang('Warn/Must have at least one character'));
        return;
      }
      const from = this.characterState.origin;
      this.store.removeCharacter(this.currentCharacterStateIndex);
      this.$notify(this.$lang('Warn/Remove character successfully', [from.name]),
        'ic-round-delete', null, {
          buttons: [{
            text: this.$rootLang('global/recovery'),
            click: () => {
              this.store.createCharacter(from);
              this.$notify(this.$lang('Warn/Recovery character successfully', [from.name]));
            },
            removeMessageAfterClick: true,
          }],
        });
    },
    copyCurrentCharacter() {
      const from = this.characterState.origin;
      this.createCharacter(from.clone());
      this.$notify(this.$lang('Warn/Copy character successfully', [from.name]));
    },
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
    },
  },
};
</script>

<style lang="less" scoped>
.top {
  > .buttons {
    display: inline-block;
    margin: 0 0.7rem;
    margin-top: 0.5rem;
  }
}
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
