<template>
  <section>
    <div class="equipment-fields-container">
      <div class="equipment-fields">
        <equipment-field v-for="field in characterState.origin.equipmentFields"
          :key="field.id" :field="field"
          @select-field-equipment="selectFieldEquipment"
          @remove-field-equipment="removeFieldEquipment" />
      </div>
    </div>
    <div class="window-container">
      <browse-equipments :visible="windowVisible.browseEquipments"
        :action="browseEquipmentsState.action"
        :character-state="characterState"
        @close="toggleWindowVisible('browseEquipments', false)" />
      <append-equipments :visible="windowVisible.appendEquipments"
        @close="toggleWindowVisible('appendEquipments', false)" />
      <create-custom-equipment :visible="windowVisible.createCustomEquipment"
        @close="toggleWindowVisible('createCustomEquipment', false)"
        @append-equipments="appendEquipments" />
      <cy-window :visible="windowVisible.customEquipmentEditor"
        @close-window="toggleWindowVisible('customEquipmentEditor', false)">
        <template #title>
          <cy-icon-text iconify-name="ic-round-edit">
            {{ langText('custom equipment editor/window title') }}
          </cy-icon-text>
        </template>
        <custom-equipment-editor v-if="currentCustomEquipment"
          :equipment="currentCustomEquipment" />
        <cy-bottom-content>
          <template #normal-content>
            <cy-flex-layout>
              <template #right-content>
                <cy-button type="border" iconify-name="ic-round-done"
                  @click="toggleWindowVisible('customEquipmentEditor', false)">
                  {{ globalLangText('global/close') }}
                </cy-button>
              </template>
            </cy-flex-layout>
          </template>
        </cy-bottom-content>
      </cy-window>
      <select-crystals v-if="currentSelectCrystalsEquipment"
        :visible="windowVisible.selectCrystals"
        :equipment="currentSelectCrystalsEquipment"
        @close="toggleWindowVisible('selectCrystals', false)" />
    </div>
  </section>
</template>
<script>
import vue_equipmentField from "./equipment-field.vue";
import vue_appendEquipments from "./append-equipments.vue";
import vue_browseEquipments from "./browse-equipments.vue";
import vue_createCustomEquipment from "./create-custom-equipment.vue";
import vue_customEquipmentEditor from "./custom-equipment-editor.vue";
import vue_selectCrystals from "./select-crystals.vue";

import { EquipmentField } from "@lib/CharacterSystem/CharacterStat/class/main.js";
import { CharacterEquipment, MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

import Vuex from "vuex";
import store from "@store/main";

export default {
  store,
  props: ['characterState'],
  inject: ['langText', 'globalLangText'],
  provide() {
    return {
      'convertEquipmentData': this.convertEquipmentData,
      'getShowEquipmentData': this.getShowEquipmentData,
      'toggleMainWindowVisible': this.toggleWindowVisible,
      'openCustomEquipmentEditor': this.openCustomEquipmentEditor,
      'openSelectCrystals': this.openSelectCrystals,
      'appendEquipments': this.appendEquipments,
      'isElementStat': this.isElementStat
    };
  },
  data() {
    return {
      windowVisible: {
        browseEquipments: false,
        appendEquipments: false,
        createCustomEquipment: false,
        customEquipmentEditor: false,
        selectCrystals: false
      },
      browseEquipmentsState: {
        action: null
      },
      currentCustomEquipment: null,
      currentSelectCrystalsEquipment: null,
      elementStatIds: CharacterEquipment.elementStatIds
    };
  },
  computed: {
    ...Vuex.mapState('character', {
      'equipments': 'equipments'
    })
  },
  methods: {
    isElementStat(baseName) {
      return this.elementStatIds.includes(baseName);
    },
    openSelectCrystals(eq) {
      this.currentSelectCrystalsEquipment = eq;
      this.toggleWindowVisible('selectCrystals', true);
    },
    openCustomEquipmentEditor(eq) {
      this.currentCustomEquipment = eq;
      this.toggleWindowVisible('customEquipmentEditor', true);
    },
    appendEquipments(eqs) {
      this.$store.commit('character/appendEquipments', eqs);
    },
    selectFieldEquipment(field) {
      this.browseEquipmentsState.action = {
        type: 'select-field-equipment',
        targetField: field
      };
      this.toggleWindowVisible('browseEquipments', true);
    },
    removeFieldEquipment(field) {
      field.removeEquipment();
      if (field.type == EquipmentField.TYPE_MAIN_WEAPON) {
        this.characterState.origin
          .equipmentField(EquipmentField.TYPE_SUB_WEAPON)
          .removeEquipment();
      }
    },
    getShowEquipmentData(o) {
      let category, icon;
      if (o instanceof BodyArmor) {
        category = this.langText('character field names/' + EquipmentField.TYPE_BODY_ARMOR.description) +
          '｜' + this.langText('field type text/' + o.type.description);
        icon = 'mdi-tshirt-crew';
      } else if (o instanceof AdditionalGear) {
        category = this.langText('character field names/' + EquipmentField.TYPE_ADDITIONAL.description);
        icon = 'cib-redhat';
      } else if (o instanceof SpecialGear) {
        category = this.langText('character field names/' + EquipmentField.TYPE_SPECIAL.description);
        icon = 'fa-solid:ring';
      } else if (o instanceof Avatar) {
        category = this.langText('character field names/' + EquipmentField.TYPE_AVATAR.description);
        icon = 'eva-star-outline';
      } else {
        category = this.langText('field type text/' + o.type.description);
        icon = o instanceof MainWeapon ? 'mdi-sword' : 'mdi-shield';
      }

      return {
        origin: o,
        categoryIcon: icon,
        categoryText: category
      };
    },
    convertEquipmentData(item) {
      // 'Equipmemt Category list': [
      //     '單手劍', '雙手劍', '弓', '弩',
      //     '法杖', '魔導具', '拳套', '旋風槍',
      //     '拔刀劍', '箭矢', '盾牌', '小刀',
      //     '身體裝備', '追加裝備', '特殊裝備'
      // ]
      const pre_args = [item.id, item.name, item.stats.map(p => p.copy())];
      const stability = parseInt(item.baseStability, 10);
      if (item.category < 9) {
        const t = [
          MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
          MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
          MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
          MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
          MainWeapon.TYPE_KATANA
        ][item.category];

        return new MainWeapon(...pre_args, t, item.baseValue, stability);
      }
      if (item.category < 12) {
        const t = [
          SubWeapon.TYPE_ARROW, SubArmor.TYPE_SHIELD, SubWeapon.TYPE_DAGGER
        ][item.category - 9];
        if (item.category == 10)
          return new SubArmor(...pre_args, t, item.baseValue);
        return new SubWeapon(...pre_args, t, item.baseValue, stability);
      }
      if (item.category == 12)
        return new BodyArmor(...pre_args, item.baseValue);
      if (item.category == 13)
        return new AdditionalGear(...pre_args, item.baseValue);
      if (item.category == 14)
        return new SpecialGear(...pre_args, item.baseValue);
    },
    toggleWindowVisible(target, force) {
      force = force === void 0 ? !this.windowVisible[target] : force;
      this.windowVisible[target] = force;
    }
  },
  components: {
    'equipment-field': vue_equipmentField,
    'append-equipments': vue_appendEquipments,
    'browse-equipments': vue_browseEquipments,
    'create-custom-equipment': vue_createCustomEquipment,
    'custom-equipment-editor': vue_customEquipmentEditor,
    'select-crystals': vue_selectCrystals
  }
}
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';

.browse-equipments {
  >.top {
    display: flex;
    align-items: center;

    >.buttons {
      display: inline-flex;
      align-items: center;
      margin-left: auto;
    }
  }
}
.equipment-fields-container {
  display: flex;
  align-items: flex-start;
  justify-content: center;

  > .equipment-fields {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>