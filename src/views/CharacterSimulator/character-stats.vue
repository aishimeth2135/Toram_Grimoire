<template>
  <section>
    <div class="character-stat-categorys">
      <div v-for="data in showCharacterStatDatas" class="category" :key="data.name">
        <div class="title">{{ data.name }}</div>
        <div class="stats">
          <span v-for="stat in data.stats" :key="stat.id" class="stat-scope"
            @mouseenter="showStatDetail($event, stat)"
            @mouseleave="clearStatDetail">
            <template v-if="!stat.origin.isBoolStat">
              <span class="name">{{ stat.name }}</span>
              <span class="value">{{ stat.displayValue }}</span>
            </template>
            <span v-else class="value">{{ stat.name }}</span>
          </span>
        </div>
      </div>
    </div>
    <cy-detail-window v-if="detail.currentStat" :position-element="detail.positionElement">
      <template #title>
        <cy-icon-text iconify-name="mdi-ghost" text-color="purple">
          {{ detail.currentStat.name }}
        </cy-icon-text>
      </template>
      <div v-if="showStatDetailCaption" class="stat-detail-caption"
        v-html="showStatDetailCaption">
      </div>
      <div v-for="data in showStatDetailDatas" :key="data.iid" class="stat-detail-scope">
        <cy-icon-text v-if="typeof data.title != 'object'"
          iconify-name="gg-shape-rhombus" class="title">
          {{ data.title }}
        </cy-icon-text>
        <cy-icon-text v-else iconify-name="gg-shape-rhombus" class="title">
          <span class="text">{{ data.title.text }}</span>
          <span class="value">{{ data.title.value }}</span>
        </cy-icon-text>
        <div v-if="data.lines.length != 0" class="additinal-values">
          <div v-for="line in data.lines" :key="'line' + line.iid" class="line">
            <cy-icon-text iconify-name="ic-round-add" text-size="small">
              <template v-for="t in line.texts">
                <cy-icon-text v-if="t.text == '+'" :key="'text-i-' + t.iid"
                  iconify-name="ic-round-add" />
                <cy-icon-text v-else-if="t.text == '/'" :key="'text-i-' + t.iid"
                  iconify-name="mdi-slash-forward" />
                <span v-else-if="t.text == '(' || t.text == ')'" :key="'separate-' + t.iid"
                  class="separate" />
                <span class="part" v-else :key="'text-' + t.iid">
                  {{ t.text }}
                </span>
              </template>
            </cy-icon-text>
            <span class="value">{{ line.value }}</span>
          </div>
        </div>
      </div>
    </cy-detail-window>
  </section>
</template>
<script>
import StatBase from "@lib/CharacterSystem/module/StatBase.js";
export default {
  props: ['characterState', 'showCharacterStatDatas'],
  inject: ['langText'],
  data() {
    return {
      detail: {
        positionElement: null,
        currentStat: null
      }
    };
  },
  computed: {
    showStatDetailCaption() {
      if (!this.detail.currentStat)
        return '';
      return this.detail.currentStat.origin.caption
        .replace(/\(\(([^)]+)\)\)/g, (m, m1) => `<span class="separate-scope">${m1}</span>`);
    },
    showStatDetailDatas() {
      if (!this.detail.currentStat)
        return [];
      const vFix = v => v.toString()
         .replace(/^(-?\d+\.)(\d{3,})$/, (m, m1, m2) => m1 + m2.slice(0, 3));

      const stat = this.detail.currentStat;
      const base = stat.origin.linkedStatBase;
      const types = [null, StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER, StatBase.TYPE_TOTAL];

      const list = (base ? ['base', 'constant', 'multiplier', 'total'] : ['base'])
        .map((p, i) => ({
          type: types[i],
          id: p
        }));

      return list.filter(item => item.id == 'base' || stat.statValueParts[item.id] != 0)
      .map((item, i) => {
        const p = item.id,
          type = item.type;
        const v = stat.statValueParts[p];
        let title = p != 'base' ? base.show(type, v) : {
          text: this.localLangText('base value'),
          value: stat.resultValue
        };
        if (p == 'multiplier')
          title += '｜' + Math.floor(v * stat.statValueParts['base'] / 100).toString();

        const lines = [];
        const adds = stat.statPartsDetail.additionalValues[p];
        if (adds.length != 0) {
          lines.push({
            texts: [{ iid: -1, text: this.localLangText('init value') }],
            value: vFix(stat.statPartsDetail.initValue[p]),
            iid: 0
          });
          lines.push(...adds.map((p, i) => ({
            iid: i + 1,
            texts: this.handleConditional(p.conditional),
            value: (p.value > 0 ? '+' : '') + vFix(p.value)
          })));
        }

        return {
          iid: i,
          title,
          lines
        };
      });
    }
  },
  methods: {
    handleConditional(str) {
      str = str
        .replace(/\s+/g, '')
        .replace(/(?:&&|\|\|)#[cmt]value/g, '')
        .replace(/#[cmt]value(?:&&|\|\|)/g, '')
        .replace(/@([a-zA-Z._]+)/g, (m, m1) => {
          m1 = m1.replace(/\./g, '/');
          return this.localLangText('text of conditional values/' + m1) + ',';
        })
        .replace(/&&|\|\|/g, m => m == '&&' ? '+,' : '/,')
        .replace(/\(|\)/g, m => m + ',')
        .replace(/^\((.+)\)$/, (m, m1) => m1);

      // slice(0, -1)去掉尾端的","
      return str.slice(0, -1)
        .split(',')
        .map((p, i) => ({
          iid: i,
          text: p
        }));
    },
    showStatDetail(e, stat) {
      this.detail.positionElement = e.target;
      this.detail.currentStat = stat;
    },
    clearStatDetail() {
      this.detail.currentStat = null;
    },
    localLangText(v, vs) {
      return this.langText('show character stats/' + v, vs);
    }
  }
}
</script>
<style lang="less" scoped>
@deep: ~'>>>';

.character-stat-categorys {
  > .category {
    padding: 0 0.6rem;
    margin-bottom: 1.2rem;

    > .title {
      border-bottom: 1px solid var(--primary-light);
      padding-bottom: 0.1rem;
      padding-left: 0.3rem;
      font-size: 0.9rem;
      color: var(--primary-purple);
    }

    > .stats {
      > .stat-scope {
        padding: 0.2rem 0.6rem;
        border-bottom: 1px solid var(--primary-light-2);
        margin: 0.3rem;
        display: inline-block;

        > .name {
          margin-right: 0.4rem;
        }

        > .value {
          color: var(--primary-light-4);
        }
      }
    }
  }
}

.stat-detail-caption {
  font-size: 0.9rem;
  margin-bottom: 0.6rem;
  padding-left: 0.4rem;

  @{deep} .separate-scope {
    border-left: 1px solid var(--primary-light-2);
    border-right: 1px solid var(--primary-light-2);
    padding: 0 0.4rem;
    margin: 0 0.4rem;
    color: var(--primary-light-3);
  }
}

.stat-detail-scope {
  margin-top: 0.3rem;

  > .title {
    @{deep} .value {
      margin-left: 0.3rem;
      color: var(--primary-light-3);
    }
  }

  > .additinal-values {
    padding-left: 0.6rem;
    margin-top: 0.1rem;
    padding-bottom: 0.2rem;

    > .line {
      display: flex;
      align-items: center;

      > .value {
        font-size: 0.9rem;
        color: var(--primary-light-3);
        margin-left: 0.3rem;
      }
    }
  }

  .separate {
    border-left: 1px solid var(--primary-light-2);
    display: inline-block;
    height: 1.2rem;
    margin: 0 0.4rem;
  }
}
</style>