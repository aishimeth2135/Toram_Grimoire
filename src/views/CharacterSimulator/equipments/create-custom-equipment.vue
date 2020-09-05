<template>
  <cy-window :visible="visible" @close-window="closeWindow">
    <template #title>
      <cy-icon-text iconify-name="gg-shape-square">
        {{ langText('create custom equipment/window title') }}
      </cy-icon-text>
    </template>
    <div class="select-type">
      <cy-button iconify-name="gg-shape-square" type="border"
        @click="toggleWindowVisible('selectType', true)">
        {{ equipmentTypeText }}
      </cy-button>
    </div>
    <div class="editor" v-if="currentEquipment">
      <custom-equipment-editor :equipment="currentEquipment" />
    </div>
    <cy-default-tips v-else icon-id="potum">
      {{ langText('Warn/create custom equipment: no equipment type selected') }}
    </cy-default-tips>
    <cy-bottom-content v-if="currentEquipment">
      <template #normal-content>
        <cy-flex-layout>
          <template #right-content>
            <cy-button type="border" iconify-name="ic-round-done"
              @click="createCustomEquipment">
              {{ globalLangText('global/create') }}
            </cy-button>
          </template>
        </cy-flex-layout>
      </template>
    </cy-bottom-content>
    <cy-window :visible="selectTypeWindowVisible" @close-window="toggleWindowVisible('selectType', false)">
      <template v-slot:title>
        <cy-icon-text iconify-name="gg-shape-square">
          {{ langText('create custom equipment/select equipment type') }}
        </cy-icon-text>
      </template>
      <div class="equipment-type">
        <cy-button v-for="category in equipmentTypeCategorys"
          type="drop-down" :iconify-name="category.icon"
          :key="category.id" :menu-default-visible="true">
          {{ langText('equipment type category/' + category.id) }}
          <template v-slot:menu>
            <template v-if="category.list != null">
              <cy-list-item v-for="item in category.list" :key="item"
                :selected="selectedEquipmentType && selectedEquipmentType.type == item"
                @click="selectEquipmentType(category, item)">
                <cy-icon-text iconify-name="gg-shape-square">
                  {{ langText('field type text/' + item.description) }}
                </cy-icon-text>
              </cy-list-item>
            </template>
            <cy-list-item v-else
              :selected="selectedEquipmentType && selectedEquipmentType.category == category"
              @click="selectEquipmentType(category, null)">
              <cy-icon-text iconify-name="gg-shape-square">
                {{ langText('equipment type category/' + category.id) }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-button>
      </div>
      <cy-bottom-content v-if="this.selectedEquipmentType">
        <template v-slot:normal-content>
          <cy-flex-layout>
            <template v-slot:right-content>
              <cy-button type="border" iconify-name="ic-round-done"
                @click="confirmSelectedEquipmentType">
                {{ globalLangText('global/confirm') }}
              </cy-button>
            </template>
          </cy-flex-layout>
        </template>
      </cy-bottom-content>
    </cy-window>
  </cy-window>
</template>
<script>
import vue_customEquipmentEditor from "./custom-equipment-editor.vue";

import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/CharacterSystem/CharacterStat/class/CharacterEquipment.js";

export default {
  props: ['visible'],
  inject: ['langText', 'globalLangText', 'toggleMainWindowVisible', 'isElementStat'],
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
        icon: 'eva-star-outline',
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
      return this.getEquipmentTypeText(this.currentEquipment);
    }
  },
  methods: {
    getEquipmentTypeText(eq) {
      if (eq) {
        const ids = ['body-armor', 'additional', 'special', 'avatar'];
        const idx = [BodyArmor, AdditionalGear, SpecialGear, Avatar]
          .findIndex(p => eq instanceof p);
        return idx != -1 ?
          this.langText('character field names/' + ids[idx]) :
          this.langText('field type text/' + eq.type.description);
      }
      return this.langText('create custom equipment/select equipment type');
    },
    createCustomEquipment() {
      this.$emit('append-equipments', [this.currentEquipment]);
      this.currentEquipment = null;
      this.selectedEquipmentType = null;
      this.toggleMainWindowVisible('createCustomEquipment', false);
    },
    selectEquipmentType(category, type) {
      this.selectedEquipmentType = {
        category,
        type
      };
    },
    confirmSelectedEquipmentType() {
      const p = this.selectedEquipmentType;

      const from = this.currentEquipment;
      const name = from ? from.name : '';

      const eq = p.category.list != null ?
        new p.category.class(-1, name, [], p.type) :
        new p.category.class(-1, name, []);
      eq.setCustom(true);

      if (!name) {
        eq.name = this.langText('custom equipment: default name prefix') + this.getEquipmentTypeText(eq);
      }
      if (from) {
        eq.stats = !eq.hasElement ?
          from.stats.filter(p => !this.isElementStat(p.baseName())) :
          from.stats;
      }

      this.currentEquipment = eq;
      this.toggleWindowVisible('selectType', false);
    },
    toggleWindowVisible(target, force) {
      target = target + 'WindowVisible';
      force = force === void 0 ? !this[target] : force;
      this[target] = force;
    },
    closeWindow() {
      this.$emit('close');
    }
  },
  components: {
    'custom-equipment-editor': vue_customEquipmentEditor
  }
};
</script>
<style lang="less" scoped>
.editor {
  border-top: 1px solid var(--primary-light-2);
  margin-top: 0.8rem;
}
</style>