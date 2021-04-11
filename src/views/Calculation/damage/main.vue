<template>
  <article>
    <div ref="temp-main" class="app--tmp--Calculation-Damage">
    </div>
  </article>
</template>
<script>
// import GetLang from "@Services/Language";

import init from "./init.js";

import DamageCalculationController from "@lib/Calculation/Damage/module/Controller.js";

export default {
  beforeCreate() {
    init();
  },
  mounted() {
    new DamageCalculationController().init(this.$refs['temp-main']);
  }
};
</script>
<style lang="less">
.app--tmp--Calculation-Damage.window {
    width: 40rem;
}
@media screen and (max-width: 41rem) {
    .app--tmp--Calculation-Damage.window {
        width: calc(100% - 1rem);
    }
}

.app--tmp--Calculation-Damage span.for-adjust-input-width {
    position: absolute;
    height: 0;
    white-space: pre;
    overflow: hidden;
}

.app--tmp--Calculation-Damage > .calculations {
    margin-bottom: 1rem;
}

.app--tmp--Calculation-Damage > .show-container-tips > .content > .text-scope {
    border-left: 3px solid var(--primary-light-4);
    padding: 0.4rem 0.6rem;
    margin: 0.4rem 0;
    padding-left: 1rem;
}

.app--tmp--Calculation-Damage .result-scope {
    padding: 1rem 0.6rem;
    border-top: 1px solid var(--primary-light);
    background-color: var(--white);
    display: flex;
    align-items: center;
    flex-wrap: wrap;
}
.app--tmp--Calculation-Damage .result-scope.frozen {
    position: sticky;
    bottom: 0;
}
.app--tmp--Calculation-Damage .result-scope > .scope {
    margin-right: 1rem;
    display: inline-flex;
    align-items: center;
}
.app--tmp--Calculation-Damage .damage.result-scope > .scope > .comparative-damage {
    color: var(--primary-purple);
}
.app--tmp--Calculation-Damage .damage.result-scope > .scope > .comparative-result {
    color: var(--primary-light-4);
}
.app--tmp--Calculation-Damage .damage.result-scope > .scope > .comparative-result-icon {
    margin-right: 0.1rem;
}
.app--tmp--Calculation-Damage .damage.result-scope > .scope > .down {
    color: var(--primary-water-blue);
}
.app--tmp--Calculation-Damage .damage.result-scope > .scope > .down > svg {
    fill: var(--primary-water-blue);
}

.app--tmp--Calculation-Damage .calculation > .calculation-top-scope {
    padding: 0.6rem;
    padding-top: 0;
}

.app--tmp--Calculation-Damage .calculation-menu {
    display: inline-block;
    margin-top: 0.6rem;
    margin-left: 0.6rem;
}

.app--tmp--Calculation-Damage .calculation-name {
    position: relative;
    display: inline-block;
}
.app--tmp--Calculation-Damage .calculation-name > .icon {
    left: 0.4rem;
    top: 0.4rem;
    position: absolute;
}
.app--tmp--Calculation-Damage .calculation-name > .icon > svg {
    fill: var(--primary-light);
}
.app--tmp--Calculation-Damage .calculation-name > input {
    padding: 0.5rem;
    border: 0;
    border-bottom: 1px solid var(--primary-light);
    transition: 0.3s;
    font-size: 1rem;
    width: 20rem;
    padding-left: 2.7rem;
    display: flex;
}
.app--tmp--Calculation-Damage .calculation-name > input:focus {
    border-bottom-color: var(--primary-light-3);
}

.app--tmp--Calculation-Damage .calculation > .sets {
    padding: 1rem 0.6rem;
}
.app--tmp--Calculation-Damage .calculation > .sets > .set-scope {
    display: inline-block;
    margin: 0.2rem 0.3rem;
    border-bottom: 1px solid var(--primary-light-4);
    padding: 0.2rem 0.3rem;
}
.app--tmp--Calculation-Damage .calculation > .sets > .set-scope > .text {
    margin-right: 0.6rem;
}
.app--tmp--Calculation-Damage .calculation > .sets > .set-scope > input {
    width: 2.5rem;
    border: 0;
    text-align: center;
}

.app--tmp--Calculation-Damage .containers {
    padding: 0 0.4rem;
}
.app--tmp--Calculation-Damage .item-container {
    margin-bottom: 0.6rem;
}
.app--tmp--Calculation-Damage .item-container > .title-scope {
    padding: 0.2rem 0;
    display: flex;
    align-items: center;
}
.app--tmp--Calculation-Damage .item-container > .title-scope > .title {
    color: var(--primary-light-4);
    vertical-align: middle;
    transition: 0.3s;
    border-bottom: 1px solid transparent;
    padding: 0.2rem 0;
}
.app--tmp--Calculation-Damage .item-container > .title-scope > .title.clickable {
    cursor: pointer;
}
.app--tmp--Calculation-Damage .item-container > .title-scope > .title.clickable:hover {
    border-bottom-color: var(--primary-light-4);
    color: var(--primary-light-4);
}
.app--tmp--Calculation-Damage .item-container.invalid > .title-scope > .title {
    color: var(--primary-light-2);
    transition: 0.3s;
}

.app--tmp--Calculation-Damage .item-container > .items {
    padding: 0 0.4rem;
}
.app--tmp--Calculation-Damage .calc-item {
    margin: 0.3rem;
    display: inline-block;
    position: relative;
}
.app--tmp--Calculation-Damage .calc-item.clickable {
    cursor: pointer;
}
.app--tmp--Calculation-Damage .item-container.invalid > .items > .calc-item {
    opacity: 0.6;
}
.app--tmp--Calculation-Damage .calc-item.invalid > .item-text {
    color: var(--primary-light-2);
}
.app--tmp--Calculation-Damage .calc-item > .item-text {
    position: absolute;
    line-height: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
    left: 0.5rem;
    color: var(--primary-purple);
    transition: 0.3s;
}
.app--tmp--Calculation-Damage .calc-item.invalid > .item-text > .light {
    color: var(--primary-light-2);
}
.app--tmp--Calculation-Damage .calc-item > input {
    box-sizing: content-box;
    padding: 0.3rem 0.5rem;
    padding-right: 0.8rem;
    text-align: right;
    max-width: 3rem;
    min-width: 1rem;
}

.app--tmp--Calculation-Damage .calc-item.text-only > .item-text {
    line-height: 1.25rem;
    padding: 0.3rem 0.5rem;
    border-bottom: 1px solid var(--primary-light-4);
    color: var(--primary-purple);
    position: static;
    transform: none;
}
.app--tmp--Calculation-Damage .calc-item.text-only.invalid:hover > .item-text {
    color: var(--primary-purple);
}
.app--tmp--Calculation-Damage .calc-item.text-only.invalid > .item-text {
    border-bottom-color: var(--primary-light-2);
    color: var(--primary-light-2);
}

.app--tmp--Calculation-Damage .calc-item > .item-unit {
    color: var(--primary-light-4);
    margin-left: 0.1rem;
    position: absolute;
    right: 0;
    line-height: 1.25rem;
    top: 50%;
    transform: translateY(-50%);
}


</style>