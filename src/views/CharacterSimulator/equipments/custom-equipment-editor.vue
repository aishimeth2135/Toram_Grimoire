<template>
  <div class="main--custom-equipment-editor">
    <cy-icon-text
      icon="mdi-clipboard-edit-outline"
      size="small"
      text-color="purple"
    >
      {{ $lang('custom equipment editor/equipment name') }}
    </cy-icon-text>
    <div class="content">
      <cy-title-input
        icon="mdi-clipboard-edit-outline"
        :value="equipment.name"
        @update:value="setEquipmentProperty(equipment, 'name', $event)"
      />
    </div>
    <cy-icon-text
      icon="mdi-rhombus-outline"
      size="small"
      text-color="purple"
    >
      {{ $lang('custom equipment editor/equipment stats') }}
    </cy-icon-text>
    <div class="mt-2 content">
      <div
        v-for="stat in equipment.stats"
        :key="stat.statId"
      >
        <cy-input-counter
          :value="stat.value"
          type="line"
          class="set-stat-value"
          :range="stat.isBoolStat ? ranges.boolStat : ranges.stat"
          @update:value="setStatValue(stat, $event)"
        >
          <template #title>
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ stat.show() }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
      <cy-button-border icon="ic-round-add" @click="toggleWindowVisible('selectStat', true)">
        {{ $lang('custom equipment editor/select stat: window title') }}
      </cy-button-border>
    </div>
    <template v-if="hasOther">
      <cy-icon-text
        icon="mdi-rhombus-outline"
        size="small"
        text-color="purple"
      >
        {{ $lang('custom equipment editor/equipment other') }}
      </cy-icon-text>
      <div class="mt-2 content">
        <cy-input-counter
          v-if="equipment.hasStability"
          :value="equipment.stability"
          :range="ranges.stability"
          @update:value="setEquipmentProperty(equipment, 'stability', $event)"
        >
          <template #title>
            <cy-icon-text icon="mdi-rhombus-outline">
              {{ $lang('stability') }}
            </cy-icon-text>
          </template>
        </cy-input-counter>
      </div>
    </template>
    <cy-window v-model:visible="selectStatWindowVisible">
      <template #title>
        <cy-icon-text icon="mdi-rhombus-outline">
          {{ $lang('custom equipment editor/select stat: window title') }}
        </cy-icon-text>
      </template>
      <cy-title-input
        v-model:value="searchText"
        icon="ic-outline-category"
        class="search-stat-input"
        :placeholder="$lang('custom equipment editor/select stat: search placeholder')"
      />
      <template v-if="statsSearchResult.length !== 0">
        <cy-list-item
          v-for="stat in statsSearchResult"
          :key="`${stat.origin.baseName}-${stat.type.description}`"
          :selected="(equipment.findStat(stat.origin.baseName, stat.type) ? true : false) || appendedStats.includes(stat) || deletedStats.includes(stat)"
          @click="selectStat(stat)"
        >
          <!-- main -->
          <cy-icon-text
            v-if="appendedStats.includes(stat)"
            icon="mdi-rhombus-outline"
            text-color="water-blue"
            icon-color="water-blue-light"
          >
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text
            v-else-if="deletedStats.includes(stat)"
            icon="mdi-rhombus-outline"
            text-color="red"
            icon-color="red-light"
          >
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text
            v-else-if="equipment.findStat(stat)"
            icon="mdi-rhombus-outline"
            text-color="purple"
          >
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text v-else icon="mdi-rhombus-outline">
            {{ stat.text }}
          </cy-icon-text>
          <cy-icon-text
            v-if="appendedStats.includes(stat)"
            icon="ic-round-add"
            icon-color="water-blue-light"
            class="ml-auto"
          />
          <cy-icon-text
            v-else-if="deletedStats.includes(stat)"
            icon="ic-round-delete"
            icon-color="red-light"
            class="ml-auto"
          />
        </cy-list-item>
      </template>
      <cy-default-tips v-else icon="potum" icon-src="custom">
        {{ $lang('Warn/no result found') }}
      </cy-default-tips>
      <cy-bottom-content
        v-if="appendedStats.length !== 0 || deletedStats.length !== 0"
        class="bottom-content"
      >
        <template #normal-content>
          <div v-if="selectStatDetailVisible" class="animate-slide-up">
            <div class="content">
              <div class="w-full">
                <cy-icon-text
                  icon="mdi-rhombus-outline"
                  size="small"
                  text-color="purple"
                >
                  {{ $lang('custom equipment editor/select stat: current stats') }}
                </cy-icon-text>
              </div>
              <template v-if="equipmentStatsDatas.length != 0">
                <cy-list-item
                  v-for="stat in equipmentStatsDatas"
                  :key="`current-${stat.origin.baseName}-${stat.type.description}`"
                  @click="selectStat(stat)"
                >
                  <cy-icon-text icon="mdi-rhombus-outline">
                    {{ stat.text }}
                  </cy-icon-text>
                  <cy-icon-text icon="ic-round-close" class="ml-auto" />
                </cy-list-item>
              </template>
              <cy-list-item v-else>
                <cy-icon-text icon="mdi-rhombus-outline">
                  {{ $rootLang('global/none') }}
                </cy-icon-text>
              </cy-list-item>
              <div class="w-full">
                <cy-icon-text
                  icon="mdi-rhombus-outline"
                  size="small"
                  text-color="purple"
                >
                  {{ $lang('custom equipment editor/select stat: appended stats') }}
                </cy-icon-text>
              </div>
              <template v-if="appendedStats.length != 0">
                <cy-list-item
                  v-for="stat in appendedStats"
                  :key="`append-${stat.origin.baseName}-${stat.type.description}`"
                  @click="selectStat(stat)"
                >
                  <cy-icon-text
                    icon="mdi-rhombus-outline"
                    text-color="water-blue"
                    icon-color="water-blue-light"
                  >
                    {{ stat.text }}
                  </cy-icon-text>
                  <cy-icon-text icon="ic-round-close" class="ml-auto" />
                </cy-list-item>
              </template>
              <cy-list-item v-else>
                <cy-icon-text icon="mdi-rhombus-outline">
                  {{ $rootLang('global/none') }}
                </cy-icon-text>
              </cy-list-item>
              <div class="w-full">
                <cy-icon-text
                  icon="mdi-rhombus-outline"
                  size="small"
                  text-color="purple"
                >
                  {{ $lang('custom equipment editor/select stat: deleted stats') }}
                </cy-icon-text>
              </div>
              <template v-if="deletedStats.length != 0">
                <cy-list-item
                  v-for="stat in deletedStats"
                  :key="`delete-${stat.origin.baseName}-${stat.type.description}`"
                  @click="selectStat(stat)"
                >
                  <cy-icon-text
                    icon="mdi-rhombus-outline"
                    text-color="red"
                    icon-color="red-light"
                  >
                    {{ stat.text }}
                  </cy-icon-text>
                  <cy-icon-text icon="ic-round-close" class="ml-auto" />
                </cy-list-item>
              </template>
              <cy-list-item v-else>
                <cy-icon-text icon="mdi-rhombus-outline">
                  {{ $rootLang('global/none') }}
                </cy-icon-text>
              </cy-list-item>
            </div>
          </div>
          <div
            class="top flex items-center flex-wrap"
            @click="toggleVisible('selectStatDetail')"
          >
            <cy-icon-text :icon="'ic-round-keyboard-arrow-' + (selectStatDetailVisible ? 'down' : 'up')" />
            <div class="ml-auto">
              <cy-button-border icon="ic-round-done" @click.stop="confirmEquipmentSelection">
                {{ $rootLang('global/confirm') }}
              </cy-button-border>
              <cy-button-border icon="ic-round-close" @click.stop="cancelEquipmentSelection">
                {{ $rootLang('global/cancel') }}
              </cy-button-border>
            </div>
          </div>
        </template>
      </cy-bottom-content>
    </cy-window>
  </div>
</template>
<script>
import { StatBase, RestrictionStat } from '@/lib/Character/Stat';
import { CharacterEquipment } from '@/lib/Character/CharacterEquipment';

export default {
  RegisterLang: 'Character Simulator',
  inject: ['isElementStat', 'setEquipmentProperty'],
  props: {
    'equipment': {
      type: CharacterEquipment,
    },
  },
  data() {
    const stats = [], statTypes = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    this.$store.state.datas.Character.statList
      .filter(stat => !stat.attributes.hidden)
      .forEach(stat => {
        statTypes
          .filter(type => !(type === StatBase.TYPE_MULTIPLIER && !stat.hasMultiplier))
          .forEach(type => {
            stats.push({
              origin: stat,
              text: stat.title(type),
              type,
            });
          });
      });

    return {
      searchText: '',
      selectStatWindowVisible: false,
      selectStatDetailVisible: false,
      stats,
      appendedStats: [],
      deletedStats: [],
      ranges: {
        stability: [0, 100],
        stat: [null, null],
        boolStat: [1, 1],
      },
    };
  },
  computed: {
    statsSearchResult() {
      if (this.searchText === '') {
        return this.elementFilterStats;
      }
      return this.elementFilterStats
        .filter(stat => stat.origin.title(stat.type).toLowerCase()
          .includes(this.searchText.toLowerCase()));
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
    cancelEquipmentSelection() {
      const { deletedStats, appendedStats } = this;
      this.deletedStats = [];
      this.appendedStats = [];
      this.$notify(this.$lang('Warn/create custom equipment editor: selected stats clear'),
        'ic-round-done', null, {
          buttons: [{
            text: this.$rootLang('global/recovery'),
            click: () => {
              this.deletedStats = deletedStats;
              this.appendedStats = appendedStats;
            },
            removeMessageAfterClick: true,
          }],
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
        const stat = RestrictionStat.from(p.origin.createStat(p.type, v));
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
            this.$notify(this.$lang('custom equipment editor/equipment can only have one element stat'),
              null, 'equipment can only have one element stat');
          } else {
            this.appendedStats.push(stat);
          }
        }
      }
    },
    setStatValue(stat, v) {
      stat.value = v;
    },
    toggleWindowVisible(target, force) {
      target = target + 'Window';
      this.toggleVisible(target, force);
    },
    toggleVisible(target, force) {
      target = target + 'Visible';
      force = force === undefined ? !this[target] : force;
      this[target] = force;
    },
  },
};
</script>
<style lang="less" scoped>
.bottom-content {
  ::v-deep(.top) {
    cursor: pointer;
  }
}

.main--custom-equipment-editor {
  padding: 0.2rem 0;
  > .content {
    margin-bottom: 0.8rem;
    margin-top: 0.3rem;
  }
}

.set-stat-value {
  --input-width: 2.6rem;
  margin-bottom: 0.6rem;
}
</style>
