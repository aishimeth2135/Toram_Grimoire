<template>
  <div class="information">
    <div class="title">
      <cy-icon-text class="name"
        :iconify-name="equipmentData.categoryIcon">
        {{ equipmentData.origin.name }}
        <span class="refining" v-if="equipmentData.origin.hasRefining && equipmentData.origin.refining > 0">+{{ equipmentData.origin.refining | equipmentRefining }}</span>
      </cy-icon-text>
      <span class="category">{{ equipmentData.categoryText }}</span>
      <cy-button type="icon-only" class="single-line" style="margin-left: auto"
        :iconify-name="mode == 0 ? 'ic-round-edit' : 'ic-round-view-list'"
        @click="mode = mode == 0 ? 1 : 0" />
    </div>
    <transition name="fade" mode="out-in">
      <div class="info" v-if="mode == 0" key="base">
        <div class="base" v-if="['weapon', 'armor'].includes(equipmentData.origin.is)">
          <table>
            <template v-if="equipmentData.origin.is == 'weapon'">
              <tr>
                <td class="name">ATK</td>
                <td class="value">
                  {{ equipmentData.origin.atk }}<span class="refining" v-if="equipmentData.origin.hasRefining && equipmentData.origin.refining > 0">+{{ equipmentData.origin.refiningAdditionAmount }}</span>
                </td>
              </tr>
              <tr>
                <td class="name">{{ langText('stability') }}</td>
                <td class="value">{{ equipmentData.origin.stability }}%</td>
              </tr>
            </template>
            <template v-else>
              <tr>
                <td class="name">DEF</td>
                <td class="value">{{ equipmentData.origin.def }}</td>
              </tr>
            </template>
          </table>
        </div>
        <div class="stats">
          <span v-for="(stat, i) in equipmentData.origin.stats"
            class="stat-scope">
            {{ stat.show() }}
          </span>
        </div>
      </div>
      <div class="edit" v-else key="edit">
        <div v-if="equipmentData.origin.customTypeList != null">
          <cy-button iconify-name="mdi-checkbox-multiple-blank-circle" type="with-title"
            @click="switchCustomType">
            <template v-slot:title>{{ langText('equipment type') }}</template>
            {{ langText('field type text/' + equipmentData.origin.type.description) }}
          </cy-button>
        </div>
        <cy-drag-bar v-if="equipmentData.origin.hasRefining"
          :value="equipmentData.origin.refining" :range="[0, 15]"
          @set-value="v => equipmentData.origin.refining = v">
          <template v-slot:title>{{ langText('refining') }}</template>
        </cy-drag-bar>
        <div class="crystals" v-if="equipmentData.origin.hasCrystal">
          <cy-button v-for="(c, i) in equipmentData.origin.crystals"
            :key="c.id" iconify-name="bx-bx-cube-alt" type="line"
            @click="removeCrystal(i)">
            {{ c.name }}
            <template v-slot:content-right>
              <cy-icon-text iconify-name="ic-round-close" />
            </template>
          </cy-button>
          <cy-button v-if="equipmentData.origin.crystals.length < 2"
            iconify-name="bx-bx-circle" type="line"
            @click="editCrystal">
            {{ langText('crystal empty') }}
          </cy-button>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import GetLang from "@global-modules/LanguageSystem.js";

  export default {
    props: ['equipmentData'],
    data(){
      return {
        mode: 0, // 0: normal, 1: edit
        currentEquipmentCustomTypeIndex: 0
      };
    },
    filters: {
      equipmentRefining(v){
        return v;
      }
    },
    methods: {
      switchCustomType(){
        const eq = this.equipmentData.origin;
        const len = eq.customTypeList.length;

        ++this.currentEquipmentCustomTypeIndex;
        if ( this.currentEquipmentCustomTypeIndex == len )
          this.currentEquipmentCustomTypeIndex = 0;
        eq.setCustomType(eq.customTypeList[this.currentEquipmentCustomTypeIndex]);
      },
      removeCrystal(index){
        this.equipmentData.origin.crystals.splice(index, 1);
      },
      editCrystal(){
        this.$emit('open-select-crystal', this.equipmentData.origin);
      },
      langText(s, vs){
        return GetLang('Character Simulator/' + s, vs);
      }
    }
  }
</script>

<style lang="less" scoped>
  .information {
    > .title {
      padding-bottom: 0.1rem;
      padding-left: 0.3rem;
      display: flex;
      align-items: flex-end;

      > .name {
        margin-right: 0.6rem;
        color: var(--primary-purple);
      }
      > .category {
        color: var(--primary-light-3);
        font-size: 0.9rem;
      }
    }
    > .info {
      padding: 0 0.4rem;

      > .base {
        > table {
          table-layout: fixed;
          width: calc(100% - 1rem);
          border-collapse: collapse;
          margin: 0.4rem 0;

          td {
            border-bottom: 1px solid var(--primary-light);
            padding: 0.1rem 0.2rem;

            &.name {
              text-align: right;
              width: 4rem;
              vertical-align: bottom;
              font-size: 0.9rem;
              color: var(--primary-purple);
            }
            &.value {
              color: var(--primary-light-4);
              padding-left: 0.6rem;
            }
          }
        }
      }
      
      > .stats {
      }

      .stat-scope {
        border-bottom: 1px solid var(--primary-light-2);
        margin: 0.1rem 0.3rem;
        display: inline-block;
        padding: 0.1rem 0.4rem;
      }
    }
    > .edit {

    }

    .refining {
      color: var(--primary-water-blue);
      margin-left: 0.3rem;
    }
  }

  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  .fade-enter-active, .fade-leave-active {
    transition: 0.3s;
  }
  .fade-enter-to, .fade-leave {
    opacity: 1;
  }
</style>