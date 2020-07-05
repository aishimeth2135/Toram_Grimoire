<template>
  <article>
    <div class="app--tmp--EnchantSimulator" ref="temp-main"></div>
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
    Grimoire.EnchantSystem.init_EnchantSimulator(this.$refs['temp-main']);
  }
};
</script>
<style lang="less">
.app--tmp--EnchantSimulator {
  .enchant-equipment {
    > .top-menu > .field-menu {
        list-style: none;
        padding: 0 0.3rem;
        margin: 0;
        display: inline-block;
        margin-right: 1rem;
    }
    > .top-menu {
        margin-bottom: 1rem;
        padding: 0 0.4rem;
        display: flex;
        flex-wrap: wrap;
        align-items: center;
    }

    > .show-result-scope {
        display: flex;
        justify-content: center;
        padding: 1rem 0.6rem;
        border-top: 1px solid var(--primary-light);
        margin-top: 1rem;
    }
    .show-result-content {
        clear: both;
        padding: 0 0.6rem;
    }

    > .success-rate-scope {
        padding: 1rem 0.6rem;
        border-top: 1px solid var(--primary-light);
        text-align: right;
        position: sticky;
        background-color: var(--white);
        bottom: 0;
    }


    > .steps {
        display: flex;
        justify-content: center;
        align-content: flex-start;
        align-items: flex-start;
        flex-wrap: wrap;
    }
    > .steps > .create-step {
        width: 21rem;
        height: 12rem;
        align-items: center;
        justify-content: center;
        border: 1px solid var(--primary-light-2);
        cursor: pointer;
        transition: 0.3s;
        margin: 0.4rem;
        display: flex;
    }
    > .steps > .create-step:hover {
        border-color: var(--primary-light-4);
    }
    > .steps > .create-step:hover > span > svg {
        color: var(--primary-light-4);
    }
    > .steps > .create-step > span > svg {
        width: 3rem;
        height: 3rem;
        transition: 0.3s;
        color: var(--primary-light-2);
        fill: currentcolor;
    }

    /* ==========================================================================
       step scope
       ========================================================================== */
    .step-scope {
        border: 1px solid var(--primary-light-3);
        padding: 0.8rem;
        width: 21rem;
        margin: 0.4rem;
    }
    .step-scope.is-hidden {
        border-color: var(--primary-gray);
        background-color: var(--primary-light);
    }
    .step-scope > .top {
        margin-bottom: 0.3rem;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
    }
    .step-scope > .top .title {
        color: var(--primary-purple);
    }

    .step-scope.last-step {
        border-color: var(--primary-water-blue);
    }
    .step-scope.last-step > .top .title {
        color: var(--primary-water-blue);
    }
    .step-scope.last-step > .top svg,
    .step-scope.last-step > .extra-menu svg {
        color: var(--primary-water-blue-light);
    }
    .step-scope.after-last-step {
        border-color: var(--primary-water-blue-light);
    }
    .step-scope.after-last-step > .top .title {
        color: var(--primary-gray);
    }
    .step-scope.after-last-step > .top svg,
    .step-scope.after-last-step > .extra-menu svg {
        color: var(--primary-gray-light);
    }

    .step-scope > .step-type {
        padding: 0.6rem 0;
        border-top: 1px solid var(--primary-light);
        border-bottom: 1px solid var(--primary-light-2);
        display: flex;
        align-items: center;
    }

    .step-scope .type-each-set-scope {
        display: inline-flex;
    }

    .step-scope > .show-step-potential {
        padding: 0 0.4rem;
        padding-top: 0.6rem;
        justify-content: flex-end;
        border-top: 1px solid var(--primary-light-2);
    }

    /* ==========================================================================
       step stat
       ========================================================================== */
    .step-scope > .step-stats > .stat-scope {
        padding: 0.6rem 0;
        padding-bottom: 0.4rem;
    }
    .step-scope > .step-stats > .stat-scope + .stat-scope {
        border-top: 1px solid var(--primary-light);
    }
    .step-scope > .step-stats > .stat-scope.invalid {
        opacity: 0.6;
        background-color: var(--primary-light);
    }

    .step-scope > .step-stats > .stat-scope > .sub {
        padding-left: 0.6rem;
        margin-top: 0.4rem;
        font-size: 0.9rem;
    }
  }

  /* ==========================================================================
     ...
     ========================================================================== */
  .select-stat > .category-title {
      font-size: 0.9rem;
      padding: 0.3rem 0;
      color: var(--primary-light-4);
  }
  .select-stat > ul.category-items {
      list-style: none;
      padding: 0 0.3rem;
      margin: 0;
      margin-bottom: 1rem;
      position: relative;
  }
  .select-stat > ul.category-items.invalid {
      opacity: 0.6;
      background-color: var(--primary-light);
  }
}
/* ul.equipments-list {
    list-style: none;
    padding: 0 0.6rem;
    margin: 1rem 0;
    border-bottom: 1px var(--primary-light) solid;
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}
.equipments-list > .select-equipment {
    padding: 0.5rem 0.8rem;
    margin: 0;
    margin-bottom: -1px;
}
 */
</style>