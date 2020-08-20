<template>
  <div>
    <div class="stats">
      <cy-input-counter v-for="stat in equipment.stats"
        :value="stat.statValue()"
        @set-value="setStatValue(stat, $event)">
        <template v-slot:title>
          <cy-icon-text iconify-name="mdi-rhombus-outline">
            {{ stat.show() }}
          </cy-icon-text>
        </template>
      </cy-input-counter>
      <cy-button iconify-name="ic-round-add" type="border"
        @click="toggleSelectStatWindowVisble()">
        {{ langText('custom equipment editor/select stat: window title') }}
      </cy-button>
    </div>
    <cy-window>
      <template v-slot:title>
        <cy-icon-text iconify-name="mdi-rhombus-outline">
          {{ langText('custom equipment editor/select stat: window title') }}
        </cy-icon-text>
      </template>
      <cy-title-input iconify-name="ic-outline-category" class="search-stat-input">
        <input type="text"
          ref="stat-search-input"
          :placeholder="langText('custom equipment editor/select stat: search placeholder')"
          @input="updateStatSearchResult" />
      </cy-title-input>
      <template v-if="statsSearchResult.length != 0">
        <cy-list-item v-for="stat in statsSearchResult"
          :key="`${stat.origin.baseName}-${stat.type.description}`"
          :selected="stat == currentStat"
          @click="selectStat(stat)">
          <cy-icon-text iconify-name="mdi-rhombus-outline">
            {{ stat.text }}
          </cy-icon-text>
        </cy-list-item>
      </template>
    </cy-window>
  </div>
</template>
<script>
import Grimoire from "@Grimoire";

export default {
  props: ['equipment'],
  data() {
    const stats = [], statTypes = [StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER];
    Grimoire.CharacterSystem.statList.forEach(stat => {
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
      statsSearchResult: [],
      stats
    }
  },
  methods: {
    setStatValue(stat, v) {
      stat.statValue(v);
    },
    updateStatSearchResult() {
      const searchText = this.$refs['stat-search-input'];
      if (searchText == '') {
        this.statsSearchResult = this.stats;
        return;
      }
      const res = this.stats
        .filter(stat => {
          return this.equipment.stats
            .find(p => p.baseName() == stat.origin.baseName && p.type == stat.type)
            && stat.origin.title().includes(searchText);
        });
      this.statsSearchResult = res;
    }
  }
}
</script>