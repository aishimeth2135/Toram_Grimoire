<template>
  <cy-window :visible="visible" @close="close">
    <template #title>
      <cy-icon-text icon="gg-shape-square">
        {{ $lang('create custom equipment/window title') }}
      </cy-icon-text>
    </template>
    <div class="select-type">
      <cy-button-border
        icon="gg-shape-square"
        @click="toggle('window/selectType', true)"
      >
        {{ equipmentTypeText }}
      </cy-button-border>
    </div>
    <div v-if="currentEquipment" class="editor">
      <custom-equipment-editor :equipment="currentEquipment" />
    </div>
    <cy-default-tips v-else icon="potum" icon-src="custom">
      {{ $lang('Warn/create custom equipment: no equipment type selected') }}
    </cy-default-tips>
    <cy-bottom-content v-if="currentEquipment">
      <template #normal-content>
        <div class="flex items-center">
          <cy-button-border
            class="ml-auto"
            icon="ic-round-done"
            @click="createCustomEquipment"
          >
            {{ $rootLang('global/create') }}
          </cy-button-border>
        </div>
      </template>
    </cy-bottom-content>
    <cy-window v-model:visible="window.selectType">
      <template #title>
        <cy-icon-text icon="gg-shape-square">
          {{ $lang('create custom equipment/select equipment type') }}
        </cy-icon-text>
      </template>
      <div class="equipment-type">
        <cy-button-drop-down
          v-for="category in equipmentTypeCategorys"
          :key="category.id"
          :icon="category.icon"
          :menu-default-visible="true"
        >
          {{ $rootLang('common/Equipment/field/' + category.id) }}
          <template #menu>
            <template v-if="category.list != null">
              <cy-list-item
                v-for="item in category.list"
                :key="item"
                :selected="currentEquipment && currentEquipment.type === item"
                @click="selectEquipmentType(category, item)"
              >
                <cy-icon-text icon="gg-shape-square">
                  {{ $rootLang('common/Equipment/category/' + item.description) }}
                </cy-icon-text>
              </cy-list-item>
            </template>
            <cy-list-item
              v-else
              :selected="currentEquipment && (currentEquipment instanceof category.instance)"
              @click="selectEquipmentType(category, null)"
            >
              <cy-icon-text icon="gg-shape-square">
                {{ $rootLang('common/Equipment/field/' + category.id) }}
              </cy-icon-text>
            </cy-list-item>
          </template>
        </cy-button-drop-down>
      </div>
    </cy-window>
  </cy-window>
</template>
<script>
import ToggleService from "@/setup/ToggleService";

import vue_customEquipmentEditor from "./custom-equipment-editor.vue";

import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@/lib/Character/CharacterEquipment";

export default {
  RegisterLang: 'Character Simulator',
  components: {
    'custom-equipment-editor': vue_customEquipmentEditor,
  },
  inject: ['isElementStat'],
  props: ['visible'],
  emits: ['append-equipments', 'close'],
  setup() {
    const { window, toggle } = ToggleService({
      window: ['selectType'],
    });

    return {
      window,
      toggle,
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
          MainWeapon.TYPE_KATANA,
        ],
      }, {
        id: 'sub-weapon',
        icon: 'mdi-shield',
        instance: SubWeapon,
        list: [SubWeapon.TYPE_ARROW, SubWeapon.TYPE_DAGGER, SubWeapon.TYPE_NINJUTSU_SCROLL],
      }, {
        id: 'sub-armor',
        icon: 'mdi-shield',
        instance: SubArmor,
        list: [SubArmor.TYPE_SHIELD],
      }, {
        id: 'body-armor',
        icon: 'mdi-tshirt-crew',
        instance: BodyArmor,
        list: null,
      }, {
        id: 'additional',
        icon: 'cib-redhat',
        instance: AdditionalGear,
        list: null,
      }, {
        id: 'special',
        icon: 'fa-solid:ring',
        instance: SpecialGear,
        list: null,
      }, {
        id: 'avatar',
        icon: 'eva-star-outline',
        instance: Avatar,
        list: null,
      }],
      currentEquipment: null,
    };
  },
  computed: {
    equipmentTypeText() {
      return this.getEquipmentTypeText(this.currentEquipment);
    },
  },
  methods: {
    getEquipmentTypeText(eq) {
      if (eq) {
        const ids = ['body-armor', 'additional', 'special', 'avatar'];
        const idx = [BodyArmor, AdditionalGear, SpecialGear, Avatar]
          .findIndex(p => eq instanceof p);
        return idx != -1 ?
          this.$rootLang('common/Equipment/field/' + ids[idx]) :
          this.$rootLang('common/Equipment/category/' + eq.type.description);
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
    },
  },
};
</script>
<style lang="less" scoped>
.editor {
  border-top: 1px solid var(--primary-light-2);
  margin-top: 0.8rem;
  padding-top: 0.8rem;
}
</style>
