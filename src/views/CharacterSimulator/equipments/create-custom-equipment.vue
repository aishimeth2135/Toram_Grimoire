<template>
  <cy-window :visible="visible" @close-window="closeWindow">
    <div class="select-type">
      <cy-button iconify-name="gg-shape-square" type="border"
        @click="toggleWindowVisible('selectType', true)">
        {{ equipmentTypeText }}
      </cy-button>
    </div>
    <cy-window :visible="selectTypeWindowVisible" @close-window="toggleWindowVisible('selectType', false)">
      <template v-slot:title>
        <cy-icon-text iconify-name="gg-shape-square">
          {{ langText('select equipment type') }}
        </cy-icon-text>
      </template>
      <div class="equipment-type">
        <cy-button v-for="category in equipmentTypeCategorys"
          type="drop-down" :iconify-name="category.icon"
          :key="category.id" :menu-default-visible="true">
          {{ langText('equipment type category/' + category.id) }}
          <template v-slot:menu>
            <cy-list-item v-for="item in category.list" :key="item"
              @click="selectEquipmentType(category, type)">
              <cy-icon-text iconify-name="gg-shape-square">
                {{ langText('field type text/' + item.description) }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-button>
      </div>
      <cy-bottom-content>
        <template v-slot:normal-content>
          <cy-flex-layout>
            <template v-slot:right-content>
              <cy-button type="border" iconify-name="ic-round-done"
                @click="confirmSelectedEquipmentType">
                {{ globalLangText('confirm') }}
              </cy-button>
            </template>
          </cy-flex-layout>
        </template>
      </cy-bottom-content>
    </cy-window>
  </cy-window>
</template>
<script>
import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

export default {
  props: ['visible'],
  inject: ['langText', 'globalLangText'],
  data() {
    return {
      equipmentTypeCategorys: [{
        id: 'main-weapon',
        icon: 'mdi-sword',
        class: MainWeapon,
        list: [
          MainWeapon.TYPE_ONE_HAND_SWORD, MainWeapon.TYPE_TWO_HAND_SWORD,
          MainWeapon.TYPE_BOW, MainWeapon.TYPE_BOWGUN,
          MainWeapon.TYPE_STAFF, MainWeapon.TYPE_MAGIC_DEVICE,
          MainWeapon.TYPE_KNUCKLE, MainWeapon.TYPE_HALBERD,
          MainWeapon.TYPE_KATANA
        ]
      }, {
        id: 'sub-weapon',
        icon: 'mdi-shield',
        class: SubWeapon,
        list: [SubWeapon.TYPE_ARROW, SubWeapon.TYPE_DAGGER]
      }, {
        id: 'sub-armor',
        icon: 'mdi-shield',
        class: SubArmor,
        list: [SubArmor.TYPE_SHIELD]
      }, {
        id: 'body-armor',
        icon: 'mdi-tshirt-crew',
        class: BodyArmor,
        list: null
      }, {
        id: 'additional',
        icon: 'cib-redhat',
        class: AdditionalGear,
        list: null
      }, {
        id: 'special',
        icon: 'fa-solid:ring',
        class: SpecialGear,
        list: null
      }, {
        id: 'avatar',
        icon: 'fa-solid:ring',
        class: Avatar,
        list: null
      }],
      selectedEquipmentType: null,
      currentEquipment: null,
      selectTypeWindowVisible: false
    };
  },
  computed: {
    equipmentTypeText() {
      const eq = this.currentEquipment;
      if (eq) {
        const ids = ['body-armor', 'additiona', 'special', 'avatar'];
        const idx = [BodyArmor, AdditionalGear, SpecialGear, Avatar]
          .findIndex(p => eq instanceof p);
        return idx != -1 ?
          this.langText('character field names/' + ids[idx]) :
          this.langText('field type text/' + eq.type.description);
      }
      return this.langText('select equipment type');
    }
  },
  methods: {
    selectEquipmentType(category, type) {
      this.selecetdEquipmentType = {
        category,
        type
      };
    },
    confirmSelectedEquipmentType() {
      const p = this.selecetdEquipmentType;
      const eq = new p.category.class(-1, this.langText('custom equipment'));
      eq.setCustom(true);

      const from = this.currentEquipment;
      if (from) {
        //
      }
      this.currentEquipment = eq;
    },
    toggleWindowVisible(target, force) {
      target = target + 'WindowVisible';
      force = force !== void 0 ? !this[target] : force;
      this[target] = force;
    },
    closeWindow() {
      this.$emit('close');
    }
  }
};
</script>