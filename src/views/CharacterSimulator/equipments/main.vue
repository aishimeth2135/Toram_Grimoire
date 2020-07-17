<template>
  <section>
    <equipment-field v-for="field in characterState.origin.equipmentFields"
      :key="field.id" :field="field"
      @select-field-equipment="selectFieldEquipment" />
    <div class="window-container">
      <browse-equipments :visible="windowVisible.browseEquipments"
        :action="browseEquipmentsState.action"
        :equipments="equipments" :character-state="characterState"
        @close="toggleWindowVisible('browseEquipments', false)" />
      <append-equipments :visible="windowVisible.appendEquipments"
        @close="toggleWindowVisible('appendEquipments', false)"
        @append-equipments="appendEquipments" />
    </div>
  </section>
</template>
<script>
import GetLang from "@global-modules/LanguageSystem.js";

import vue_equipmentField from "./equipment-field.vue";
import vue_appendEquipments from "./append-equipments.vue";
import vue_browseEquipments from "./browse-equipments.vue";

import { EquipmentField } from "@lib/CharacterSystem/CharacterStat/class/main.js";
import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";


export default {
  props: ['characterState'],
  provide() {
    return {
      'langText': this.langText,
      'globalLangText': this.globalLangText,
      'convertEquipmentData': this.convertEquipmentData,
      'getShowEquipmentData': this.getShowEquipmentData,
      'toggleWindowVisible': this.toggleWindowVisible
    };
  },
  data() {
    return {
      equipments: [],
      windowVisible: {
        browseEquipments: false,
        appendEquipments: false
      },
      browseEquipmentsState: {
        action: null
      }
    };
  },
  methods: {
    appendEquipments(eqs) {
      this.equipments.push(...eqs);
    },
    selectFieldEquipment(field) {
      this.browseEquipmentsState.action = {
        type: 'select-field-equipment',
        targetField: field
      };
      this.toggleWindowVisible('browseEquipments', true);
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
      if (item.category < 9) {
        const t = [
          MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
          MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
          MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
          MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
          MainWeapon.TYPE_KATANA
        ][item.category];

        return new MainWeapon(item.id, t, item.name, item.stats, item.baseValue, item.baseStability);
      }
      if (item.category < 12) {
        const t = [
          SubWeapon.TYPE_ARROW, SubArmor.TYPE_SHIELD, SubWeapon.TYPE_DAGGER
        ][item.category - 9];
        if (item.category == 10)
          return new SubArmor(item.id, t, item.name, item.stats, item.baseValue);
        return new SubWeapon(item.id, t, item.name, item.stats, item.baseValue, item.baseStability);
      }
      if (item.category == 12)
        return new BodyArmor(item.id, item.name, item.stats, item.baseValue);
      if (item.category == 13)
        return new AdditionalGear(item.id, item.name, item.stats, item.baseValue);
      if (item.category == 14)
        return new SpecialGear(item.id, item.name, item.stats, item.baseValue);
    },
    toggleWindowVisible(target, force) {
      force = force === void 0 ? !this.windowVisible[target] : force;
      this.windowVisible[target] = force;
    },
    langText(s, vs) {
      return GetLang('Character Simulator/' + s, vs);
    },
    globalLangText(s, vs) {
      return GetLang(s, vs);
    }
  },
  components: {
    'equipment-field': vue_equipmentField,
    'append-equipments': vue_appendEquipments,
    'browse-equipments': vue_browseEquipments
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
</style>