<template>
  <div class="information">
    <div class="title">
      <cy-icon-text class="name" :iconify-name="equipmentData.categoryIcon">
        {{ equipment.name }}<span class="refining" v-if="equipment.hasRefining && equipment.refining > 0">+{{ equipment.refining | equipmentRefining }}</span>
      </cy-icon-text>
      <span class="category">{{ equipmentData.categoryText }}</span>
      <cy-button type="icon-only" class="single-line" style="margin-left: auto"
        :iconify-name="mode == 0 ? 'ic-round-edit' : 'ic-round-view-list'"
        @click="mode = mode == 0 ? 1 : 0" />
    </div>
    <cy-transition type="fade" mode="out-in">
      <div class="info" v-if="mode == 0" key="base">
        <div class="base" v-if="['weapon', 'armor'].includes(equipment.is)">
          <template v-if="equipment.is == 'weapon'">
            <cy-icon-text iconify-name="mdi-sword" class="name">ATK</cy-icon-text>
            <span class="value">
              {{ equipment.atk }}<span class="refining" v-if="equipment.hasRefining && equipment.refining > 0">+{{ equipment.refiningAdditionAmount }}</span>
            </span>
            <span class="stability">{{ equipment.stability }}%</span>
          </template>
          <template v-else>
            <cy-icon-text iconify-name="mdi-shield" class="name">DEF</cy-icon-text>
            <span class="value">{{ equipment.def }}</span>
          </template>
        </div>
        <div class="stats">
          <span v-for="stat in equipment.stats"
            :key="stat.baseName()" class="stat-scope">
            <cy-icon-text iconify-name="mdi-leaf">{{ stat.show() }}</cy-icon-text>
          </span>
        </div>
      </div>
      <div class="edit" v-else key="edit">
        <div v-if="equipment.customTypeList != null">
          <cy-button iconify-name="mdi-checkbox-multiple-blank-circle" type="with-title"
            @click="switchCustomType">
            <template v-slot:title>{{ langText('equipment type') }}</template>
            {{ langText('field type text/' + equipment.type.description) }}
          </cy-button>
        </div>
        <cy-input-counter v-if="equipment.is == 'weapon'" class="counter"
          :value="equipment.atk" :range="[equipment.baseAtk, Math.ceil(equipment.baseAtk * 1.1) + 10]"
          @set-value="setAtk(equipment, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-sword">ATK</cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-input-counter v-else-if="equipment.is == 'armor'" class="counter"
          :value="equipment.def" :range="[equipment.baseDef, Math.ceil(equipment.baseDef * 1.1) + 10]"
          @set-value="setDef(equipment, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-shield">DEF</cy-icon-text>
          </template>
        </cy-input-counter>
        <cy-input-counter v-if="equipment.hasRefining" class="counter"
          :value="equipment.refining" :range="[0, 15]"
          @set-value="setRefining(equipment, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-cube-send">{{ langText('refining') }}</cy-icon-text>
          </template>
        </cy-input-counter>
        <div class="crystals" v-if="equipment.hasCrystal">
          <cy-button v-for="(c, i) in equipment.crystals"
            :key="c.id" iconify-name="bx-bx-cube-alt" type="line"
            @click="removeCrystal(i)">
            {{ c.name }}
            <template v-slot:content-right>
              <cy-icon-text iconify-name="ic-round-close" />
            </template>
          </cy-button>
          <cy-button v-if="equipment.crystals.length < 2"
            iconify-name="bx-bx-circle" type="line"
            @click="editCrystal">
            {{ langText('crystal empty') }}
          </cy-button>
        </div>
      </div>
    </cy-transition>
  </div>
</template>

<script>
  export default {
    props: ['equipment'],
    inject: ['langText', 'getShowEquipmentData'],
    data(){
      return {
        mode: 0, // 0: normal, 1: edit
        currentCustomTypeIndex: 0
      };
    },
    filters: {
      equipmentRefining(v){
        return v;
      }
    },
    computed: {
      equipmentData() {
        return this.getShowEquipmentData(this.equipment);
      }
    },
    methods: {
      setAtk(eq, v) {
        eq.atk = v;
      },
      setDef(eq, v) {
        eq.def = v;
      },
      setRefining(eq, v) {
        eq.refining = v;
      },
      switchCustomType(){
        const eq = this.equipment;
        const len = eq.customTypeList.length;

        ++this.currentCustomTypeIndex;
        if ( this.currentCustomTypeIndex == len )
          this.currentCustomTypeIndex = 0;
        eq.setCustomType(eq.customTypeList[this.currentCustomTypeIndex]);
      },
      removeCrystal(index){
        this.equipment.crystals.splice(index, 1);
      },
      editCrystal(){
        this.$emit('open-select-crystal', this.equipment);
      }
    }
  }
</script>

<style lang="less" scoped>
@deep-operator: ~'>>>';

.information {
  width: 100%;

  > .title {
    padding-bottom: 0.2rem;
    padding-left: 0.3rem;
    display: flex;
    align-items: flex-end;

    > .name {
      margin-right: 0.6rem;
      color: var(--primary-purple);

      @{deep-operator} .refining {
        color: var(--primary-water-blue);
        margin-left: 0.3rem;
      }
    }
    > .category {
      color: var(--primary-light-3);
      font-size: 0.9rem;
    }
  }
  > .info {
    padding: 0 0.4rem;

    > .base {
      padding: 0.4rem 0.7rem;
      border: 0.1rem solid var(--primary-light);
      border-radius: 1rem;
      margin: 0.6rem 0;
      display: flex;
      align-items: center;

      > .name {
        color: var(--primary-purple);
      }

      > .value {
        margin-left: 0.5rem;

        > .refining {
          color: var(--primary-water-blue);
          margin-left: 0.2rem;
        }
      }

      > .stability {
        margin-left: auto;
      }
    }

    > .stats {
      padding-left: 0.3rem;
    }

    .stat-scope {
      display: inline-block;
      margin-right: 0.6rem;

      @{deep-operator} svg {
        width: 0.8rem;
        height: 0.8rem;
        align-self: flex-end;
      }
      @{deep-operator} .text {
        margin-left: 0.2rem;
      }
    }
  }
  > .edit {
    padding-top: 0.6rem;

    .counter {
      margin: 0 0.3rem;
      margin-bottom: 0.6rem;
    }
  }
}
</style>