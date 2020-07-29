<template>
  <cy-window :visible="visible" @close-window="$emit('close')" class="width-wide">
    <template v-slot:title>
      <cy-icon-text iconify-name="ic-outline-category">
        {{ langText('browse equipments/action: ' + actionType) }}
      </cy-icon-text>
    </template>
    <template v-slot:default>
      <div class="top">
        <div class="buttons">
          <cy-button iconify-name="ic-round-add-circle-outline"
            type="border"
            @click="toggleWindowVisible('appendEquipments', true)">
            {{ langText('browse equipments/append equipment') }}
          </cy-button>
        </div>
      </div>
      <div class="content">
        <div class="items">
          <equipment-item v-for="eq in browsedEquipments"
            :key="eq.iid" :equipment="eq.origin"
            @click.native="setCurrentEquipment(eq.origin)"
            :class="{ 'selected': eq.origin == currentEquipment }" />
        </div>
        <div class="preview">
          <div class="info" v-if="currentEquipment">
            <equipment-info :equipment="currentEquipment" />
          </div>
        </div>
      </div>
      <div class="bottom" v-if="actionType == 'select-field-equipment' && currentEquipment">
        
      </div>
    </template>
  </cy-window>
</template>
<script>
import vue_equipmentItem from "./equipment-item.vue";
import vue_equipmentInfo from "./equipment-info.vue";

import { EquipmentField } from "@lib/CharacterSystem/CharacterStat/class/main.js";
import { MainWeapon, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

export default {
  props: ['visible', 'equipments', 'action', 'characterState'],
  inject: ['langText', 'toggleWindowVisible', 'getShowEquipmentData'],
  data() {
    return {
      currentEquipment: null
    };
  },
  computed: {
    actionType() {
      if (!this.action)
        return 'normal';
      return this.action.type;
    },
    browsedEquipments() {
      return this.equipments
        .filter(p => this.fieldFilter(p))
        .map((p, i) => {
          const t = this.getShowEquipmentData(p);
          t.iid = i;
          return t;
        });
    }
  },
  methods: {
    setCurrentEquipment(eq) {
      this.currentEquipment = eq;
    },
    fieldFilter(eq) {
      switch (this.action.targetField.type) {
        case EquipmentField.TYPE_MAIN_WEAPON:
          return eq instanceof MainWeapon;
        case EquipmentField.TYPE_SUB_WEAPON:
          {
            const t = this.characterState.origin.fieldEquipment(EquipmentField.TYPE_MAIN_WEAPON);
            return t ? t.testSubWeapon(eq) : true;
          }
        case EquipmentField.TYPE_BODY_ARMOR:
          return eq instanceof BodyArmor;
        case EquipmentField.TYPE_ADDITIONAL:
          return eq instanceof AdditionalGear;
        case EquipmentField.TYPE_SPECIAL:
          return eq instanceof SpecialGear;
        case EquipmentField.TYPE_AVATAR:
          return eq instanceof Avatar;
      }
    }
  },
  components: {
    'equipment-item': vue_equipmentItem,
    'equipment-info': vue_equipmentInfo
  }
}
</script>
<style lang="less" scoped>
.top {
  > .buttons {
    text-align: right;
  }
}

.content {
  display: flex;
  align-items: flex-start;
  margin-top: 0.8rem;

  > .items {
    width: 20rem;
    margin-right: 1rem;
  }

  > .preview {
    width: 20rem;
    > .info {
      border: 0.1rem solid var(--primary-light);
      padding: 0.6rem;
    }
  }
}
</style>