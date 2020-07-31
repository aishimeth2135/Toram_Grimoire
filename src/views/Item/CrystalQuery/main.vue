<template>
  <article>
    <div class="main">
      <div class="top">
        <div class="top-title">
          <cy-icon-text iconify-name="ic-outline-search" class="text-small">
            {{ langText('search title') }}
          </cy-icon-text>
        </div>
        <cy-title-input iconify-name="ic-outline-category" class="search-input">
          <input type="text"
            :placeholder="langText('search placeholder')"
            @input="updateSearchResult($event)" />
<!--           <cy-button iconify-name="bx-bx-search-alt-2" type="icon-only"
            @click="updateSearchResult" class="inline" /> -->
        </cy-title-input>
      </div>
      <div class="crystals">
        <template v-if="searchResult.length != 0">
          <cy-button v-for="category in searchResult" :key="category.id"
            iconify-name="bx-bx-cube-alt" type="drop-down"
            :menu-default-visible="true">
            {{ langText('category title')[category.id] }}
            <template v-slot:menu>
              <cy-button v-for="(c) in category.crystals" :key="c.id"
                type="line" class="no-border"
                iconify-name="bx-bx-cube-alt"
                @click="selectCrystal(c)">
                {{ c.name }}
              </cy-button>
            </template>
          </cy-button>
        </template>
        <cy-default-tips v-else iconify-name="bx-bx-message-rounded-x">
          {{ langText('no result tips') }}
        </cy-default-tips>
      </div>
      <div class="detail-container" v-if="currentCrystal">
        <div class="detail">
          <div class="title">
            <cy-icon-text iconify-name="bx-bx-cube-alt">
              {{ currentCrystal.name }}
            </cy-icon-text>
          </div>
          <div class="stats">
            <span v-for="stat in currentCrystal.stats"
              :key="stat.baseName()" class="stat-scope">
              <cy-icon-text iconify-name="mdi-leaf">{{ stat.show() }}</cy-icon-text>
            </span>
          </div>
        </div>
      </div>
    </div>
  </article>
</template>
<script>
import GetLang from "@global-modules/LanguageSystem.js";
import Grimoire from "@Grimoire";

import init from "./init.js";

export default {
  data() {
    const crystalCategorys = new Array(5).fill().map((p, i) => {
      return {
        id: i,
        crystals: Grimoire.ItemSystem.items.crystals.filter(a => a.category == i)
      }
    });
    return {
      crystalCategorys,
      searchResult: crystalCategorys,
      currentCrystal: null
    };
  },
  methods: {
    updateSearchResult(e) {
      const v = e.target.value.toLowerCase();
      if (v == '')
        this.searchResult = this.crystalCategorys;
      const res = [];
      this.crystalCategorys.forEach(cat => {
        const t = cat.crystals.filter(c => c.name.toLowerCase().includes(v));
        if (t.length != 0)
          res.push({
            id: cat.id,
            crystals: t
          });
      });
      this.searchResult = res;
    },
    selectCrystal(crystal) {
      this.currentCrystal = crystal;
    },
    langText(v, vs) {
      return GetLang('Crystal Query/' + v, vs);
    }
  },
  beforeCreate() {
    init();
  }
};
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';

.top-title {
  color: var(--primary-purple);
  margin-bottom: 0.3rem;
}

.top {
  margin-bottom: 1rem;
  padding: 1rem;
  border: 0.1rem solid var(--primary-light);
}

.detail-container {
  display: flex;
  position: sticky;
  bottom: 0;
  margin-right: 0.6rem;
  background-color: var(--white);
  border-top: 1px solid var(--primary-light-2);

  > .detail {
    //margin-left: auto;
    padding: 1rem;
    // border: 0.1rem solid var(--primary-light-2);
    // background-color: var(--white);

    > .title {
      margin-bottom: 0.4rem;
      color: var(--primary-purple);
    }
    > .stats {
      padding-left: 0.3rem;
    }
  }
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
</style>