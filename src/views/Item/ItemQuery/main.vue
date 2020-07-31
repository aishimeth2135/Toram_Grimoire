<template>
  <article>
    <div class="app--tmp--ItemQuery" ref="temp-main"></div>
  </article>
</template>
<script>
import Grimoire from "@Grimoire";
// import GetLang from "@global-modules/LanguageSystem.js";

import init from "./init.js";

export default {
  beforeCreate() {
    init();
  },
  mounted() {
    Grimoire.ItemSystem.searchController.init(this.$refs['temp-main']);
  }
};
</script>
<style lang="less">
.app--tmp--ItemQuery {
  .options-menu {
    list-style: none;
    padding: 0 0.6rem;
    margin: 1rem 0;
    border-bottom: 1px var(--primary-light) solid;

    >li {
      padding: 0.5rem 0.8rem;
      margin: 0;
      margin-bottom: -1px;
    }
  }

  >.options-scope {
    padding: 0 0.4rem;
  }
}

.app--tmp--ItemQuery .search-scope {
  display: inline-flex;
}

.app--tmp--ItemQuery .search-button-scope {
  width: 100%;
  margin-top: 0.4rem;
}

.app--tmp--ItemQuery .button-scope {
  margin: 1rem 0;

  >ul {
    list-style: none;
    padding: 0 0.4rem;
    margin: 0;
    margin-bottom: 0.8rem;
  }

  >.title-scope {
    padding: 0.2rem 0;

    >.title {
      color: var(--primary-light-4);
      vertical-align: middle;
      margin-right: 0.6rem;
    }
  }
}

.app--tmp--ItemQuery .options-stat>.stats-scope {
  padding: 0.6rem 0.2rem;
}

.app--tmp--ItemQuery .options-stat>.stats-scope>.stat>.sort {
  margin-right: 0;
  margin-left: 0.4rem;
}

.app--tmp--ItemQuery .options-stat>.stats-scope>.tips {
  padding: 1rem 0.6rem;
  color: var(--primary-light-4);
}

.app--tmp--ItemQuery .options-scope .tips-scope {
  padding: 0.6rem 0.2rem;
}

.app--tmp--ItemQuery .options-scope .tips-scope>.scope-icon {
  margin: 0 0.4rem;
}

.app--tmp--ItemQuery .options-scope .tips-scope>.scope-icon>svg {
  fill: var(--primary-light-4);
}

.app--tmp--ItemQuery>.result>.scope {
  margin: 0.2rem;
  border: 1px solid var(--primary-light);
  padding: 0.6rem;
  width: 20rem;
  display: inline-block;
  cursor: pointer;
}

@media screen and (max-width: 22rem) {
  .app--tmp--ItemQuery>.result>.scope {
    width: 100%;
  }
}

.app--tmp--ItemQuery>.result>.scope>.top>.name {
  color: var(--primary-purple);
}

.app--tmp--ItemQuery>.result>.scope>.sub>.category {
  color: var(--primary-light-4);
  margin-left: 0.3rem;
}

.app--tmp--ItemQuery>.result>.scope>.sub>.obtain {
  color: var(--primary-water-blue);
}

.app--tmp--ItemQuery>.result>.scope>.sub {
  text-align: right;
}

.app--tmp--ItemQuery>.result>.scope>.search-stat-scope {
  margin-top: 0.3rem;
  padding: 0.2rem 0;
  border-top: 1px solid var(--primary-light);
}

.app--tmp--ItemQuery>.result>.scope>.search-stat-scope>.search-stat {
  border-bottom: 1px solid var(--primary-light-3);
  padding: 0.1rem 0.3rem;
  margin: 0.2rem;
  display: inline-block;
  font-size: 0.9rem;
  color: var(--primary-light-4);
}

.app--tmp--ItemQuery>.result>.scope>.attribute-scope {
  margin-top: 0.3rem;
  padding: 0.2rem 0;
  border-top: 1px solid var(--primary-light);
}

.app--tmp--ItemQuery>.result>.scope>.attribute-scope>.attribute {
  border-bottom: 1px solid var(--primary-light-3);
  padding: 0.2rem 0.5rem;
  margin: 0.2rem;
  display: inline-block;
  font-size: 0.9rem;
}

.attribute-scope>.attribute>.title {
  margin-right: 0.4rem;
}

.attribute-scope>.attribute>.value {
  color: var(--primary-light-4);
}

.app--tmp--ItemQuery>.result {
  >.no-result {
    padding: 1rem;
  }
}

.app--tmp--ItemQuery>.detail>.contents>.scope-title {
  padding: 0.4rem 0.8rem;
  padding-bottom: 0.2rem;
  border-left: 2px solid var(--primary-light-3);
  color: var(--primary-light-4);
}

.app--tmp--ItemQuery>.detail>.contents>.scope {
  margin-bottom: 0.6rem;
  border-left: 2px solid var(--primary-light-3);
  padding: 0 0.8rem;
  padding-bottom: 0.4rem;
}

.app--tmp--ItemQuery>.detail>.contents>.scope-title>.value {
  color: var(--primary-purple);
}

.app--tmp--ItemQuery>.detail>.contents>.stats>span {
  border-bottom: 1px solid var(--primary-light-3);
  padding: 0.2rem 0.5rem;
  margin: 0.2rem;
  display: inline-block;
  color: var(--primary-light-4);
}

.app--tmp--ItemQuery>.detail>.contents>.stats>span>.restriction {
  padding: 0rem 0.2rem;
  margin-left: 0.2rem;
  color: var(--primary-water-blue);
  font-size: 0.9rem;
  display: inline-block;
}

.app--tmp--ItemQuery>.detail>.contents td {
  padding: 0.1rem 0.6rem;
}

.app--tmp--ItemQuery>.detail>.contents td.title {
  text-align: right;
  border-right: 1px solid var(--primary-light-2);
}

.app--tmp--ItemQuery>.detail>.contents td.value {
  text-align: left;
  color: var(--primary-light-4);
}

.app--tmp--ItemQuery>.detail .obtain-scope {
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--primary-light);
}

.app--tmp--ItemQuery>.detail .obtain-scope>.title {
  margin-bottom: 0.3rem;
}

.app--tmp--ItemQuery>.detail .obtain-scope>.title>.type {
  font-size: 0.9rem;
  color: var(--primary-light);
  margin-right: 0.4rem;
}

.app--tmp--ItemQuery>.detail .obtain-scope>.title>.name {
  color: var(--primary-purple);
}

.app--tmp--ItemQuery>.detail .obtain-scope>.info-line {
  margin-top: 0.1rem;
  padding: 0 0.3rem;
}

.app--tmp--ItemQuery>.detail .obtain-scope>.info-line>.text {
  color: var(--primary-light-4);
  font-size: 0.9rem;
}

.app--tmp--ItemQuery>.detail .obtain-scope>.info-line>svg {
  width: 0.9rem;
  height: 0.9rem;
}

.app--tmp--ItemQuery>.detail>.contents>.obtains>.no-data {
  padding: 0.5rem;
  font-size: 0.9rem
}
</style>