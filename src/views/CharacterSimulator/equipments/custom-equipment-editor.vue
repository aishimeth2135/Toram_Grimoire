<template>
  <div class="main--custom-equipment-editor">
    <cy-icon-text iconify-name="mdi-clipboard-edit-outline"
      text-size="small" text-color="purple">
      {{ langText('custom equipment editor/equipment name') }}
    </cy-icon-text>
    <div class="name content">
      <cy-title-input iconify-name="mdi-clipboard-edit-outline">
        <input type="text" v-model="equipment.name" />
      </cy-title-input>
    </div>
    <cy-icon-text iconify-name="mdi-rhombus-outline"
      text-size="small" text-color="purple">
      {{ langText('custom equipment editor/equipment stats') }}
    </cy-icon-text>
    <div class="stats content">
      <div v-for="stat in equipment.stats"
        :key="`${stat.baseName()}-${stat.type.description}`">
        <cy-input-counter :value="stat.statValue()"
          type="line" class="set-stat-value"
          :range="stat.isBoolStat ? [1, 1] : [null, null]"
          @set-value="setStatValue(stat, $event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-rhombus-outline">
              {{ stat.show() }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
      <cy-button iconify-name="ic-round-add" type="border"
        @click="toggleWindowVisible('selectStat', true)">
        {{ langText('custom equipment editor/select stat: window title') }}
      </cy-button>
    </div>
    <template v-if="hasOther">
      <cy-icon-text iconify-name="mdi-rhombus-outline"
        text-size="small" text-color="purple">
        {{ langText('custom equipment editor/equipment other') }}
      </cy-icon-text>
      <div class="other content">
        <cy-input-counter v-if="equipment.hasStability"
          :value="equipment.stability" :range="[0, 100]"
          @set-value="setStability($event)">
          <template v-slot:title>
            <cy-icon-text iconify-name="mdi-rhombus-outline">
              {{ langText('stability') }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
    </template>
    <cy-window :visible="selectStatWindowVisible" @close-window="toggleWindowVisible('selectStat', false)">
      <template v-slot:title>
        <cy-icon-text iconify-name="mdi-rhombus-outline">
          {{ langText('custom equipment editor/select stat: window title') }}
        </cy-icon-text>
      </template>
      <cy-title-input iconify-name="ic-outline-category" class="search-stat-input">
        <input type="text" v-model="searchText"
          :placeholder="langText('custom equipment editor/select stat: search placeholder')" />
      </cy-title-input>
      <template v-if="statsSearchResult.length != 0">
        <cy-list-item v-for="stat in statsSearchResult"
          :key="`${stat.origin.baseName}-${stat.type.description}`"
          :selected="(equipment.findStat(stat.origin.baseName, stat.type) ? true : false) || appendedStats.includes(stat) || deletedStats.includes(stat)"
          @click="selectStat(stat)">
          <!-- main -->
          <cy-icon-text v-if="appendedStats.includes(stat)"
            iconify-name="mdi-rhombus-outline"
            text-color="water-blue" icon-color="water-blue-light">
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text v-else-if="deletedStats.includes(stat)"
            iconify-name="mdi-rhombus-outline"
            text-color="red" icon-color="red-light">
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text v-else-if="equipment.findStat(stat)"
            iconify-name="mdi-rhombus-outline"
            text-color="purple">
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text v-else iconify-name="mdi-rhombus-outline">
            {{ stat.text }}
          </cy-icon-text>
          <!-- right-content -->
          <template #right-content>
            <cy-icon-text v-if="appendedStats.includes(stat)"
              iconify-name="ic-round-add"
              icon-color="water-blue-light" />
            <cy-icon-text v-else-if="deletedStats.includes(stat)"
              iconify-name="ic-round-delete"
              icon-color="red-light" />
          </template>
        </cy-list-item>
      </template>
      <cy-default-tips v-else icon-id="potum">
        {{ langText('Warn/no result found') }}
      </cy-default-tips>
      <cy-bottom-content v-if="appendedStats.length != 0 || deletedStats.length != 0" class="bottom-content">
        <template #normal-content>
          <cy-transition type="slide-up">
            <div v-if="selectStatDetailVisible" class="select-stats-detail">
              <div class="content">
                <div class="title">
                  <cy-icon-text iconify-name="mdi-rhombus-outline"
                    text-size="small" text-color="purple">
                    {{ langText('custom equipment editor/select stat: current stats') }}
                  </cy-icon-text>
                </div>
                <template v-if="equipmentStatsDatas.length != 0">
                  <cy-list-item v-for="stat in equipmentStatsDatas"
                    :key="`current-${stat.origin.baseName}-${stat.type.description}`"
                    @click="selectStat(stat)">
                    <cy-icon-text iconify-name="mdi-rhombus-outline">
                      {{ stat.text }}
                    </cy-icon-text>
                    <template #right-content>
                      <cy-icon-text iconify-name="ic-round-close" />
                    </template>
                  </cy-list-item>
                </template>
                <cy-list-item v-else>
                  <cy-icon-text iconify-name="mdi-rhombus-outline">
                    {{ globalLangText('global/none') }}
                  </cy-icon-text>
                </cy-list-item>
                <div class="title">
                  <cy-icon-text iconify-name="mdi-rhombus-outline"
                    text-size="small" text-color="purple">
                    {{ langText('custom equipment editor/select stat: appended stats') }}
                  </cy-icon-text>
                </div>
                <template v-if="appendedStats.length != 0">
                  <cy-list-item v-for="stat in appendedStats"
                    :key="`append-${stat.origin.baseName}-${stat.type.description}`"
                    @click="selectStat(stat)">
                    <cy-icon-text iconify-name="mdi-rhombus-outline"
                      text-color="water-blue" icon-color="water-blue-light">
                      {{ stat.text }}
                    </cy-icon-text>
                    <template #right-content>
                      <cy-icon-text iconify-name="ic-round-close" />
                    </template>
                  </cy-list-item>
                </template>
                <cy-list-item v-else>
                  <cy-icon-text iconify-name="mdi-rhombus-outline">
                    {{ globalLangText('global/none') }}
                  </cy-icon-text>
                </cy-list-item>
                <div class="title">
                  <cy-icon-text iconify-name="mdi-rhombus-outline"
                    text-size="small" text-color="purple">
                    {{ langText('custom equipment editor/select stat: deleted stats') }}
                  </cy-icon-text>
                </div>
                <template v-if="deletedStats.length != 0">
                  <cy-list-item v-for="stat in deletedStats"
                    :key="`delete-${stat.origin.baseName}-${stat.type.description}`"
                    @click="selectStat(stat)">
                    <cy-icon-text iconify-name="mdi-rhombus-outline"
                      text-color="red" icon-color="red-light">
                      {{ stat.text }}
                    </cy-icon-text>
                    <template #right-content>
                      <cy-icon-text iconify-name="ic-round-close" />
                    </template>
                  </cy-list-item>
                </template>
                <cy-list-item v-else>
                  <cy-icon-text iconify-name="mdi-rhombus-outline">
                    {{ globalLangText('global/none') }}
                  </cy-icon-text>
                </cy-list-item>
              </div>
            </div>
          </cy-transition>
          <cy-flex-layout @click.native="toggleVisible('selectStatDetail')" class="top">
            <cy-icon-text :iconify-name="'ic-round-keyboard-arrow-' + (selectStatDetailVisible ? 'down' : 'up')" />
            <template #right-content>
              <cy-button iconify-name="ic-round-done" type="border"
                @click.stop="confirmEquipmentSelection">
                {{ globalLangText('global/confirm') }}
              </cy-button>
              <cy-button iconify-name="ic-round-close" type="border"
                @click.stop="cancelEquipmentSelection">
                {{ globalLangText('global/cancel') }}
              </cy-button>
            </template>
          </cy-flex-layout>
        </template>
      </cy-bottom-content>
    </cy-window>
  </div>
</template>
<script>
import StatBase from "@lib/CharacterSystem/module/StatBase.js";

import { RestrictionStat } from "@lib/CharacterSystem/CharacterStat/class/main.js";
import MessageNotify from "@Service/Notify";

export default {
  props: ['equipment'],
  inject: ['langText', 'globalLangText', 'isElementStat'],
  data() {
    const stats = [], statTypes = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    this.$store.state.datas.character.statList.forEach(stat => {
      if (stat.attributes.hidden)
        return;
      statTypes.forEach(type => {
        if (type == StatBase.TYPE_MULTIPLIER && !stat.hasMultiplier)
          return;
        stats.push({
          origin: stat,
          text: stat.title(type),
          type
        });
      })
    });

    return {
      searchText: '',
      selectStatWindowVisible: false,
      selectStatDetailVisible: false,
      stats,
      appendedStats: [],
      deletedStats: []
    }
  },
  computed: {
    statsSearchResult() {
      if (this.searchText == '') {
        return this.elementFilterStats;
      }
      return this.elementFilterStats
        .filter(stat => stat.origin.title(stat.type).toLowerCase().includes(this.searchText.toLowerCase()));
    },
    hasOther() {
      return this.equipment.hasStability;
    },
    equipmentStatsDatas() {
      return this.stats.filter(stat => this.equipment.findStat(stat.origin.baseName, stat.type));
    },
    elementFilterStats() {
      return !this.equipment.hasElement ?
        this.stats.filter(p => !this.isElementStat(p.origin.baseName)) :
        this.stats;
    },
  },
  methods: {
    setStability(v) {
      this.equipment.stability = v;
    },
    cancelEquipmentSelection() {
      const { deletedStats, appendedStats } = this;
      this.deletedStats = [];
      this.appendedStats = [];
      MessageNotify(this.langText('Warn/create custom equipment editor: selected stats clear'),
        'ic-round-done', null, {
          buttons: [{
            text: this.globalLangText('global/recovery'),
            click: () => {
              this.deletedStats = deletedStats;
              this.appendedStats = appendedStats;
            },
            removeMessageAfterClick: true
          }]
      });
      this.toggleWindowVisible('selectStat', false);
    },
    confirmEquipmentSelection() {
      const stats = this.equipment.stats;
      this.deletedStats.forEach(p => {
        const stat = this.equipment.findStat(p.origin.baseName, p.type);
        const idx = stats.indexOf(stat);
        stats.splice(idx, 1);
      });
      this.appendedStats.forEach(p => {
        const v = p.origin.checkBoolStat() ? 1 : 0;
        const stat = RestrictionStat.from(p.origin.createSimpleStat(p.type, v));
        stats.push(stat);
      });
      this.deletedStats = [];
      this.appendedStats = [];
      this.toggleWindowVisible('selectStat', false);
    },
    selectStat(stat) {
      const appendedIdx = this.appendedStats.indexOf(stat),
        deletedIdx = this.deletedStats.indexOf(stat);
      if (appendedIdx != -1) {
        this.appendedStats.splice(appendedIdx, 1);
      } else if (deletedIdx != -1) {
        this.deletedStats.splice(deletedIdx, 1);
      } else {
        if (this.equipment.findStat(stat.origin.baseName, stat.type))
          this.deletedStats.push(stat);
        else {
          const find = ss => ss.find(a => this.isElementStat(a.origin.baseName));

          if ( this.isElementStat(stat.origin.baseName) && (
            (this.equipment.elementStat && !find(this.deletedStats)) ||
            find(this.appendedStats) ) ) {
            MessageNotify(this.langText('custom equipment editor/equipment can only have one element stat'),
              null, 'equipment can only have one element stat');
          } else {
            this.appendedStats.push(stat);
          }
        }
      }
    },
    setStatValue(stat, v) {
      stat.statValue(v);
    },
    toggleWindowVisible(target, force) {
      target = target + 'Window';
      this.toggleVisible(target, force);
    },
    toggleVisible(target, force) {
      target = target + 'Visible';
      force = force === void 0 ? !this[target] : force;
      this[target] = force;
    }
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';

.bottom-content {
  @{deep} .top {
    cursor: pointer;
  }
}

.select-stats-detail {
  > .content {
    > .title {
      margin-top: 0.8rem;
    }
  }
}

.main--custom-equipment-editor {
  padding: 0.2rem 0;
  > .content {
    margin-bottom: 0.8rem;
    margin-top: 0.3rem;
  }
}

.stats {
  margin-top: 0.4rem;
}

.other {
  margin-top: 0.4rem;
}

.set-stat-value {
  --input-width: 2.6rem;
  margin-bottom: 0.6rem;
}

.title {
  width: 100%;
}
</style>