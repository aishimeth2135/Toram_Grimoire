<template>
  <div class="main--character-simulator">
    <div class="main">
      <character-stats v-if="currentContentIndex == 0" :character-state="currentCharacterState" />
      <character v-if="currentContentIndex == 1" :character-state="currentCharacterState" />
      <equipment-fields v-if="currentContentIndex == 2" :character-state="currentCharacterState" />
    </div>
    <cy-bottom-content>
      <cy-button v-for="(content, i) in contents"
        :key="content.id"
        :iconify-name="content.icon"
        :selected="i == currentContentIndex"
        @click="setCurrentContent(i)"
        class="inline mr-normal">
        {{ content.text }}
      </cy-button>
    </cy-bottom-content>
  </div>
</template>
<script>
//import Grimoire from '@Grimoire';
import GetLang from "@global-modules/LanguageSystem.js";
// import ShowMessage from "@global-modules/ShowMessage.js";

import { Character } from "@lib/CharacterSystem/CharacterStat/class/main.js";

import init from "./init.js";

import vue_equipmentFields from "./equipments/main.vue";
import vue_characterStats from "./character-stats.vue";
import vue_character from "./character.vue";

export default {
  data() {
    return {
      characterStates: [],
      currentCharacterStateIndex: -1,
      contents: [{
        id: 'character-stats',
        icon: 'bx-bxs-user-detail',
        text: this.langText('character stats')
      }, {
        id: 'character',
        icon: 'bx-bxs-user',
        text: this.langText('character')
      }, {
        id: 'equipment-fields',
        icon: 'gg-shape-square',
        text: this.langText('equipment')
      }],
      currentContentIndex: 2
    };
  },
  provide() {
    return {
      'langText': this.langText,
      'globalLangText': this.globalLangText
    };
  },
  beforeCreate() {
    init();
  },
  created() {
    this.createCharacter();
  },
  computed: {
    currentCharacterState() {
      return this.characterStates[this.currentCharacterStateIndex];
    }
  },
  methods: {
    setCurrentContent(idx) {
      this.currentContentIndex = idx;
    },
    createCharacter() {
      const c = new Character(this.langText('character') + ' ' + (this.characterStates.length + 1).toString()).init();

      this.currentCharacterStateIndex = this.characterStates.length;
      this.characterStates.push({
        origin: c
      });
    },
    langText(s, vs) {
      return GetLang('Character Simulator/' + s, vs);
    },
    globalLangText(s, vs) {
      return GetLang(s, vs);
    }
  },
  components: {
    'equipment-fields': vue_equipmentFields,
    'character-stats': vue_characterStats,
    'character': vue_character
  }
};
</script>
<style lang="less" scoped>

</style>