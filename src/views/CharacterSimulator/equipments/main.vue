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
      <browse-equipments :visible="window.browseEquipments"
        :action="browseEquipmentsState.action"
        :character-state="characterState"
        @close="toggle('window/browseEquipments', false)" />
      <append-equipments :visible="window.appendEquipments"
        @close="toggle('window/appendEquipments', false)" />
      <create-custom-equipment :visible="window.createCustomEquipment"
        @close="toggle('window/createCustomEquipment', false)"
        @append-equipments="appendEquipments" />
      <cy-window v-model:visible="window.customEquipmentEditor">
        <template #title>
          <cy-icon-text icon="ic-round-edit">
            {{ $lang('custom equipment editor/window title') }}
          </cy-icon-text>
        </template>
        <custom-equipment-editor v-if="currentCustomEquipment"
          :equipment="currentCustomEquipment" />
        <cy-bottom-content>
          <template #normal-content>
            <cy-flex-layout>
              <template #right-content>
                <cy-button type="border" icon="ic-round-done"
                  @click="toggle('window/customEquipmentEditor', false)">
                  {{ $globalLang('global/close') }}
                </cy-button>
              </template>
            </cy-flex-layout>
          </template>
        </cy-bottom-content>
      </cy-window>
      <select-crystals v-if="currentSelectCrystalsEquipment"
        :visible="window.selectCrystals"
        :equipment="currentSelectCrystalsEquipment"
        @close="toggle('window/selectCrystals', false)" />
    </div>
  </section>
</template>
<script>
import { mapState } from "vuex";

import vue_equipmentField from "./equipment-field.vue";
import vue_appendEquipments from "./append-equipments.vue";
import vue_browseEquipments from "./browse-equipments.vue";
import vue_createCustomEquipment from "./create-custom-equipment.vue";
import vue_customEquipmentEditor from "./custom-equipment-editor.vue";
import vue_selectCrystals from "./select-crystals.vue";

import ToggleService from "@/setup/ToggleService";

import { EquipmentField } from "@/lib/Character/Character";
import { CharacterEquipment } from "@/lib/Character/CharacterEquipment";

export default {
  RegisterLang: 'Character Simulator',
  props: ['characterState'],
  provide() {
    return {
      'convertEquipmentData': this.convertEquipmentData,
      'toggleMainWindowVisible': id => this.toggle('window/' + id),
      'openCustomEquipmentEditor': this.openCustomEquipmentEditor,
      'openSelectCrystals': this.openSelectCrystals,
      'appendEquipments': this.appendEquipments,
      'isElementStat': this.isElementStat,
      'setEquipmentProperty': this.setEquipmentProperty
    };
  },
  setup() {
    const { window, toggle } = ToggleService({
      window: [
        'browseEquipments',
        'appendEquipments',
        'createCustomEquipment',
        'customEquipmentEditor',
        'selectCrystals'
      ]
    });

    return {
      window,
      toggle
    };
  },
  data() {
    return {
      browseEquipmentsState: {
        action: null
      },
      currentCustomEquipment: null,
      currentSelectCrystalsEquipment: null,
      elementStatIds: CharacterEquipment.elementStatIds
    };
  },
  computed: {
    ...mapState('character', {
      'equipments': 'equipments'
    })
  },
  methods: {
    isElementStat(baseName) {
      return this.elementStatIds.includes(baseName);
    },
    openSelectCrystals(eq) {
      this.currentSelectCrystalsEquipment = eq;
      this.toggle('window/selectCrystals', true);
    },
    openCustomEquipmentEditor(eq) {
      this.currentCustomEquipment = eq;
      this.toggle('window/customEquipmentEditor', true);
    },
    appendEquipments(eqs) {
      this.$store.commit('character/appendEquipments', eqs);
    },
    selectFieldEquipment(field) {
      this.browseEquipmentsState.action = {
        type: 'select-field-equipment',
        targetField: field
      };
      this.toggle('window/browseEquipments', true);
    },
    removeFieldEquipment(field) {
      field.removeEquipment();
      if (field.type == EquipmentField.TYPE_MAIN_WEAPON) {
        this.characterState.origin
          .equipmentField(EquipmentField.TYPE_SUB_WEAPON)
          .removeEquipment();
      }
    },
    convertEquipmentData(item) {
      return CharacterEquipment.fromOriginEquipment(item);
    },
    setEquipmentProperty(eq, propName, v) {
      eq[propName] = v;
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