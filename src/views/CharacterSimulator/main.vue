<template>
  <div class="main--character-simulator">
    <equipments v-if="currentContent == 0" :character-state="currentCharacterState" />
  </div>
</template>
<script>
//import Grimoire from '@Grimoire';
import GetLang from "@global-modules/LanguageSystem.js";
// import ShowMessage from "@global-modules/ShowMessage.js";

import { Character } from "@lib/CharacterSystem/CharacterStat/class/main.js";
//import { /*Weapon, Armor,*/ MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

import init from "./init.js";

import vue_equipments from "./equipments/main.vue";


function Lang(s, vs) {
  return GetLang('Character Simulator/' + s, vs);
}

export default {
  data() {
    return {
      characterStates: [],
      currentCharacterStateIndex: 0,
      currentContent: 0
    };
  },
  provide() {
    return {
      langText: this.langText
    }
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
    createCharacter() {
      const c = new Character(this.langText('character') + ' ' + (this.characterStates.length + 1).toString()).init();

      this.currentCharacterStateIndex = this.characterStates.length;
      this.characterStates.push({
        origin: c
      });
    },
    langText(s, vs) {
      return Lang(s, vs);
    },
    getLangText(s, vs) {
      return GetLang(s, vs);
    }
  },
  components: {
    'equipments': vue_equipments
  }
};
</script>
<style lang="less" scoped>

</style>