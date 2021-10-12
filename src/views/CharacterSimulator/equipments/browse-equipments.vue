<template>
  <cy-modal
    :visible="visible"
    width="wide"
    @close="closeWindow"
  >
    <template #title>
      <cy-icon-text icon="ic-outline-category">
        {{ $lang('action: ' + actionType) }}
      </cy-icon-text>
    </template>
    <template #default>
      <!-- top -->
      <div class="flex items-center border-b border-solid border-light-2 pb-2">
        <div class="ml-auto">
          <cy-button-border
            icon="ic-round-add-circle-outline"
            @click="toggleMainWindowVisible('appendEquipments', true)"
          >
            {{ $lang('append equipments') }}
          </cy-button-border>
          <cy-button-border
            icon="gridicons-create"
            @click="toggleMainWindowVisible('createCustomEquipment', true)"
          >
            {{ $lang.extra('parent', 'custom equipment') }}
          </cy-button-border>
        </div>
      </div>
      <div class="content">
        <div class="items">
          <equipment-item
            v-for="eq in browsedEquipments"
            :key="eq.iid"
            :equipment="eq.origin"
            :selected="eq.origin === currentEquipment"
            :current="actionType === 'select-field-equipment' && action.targetField.equipment === eq.origin"
            :disabled="eq['@disabled']"
            @click="setCurrentEquipment(eq.origin, eq['@disabled'])"
          />
        </div>
        <div class="preview" :class="{ 'unfold': infoUnfold }">
          <div v-if="currentEquipment" class="info" @click.stop>
            <equipment-info :equipment="currentEquipment" />
          </div>
          <div
            v-if="actionType === 'select-field-equipment' && currentEquipment
              && currentEquipment != action.targetField.equipment && !currentEquipmentDisable"
            class="compare"
          >
            <character-stats-compare
              :before="compareData.before"
              :after="compareData.after"
            />
          </div>
        </div>
        <cy-button-border
          v-if="currentEquipment"
          icon="mdi-rhombus-outline"
          class="toggle-info-unfold-btn"
          @click="toggleInfoUnfold"
        />
      </div>
      <!-- bottom -->
      <cy-bottom-content v-if="currentEquipment" class="z-1">
        <template #normal-content>
          <div class="flex items-center flex-wrap">
            <cy-button-border icon="ic-baseline-delete-outline" @click="removeSelectedEquipment">
              {{ $rootLang('global/remove') }}
            </cy-button-border>
            <cy-button-border icon="mdi-content-copy" @click="copySelectedEquipment">
              {{ $rootLang('global/copy') }}
            </cy-button-border>
            <div
              v-if="actionType === 'select-field-equipment'"
              class="ml-auto"
            >
              <cy-button-border
                v-if="!currentEquipmentDisable"
                icon="ic-round-done"
                @click="selectEquipment"
              >
                {{ $rootLang('global/confirm') }}
              </cy-button-border>
              <cy-button-border v-else icon="ic-round-done" type="border" :disabled="true">
                {{ $rootLang('global/confirm') }}
              </cy-button-border>
            </div>
          </div>
        </template>
      </cy-bottom-content>
    </template>
  </cy-modal>
</template>
<script>
import { mapState } from 'vuex';

import { EquipmentFieldTypes } from '@/lib/Character/Character/enums';
import { MainWeapon, SubWeapon, SubArmor, BodyArmor, AdditionalGear, SpecialGear, Avatar } from '@/lib/Character/CharacterEquipment';

import vue_equipmentItem from '@/components/common/equipment-item.vue';

import vue_characterStatsCompare from '../main/character-stats-compare.vue';
import vue_equipmentInfo from './equipment-info.vue';


export default {
  RegisterLang: {
    root: 'Character Simulator/browse equipments',
    extra: {
      parent: 'Character Simulator',
    },
  },
  inject: [
    'toggleMainWindowVisible',
    'handleCharacterStateDatas',
    'appendEquipments',
  ],
  props: ['visible', 'action', 'characterState'],
  emits: ['close'],
  data() {
    return {
      currentEquipment: null,
      currentEquipmentDisable: false,
      infoUnfold: false,
      compardEquipment: false,
    };
  },
  computed: {
    ...mapState('character', {
      'equipments': 'equipments',
    }),
    currentCharacterStateDatas() {
      return this.handleCharacterStateDatas({
        handlePassiveSkill: true,
        handleActiveSkill: true,
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
            equipment: this.currentEquipment,
          },
        }),
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
          return {
            origin: p,
            iid: i,
            '@disabled': !this.fieldFilter(p),
          };
        })
        .sort((a, b) => a.origin.name.localeCompare(b.origin.name));
    },
  },
  methods: {
    toggleInfoUnfold() {
      this.infoUnfold = !this.infoUnfold;
    },
    copySelectedEquipment() {
      const eq = this.currentEquipment.copy();
      eq.name = eq.name + '*';
      this.appendEquipments([eq]);
      this.$notify(this.$lang('message: copy equipment'), 'mdi-content-copy',
        'browse equipment/copy equipment');
    },
    removeSelectedEquipment() {
      const eq = this.currentEquipment;
      const index = this.equipments.indexOf(eq);
      index != -1 && this.$store.commit('character/removeEquipment', {
        index,
      });

      const modifiedFields = this.characterState.origin.equipmentFields.filter(field => {
        if (field.equipment === eq) {
          field.removeEquipment();
          return true;
        }
        return false;
      });
      this.$notify(this.$lang('message: remove equipment', [eq.name]),
        'ic-baseline-delete-outline', null, {
          buttons: [{
            text: this.$rootLang('global/recovery'),
            click: () => {
              this.appendEquipments([eq]);
              modifiedFields.forEach(field => field.setEquipment(eq));
              this.$notify(this.$lang('message: removed equipment recovery', [eq.name]));
            },
            removeMessageAfterClick: true,
          }],
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
    setCurrentEquipment(eq, disabled = false) {
      if (this.currentEquipment === eq && !disabled) {
        this.selectEquipment();
        return;
      }
      this.currentEquipment = eq;
      this.currentEquipmentDisable = disabled;
    },
    fieldFilter(eq) {
      switch (this.action.targetField.type) {
        case EquipmentFieldTypes.MainWeapon:
          return eq instanceof MainWeapon;
        case EquipmentFieldTypes.SubWeapon:
          if (eq instanceof MainWeapon || eq instanceof SubWeapon || eq instanceof SubArmor) {
            const t = this.characterState.origin.subWeaponValid(eq.type);
            return t;
          }
          return false;
        case EquipmentFieldTypes.BodyArmor:
          return eq instanceof BodyArmor;
        case EquipmentFieldTypes.Additional:
          return eq instanceof AdditionalGear;
        case EquipmentFieldTypes.Special:
          return eq instanceof SpecialGear;
        case EquipmentFieldTypes.Avatar:
          return eq instanceof Avatar;
      }
    },
  },
  watch: {
    visible(newValue) {
      if (newValue) {
        this.compardEquipment = false;
      }
    },
  },
  components: {
    'equipment-item': vue_equipmentItem,
    'equipment-info': vue_equipmentInfo,
    'character-stats-compare': vue_characterStatsCompare,
  },
};
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
