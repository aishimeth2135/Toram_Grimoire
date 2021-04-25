<template>
  <cy-window :visible="visible" @close-window="close">
    <template #title>
      <cy-icon-text icon="gg-shape-square">
        {{ $lang('create custom equipment/window title') }}
      </cy-icon-text>
    </template>
    <div class="select-type">
      <cy-button icon="gg-shape-square" type="border"
        @click="toggle('window/selectType', true)">
        {{ equipmentTypeText }}
      </cy-button>
    </div>
    <div class="editor" v-if="currentEquipment">
      <custom-equipment-editor :equipment="currentEquipment" />
    </div>
    <cy-default-tips v-else icon="potum" icon-src="custom">
      {{ $lang('Warn/create custom equipment: no equipment type selected') }}
    </cy-default-tips>
    <cy-bottom-content v-if="currentEquipment">
      <template #normal-content>
        <div class="flex items-center">
          <cy-button type="border" class="ml-auto"
            icon="ic-round-done"
            @click="createCustomEquipment">
            {{ $globalLang('global/create') }}
          </cy-button>
        </div>
      </template>
    </cy-bottom-content>
    <cy-window :visible="window.selectType"
      @close-window="toggle('window/selectType', false)">
      <template v-slot:title>
        <cy-icon-text icon="gg-shape-square">
          {{ $lang('create custom equipment/select equipment type') }}
        </cy-icon-text>
      </template>
      <div class="equipment-type">
        <cy-button v-for="category in equipmentTypeCategorys"
          type="drop-down" :icon="category.icon"
          :key="category.id" :menu-default-visible="true">
          {{ $globalLang('common/Equipment/field/' + category.id) }}
          <template v-slot:menu>
            <template v-if="category.list != null">
              <cy-list-item v-for="item in category.list" :key="item"
                :selected="currentEquipment && currentEquipment.type === item"
                @click="selectEquipmentType(category, item)">
                <cy-icon-text icon="gg-shape-square">
                  {{ $globalLang('common/Equipment/category/' + item.description) }}
                </cy-icon-text>
              </cy-list-item>
            </template>
            <cy-list-item v-else
              :selected="currentEquipment && currentEquipment instanceof category.instance"
              @click="selectEquipmentType(category, null)">
              <cy-icon-text icon="gg-shape-square">
                {{ $globalLang('common/Equipment/field/' + category.id) }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-button>
      </div>
    </cy-window>
  </cy-window>
</template>
<script>
import ToggleService from "@setup/ToggleService";

import vue_customEquipmentEditor from "./custom-equipment-editor.vue";

import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/Character/CharacterEquipment";

export default {
  RegisterLang: 'Character Simulator',
  emits: ['append-equipments', 'close'],
  props: ['visible'],
  inject: ['isElementStat'],
  setup() {
    const { window, toggle } = ToggleService({
      window: ['selectType']
    });

    return {
      window,
      toggle
    };
  },
  data() {
    return {
      equipmentTypeCategorys: [{
        id: 'main-weapon',
        icon: 'mdi-sword',
        instance: MainWeapon,
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
        instance: SubWeapon,
        list: [SubWeapon.TYPE_ARROW, SubWeapon.TYPE_DAGGER, SubWeapon.TYPE_NINJUTSU_SCROLL]
      }, {
        id: 'sub-armor',
        icon: 'mdi-shield',
        instance: SubArmor,
        list: [SubArmor.TYPE_SHIELD]
      }, {
        id: 'body-armor',
        icon: 'mdi-tshirt-crew',
        instance: BodyArmor,
        list: null
      }, {
        id: 'additional',
        icon: 'cib-redhat',
        instance: AdditionalGear,
        list: null
      }, {
        id: 'special',
        icon: 'fa-solid:ring',
        instance: SpecialGear,
        list: null
      }, {
        id: 'avatar',
        icon: 'eva-star-outline',
        instance: Avatar,
        list: null
      }],
      currentEquipment: null
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
          this.$globalLang('common/Equipment/field/' + ids[idx]) :
          this.$globalLang('common/Equipment/category/' + eq.type.description);
      }
      return this.$lang('create custom equipment/select equipment type');
    },
    createCustomEquipment() {
      this.$emit('append-equipments', [this.currentEquipment]);
      this.currentEquipment = null;
      this.close();
    },
    selectEquipmentType(category, type) {
      const from = this.currentEquipment;
      const name = from ? from.name : '';

      const eq = category.list !== null ?
        new category.instance(null, name, [], type) :
        new category.instance(null, name, []);
      eq.setCustom(true);

      if (!name) {
        eq.name = this.$lang('custom equipment: default name prefix') + this.getEquipmentTypeText(eq);
      }
      if (from) {
        eq.stats = !eq.hasElement ?
          from.stats.filter(p => !this.isElementStat(p.baseName)) :
          from.stats;
      }

      this.currentEquipment = eq;
      this.toggle('window/selectType', false);
    },
    close() {
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
  padding-top: 0.8rem;
}
</style>