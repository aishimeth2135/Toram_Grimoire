<template>
  <cy-window :visible="visible"
    @close-window="closeWindow"
    width="wide">
    <template v-slot:title>
      <cy-icon-text iconify-name="ic-outline-category">
        {{ $lang('action: ' + actionType) }}
      </cy-icon-text>
    </template>
    <template v-slot:default>
      <!-- top -->
      <div class="flex items-center border-b border-solid border-light-2 pb-2">
        <div class="ml-auto">
          <cy-button iconify-name="ic-round-add-circle-outline"
            type="border"
            @click="toggleMainWindowVisible('appendEquipments', true)">
            {{ $lang('append equipments') }}
          </cy-button>
          <cy-button iconify-name="gridicons-create"
            type="border"
            @click="toggleMainWindowVisible('createCustomEquipment', true)">
            {{ $lang.extra('parent', 'custom equipment') }}
          </cy-button>
        </div>
      </div>
      <div class="content">
        <div class="items">
          <equipment-item v-for="eq in browsedEquipments"
            :key="eq.iid" :equipment="eq.origin"
            @click="setCurrentEquipment(eq.origin, eq['@disable'])"
            :selected="eq.origin === currentEquipment"
            :is-current="actionType == 'select-field-equipment' && action.targetField.equipment == eq.origin"
            :disable="eq['@disable']" />
        </div>
        <div class="preview" :class="{ 'unfold': infoUnfold }">
          <div class="info" v-if="currentEquipment" @click.stop>
            <equipment-info :equipment="currentEquipment" />
          </div>
          <div class="compare" v-if="actionType == 'select-field-equipment' && currentEquipment
            && currentEquipment != action.targetField.equipment && !currentEquipmentDisable">
            <character-stats-compare :before="compareData.before" :after="compareData.after" />
          </div>
        </div>
        <cy-button iconify-name="mdi-rhombus-outline" type="border"
          v-if="currentEquipment"
          class="toggle-info-unfold-btn" @click="toggleInfoUnfold" />
      </div>
      <!-- bottom -->
      <cy-bottom-content v-if="currentEquipment" class="z-1">
        <template #normal-content>
          <div class="flex items-center flex-wrap">
            <cy-button iconify-name="ic-baseline-delete-outline" type="border"
              @click="removeSelectedEquipment">
              {{ $globalLang('global/remove') }}
            </cy-button>
            <cy-button iconify-name="mdi-content-copy" type="border"
              @click="copySelectedEquipment">
              {{ $globalLang('global/copy') }}
            </cy-button>
            <div v-if="actionType === 'select-field-equipment'"
              class="ml-auto">
              <cy-button v-if="!currentEquipmentDisable"
                iconify-name="ic-round-done" type="border"
                @click="selectEquipment">
                {{ $globalLang('global/confirm') }}
              </cy-button>
              <cy-button v-else iconify-name="ic-round-done" type="border" :disabled="true">
                {{ $globalLang('global/confirm') }}
              </cy-button>
            </div>
          </div>
        </template>
      </cy-bottom-content>
    </template>
  </cy-window>
</template>
<script>
import vue_equipmentItem from "./equipment-item.vue";
import vue_equipmentInfo from "./equipment-info.vue";
import vue_characterStatsCompare from "../main/character-stats-compare.vue";

import { EquipmentField } from "@lib/Character/Character";
import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from "@lib/Character/CharacterEquipment";

import MessageNotify from "@Services/Notify";

import Vuex from "vuex";

export default {
  RegisterLang: {
    root: 'Character Simulator/browse equipments',
    extra: {
      parent: 'Character Simulator'
    }
  },
  emits: ['close'],
  props: ['visible', 'action', 'characterState'],
  inject: [
    'toggleMainWindowVisible', 'getShowEquipmentData',
    'handleCharacterStateDatas', 'appendEquipments'
  ],
  data() {
    return {
      currentEquipment: null,
      currentEquipmentDisable: false,
      infoUnfold: false
    };
  },
  computed: {
    ...Vuex.mapState('character', {
      'equipments': 'equipments'
    }),
    currentCharacterStateDatas() {
      return this.handleCharacterStateDatas({
        handlePassiveSkill: true,
        handleActiveSkill: true
      });
    },
    compareData() {
      if (!this.currentEquipment)
        return null;
      return {
        before: this.currentCharacterStateDatas,
        after: this.handleCharacterStateDatas({
          handlePassiveSkill: true,
          handleActiveSkill: true,
          calcField: {
            type: this.action.targetField.type,
            equipment: this.currentEquipment
          }
        })
      };
    },
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
        })
        .sort((a, b) => a.origin.name.localeCompare(b.origin.name));
    }
  },
  methods: {
    toggleInfoUnfold() {
      this.infoUnfold = !this.infoUnfold;
    },
    copySelectedEquipment() {
      const eq = this.currentEquipment.copy();
      eq.name = eq.name + '*';
      this.appendEquipments([eq]);
      MessageNotify(this.$lang('message: copy equipment'), 'mdi-content-copy',
        'browse equipment/copy equipment');
    },
    removeSelectedEquipment() {
      const eq = this.currentEquipment;
      const index = this.equipments.indexOf(eq);
      index != -1 && this.$store.commit('character/removeEquipment', {
        index
      });

      const modifiedFields = this.characterState.origin.equipmentFields.filter(field => {
        if (field.equipment === eq) {
          field.removeEquipment();
          return true;
        }
        return false;
      });
      MessageNotify(this.$lang('message: remove equipment', [eq.name]),
        'ic-baseline-delete-outline', null, {
        buttons: [{
          text: this.$globalLang('global/recovery'),
          click: () => {
            this.appendEquipments([eq]);
            modifiedFields.forEach(field => field.setEquipment(eq));
            MessageNotify(this.$lang('message: removed equipment recovery', [eq.name]));
          },
          removeMessageAfterClick: true
        }]
      });

      this.currentEquipment = null;
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
      if (this.currentEquipment === eq && !disable) {
        this.selectEquipment();
        return;
      }
      this.currentEquipment = eq;
      this.currentEquipmentDisable = disable;
    },
    fieldFilter(eq) {
      switch (this.action.targetField.type) {
        case EquipmentField.TYPE_MAIN_WEAPON:
          return eq instanceof MainWeapon;
        case EquipmentField.TYPE_SUB_WEAPON:
          if (eq instanceof MainWeapon || eq instanceof SubWeapon || eq instanceof SubArmor) {
            const t = this.characterState.origin.testSubWeapon(eq.type);
            return t;
          }
          return false;
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
    'equipment-info': vue_equipmentInfo,
    'character-stats-compare': vue_characterStatsCompare
  }
}
</script>
<style lang="less" scoped>
.content {
  display: flex;
  align-items: flex-start;
  margin-top: 1rem;
  position: relative;

  > .items {
    width: 18rem;
    margin-right: 1rem;
    min-height: 15rem;
  }

  > .preview {
    width: 22rem;
    padding-bottom: 0.6rem;
    overflow-y: auto;
    max-height: 100%;
    position: sticky;
    top: 0;
    z-index: 1;

    > .info {
      border: 0.1rem solid var(--primary-light);
      padding: 0.6rem;
    }

    > .compare {
      padding: 0.6rem;
      border: 0.1rem solid var(--primary-light);
      margin-top: 0.6rem;
    }

    @media screen and (max-width: 40rem) {
      position: absolute;
      top: 0;
      right: -22.5rem;
      z-index: 1;
      background-color: var(--white);
      transition: 0.4s;

      &.unfold {
        right: 0rem;
        transition: 0.4s ease;
      }
    }
  }

  > .toggle-info-unfold-btn {
    display: none;

    @media screen and (max-width: 40rem) {
      display: inline-block;
      position: absolute;
      right: -1.6rem;
      top: -1.2rem;
      background-color: var(--white);
      z-index: 2;
    }
  }
}
</style>