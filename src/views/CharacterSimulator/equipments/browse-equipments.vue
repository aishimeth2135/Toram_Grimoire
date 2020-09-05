<template>
  <cy-window :visible="visible" @close-window="closeWindow" class="width-wide">
    <template v-slot:title>
      <cy-icon-text iconify-name="ic-outline-category">
        {{ langText('browse equipments/action: ' + actionType) }}
      </cy-icon-text>
    </template>
    <template v-slot:default>
      <!-- top -->
      <cy-flex-layout class="top">
        <template v-slot:right-content>
          <cy-button iconify-name="ic-round-add-circle-outline"
            type="border"
            @click="toggleMainWindowVisible('appendEquipments', true)">
            {{ langText('browse equipments/append equipment') }}
          </cy-button>
          <cy-button iconify-name="gridicons-create"
            type="border"
            @click="toggleMainWindowVisible('createCustomEquipment', true)">
            {{ langText('custom equipment') }}
          </cy-button>
        </template>
      </cy-flex-layout>
      <div class="content">
        <div class="items">
          <template v-for="eq in browsedEquipments">
            <equipment-item :key="eq.iid" :equipment="eq.origin"
              @click.native="setCurrentEquipment(eq.origin, eq['@disable'])"
              :selected="eq.origin == currentEquipment"
              :disable="eq['@disable']" />
          </template>
        </div>
        <div class="preview" :class="{ 'unfold': infoUnfold }">
          <div class="info" v-if="currentEquipment" @click.stop>
            <equipment-info :equipment="currentEquipment" />
          </div>
          <cy-button iconify-name="mdi-rhombus-outline" type="border"
            v-if="currentEquipment"
            class="toggle-unfold-btn" @click="toggleInfoUnfold" />
        </div>
      </div>
      <!-- bottom -->
      <cy-bottom-content v-if="actionType == 'select-field-equipment' && currentEquipment &&
        !currentEquipmentDisable">
        <template #normal-content>
          <cy-flex-layout>
            <template #right-content>
              <cy-button iconify-name="ic-round-done" type="border"
                @click="selectEquipment">
              {{ globalLangText('global/confirm') }}
            </cy-button>
            </template>
          </cy-flex-layout>
        </template>
      </cy-bottom-content>
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
  inject: ['langText', 'globalLangText', 'toggleMainWindowVisible', 'getShowEquipmentData'],
  data() {
    return {
      currentEquipment: null,
      currentEquipmentDisable: false,
      infoUnfold: false
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
        .map((p, i) => {
          const t = this.getShowEquipmentData(p);
          t.iid = i;
          t['@disable'] = !this.fieldFilter(p);
          return t;
        });
    }
  },
  methods: {
    toggleInfoUnfold() {
      this.infoUnfold = !this.infoUnfold;
    },
    selectEquipment() {
      this.action.targetField.setEquipment(this.currentEquipment);
      this.closeWindow();
    },
    closeWindow() {
      this.clearCurrentEquipment();
      this.$emit('close');
    },
    clearCurrentEquipment() {
      this.currentEquipment = null;
    },
    setCurrentEquipment(eq, disable=false) {
      this.currentEquipment = eq;
      this.currentEquipmentDisable = disable;
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
  border-bottom: 1px solid var(--primary-light-2);
  padding-bottom: 0.6rem;
}
.content {
  display: flex;
  align-items: flex-start;
  margin-top: 1rem;
  position: relative;

  > .items {
    width: 20rem;
    margin-right: 1rem;
    min-height: 15rem;
  }

  > .preview {
    width: 20rem;

    > .info {
      border: 0.1rem solid var(--primary-light);
      padding: 0.6rem;
    }

    > .toggle-unfold-btn {
      display: none;
    }

    @media screen and (max-width: 40rem) {
      position: absolute;
      top: 0;
      right: -20rem;
      z-index: 1;
      background-color: var(--white);
      transition: 0.4s;

      > .toggle-unfold-btn {
        display: inline-block;
        position: absolute;
        top: -1rem;
        left: -1.5rem;
        background-color: var(--white);
        transition: 0.5s ease;
      }

      &.unfold {
        right: 0rem;
        transition: 0.4s ease;

        > .toggle-unfold-btn {
          left: 18.5rem;
        }
      }
    }
  }
}
</style>