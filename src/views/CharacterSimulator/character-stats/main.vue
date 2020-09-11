<template>
  <section>
    <div class="character-stat-categorys" @touchstart.prevent="clearStatDetail">
      <div v-for="data in showCharacterStatDatas" class="category" :key="data.name">
        <div class="title">{{ data.name }}</div>
        <div class="stats">
          <span v-for="stat in data.stats" :key="stat.id" class="stat-scope"
            @mouseenter="showStatDetail($event, stat)"
            @mouseleave="clearStatDetail"
            @touchstart.prevent.stop="toggleShowStatDetail($event, stat)"
            @touchend.prevent.stop>
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
      <cy-icon-text v-if="showStatDetailDatas.conditionalBase"
        iconify-name="mdi-sword">
        <stat-detail-equipments :equipment-texts="showStatDetailDatas.conditionalBase.title.equipments" />
      </cy-icon-text>
      <div v-for="data in showStatDetailDatas.datas" :key="data.iid" class="stat-detail-scope">
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
            <cy-icon-text v-if="typeof line.title == 'string'"
              iconify-name="ic-round-add" text-size="small">
              {{ line.title }}
            </cy-icon-text>
            <cy-icon-text v-else iconify-name="ic-round-add" text-size="small">
              <stat-detail-equipments v-if="line.title.equipments.length != 0"
                class="detail-line-captions-pre"
                :equipment-texts="line.title.equipments" />
              <span class="detail-line-captions">
                <span v-for="caption in line.title.captions" :key="caption.iid" class="caption">
                  {{ caption.text }}
                </span>
              </span>
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

import vue_statDetailEquipments from "./stat-detail-equipments.vue";

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
         .replace(/^(-?\d+\.)(\d{3,})$/, (m, m1, m2) => m1 + m2.slice(0, 3))
         .replace(/^(-?\d+)(\.0+)$/, (m, m1) => m1);

      const stat = this.detail.currentStat;
      const base = stat.origin.linkedStatBase;
      const types = [null, StatBase.TYPE_CONSTANT, StatBase.TYPE_MULTIPLIER, StatBase.TYPE_TOTAL];

      const list = (base ? ['base', 'constant', 'multiplier', 'total'] : ['base'])
        .map((p, i) => ({
          type: types[i],
          id: p
        }));

      const conditionalBase = stat.conditionalBase ? {
          title: this.handleConditional(stat.conditionalBase)
        } : null;
      const datas = list
        .filter(item => item.id == 'base' || stat.statValueParts[item.id] != 0)
        .map((item, i) => {
          const p = item.id,
            type = item.type;
          const v = stat.statValueParts[p];
          let title = p != 'base' ? base.show(type, v) : {
            text: this.localLangText('base value'),
            value: vFix(stat.statValueParts['base'])
          };
          if (p == 'multiplier')
            title += '｜' + Math.floor(v * stat.statValueParts['base'] / 100).toString();

          const lines = [];
          const adds = stat.statPartsDetail.additionalValues[p].filter(p => p.value != 0);
          if (adds.length != 0) {
            const initValue = {
              title: this.localLangText('init value'),
              value: vFix(stat.statPartsDetail.initValue[p]),
              iid: 0
            };
            let hasInit = false;
            if (initValue.value != 0) {
              lines.push(initValue);
              hasInit = true;
            }
            const t = adds
              .sort(p => p.isMul ? 1 : -1)
              .map((p, i) => {
                let value = 0;
                if (p.isMul) {
                  value = p.value > 0 ? `×${vFix(p.value)}` : `×(${vFix(p.value)})`;
                } else {
                  value = (p.value > 0 && hasInit ? '+' : '') + vFix(p.value);
                  if (!hasInit)
                    hasInit = true;
                }
                return {
                  iid: i + 1,
                  title: this.handleConditional(p),
                  value
                };
              });
            lines.push(...t);
          }

          if (conditionalBase) {
            const ceqs = conditionalBase.title.equipments;
            lines.forEach(p => {
              if (typeof p.title == 'string')
                return;
              const eqs = p.title.equipments;
              eqs.forEach((text, i) => {
                if (eqs.length - i < ceqs.length)
                  return;
                if (ceqs.every((p, j) => p.text == eqs[i+j].text))
                  eqs.splice(i, ceqs.length);
              });
            });
          }

          return {
            iid: i,
            title,
            lines
          };
        });

      return {
        datas,
        conditionalBase
      };
    }
  },
  methods: {
    handleConditional(conditionObj) {
      const captions = [];
      conditionObj.options.forEach(p => {
        const m = p.match(/^"([^"]+)"$/);
        m && captions.push({
          iid: captions.length,
          text: m[1]
        });
      });

      let str = conditionObj.conditional;
      if (str == '#') {
        str = captions.length == 0 ? [this.localLangText('additional value')] : [];
      } else {
        str = str.replace(/\s+/g, '')
          .replace(/(?:&&|\|\|)#[a-zA-Z0-9._]+/g, '')
          .replace(/#[a-zA-Z0-9._]+(?:&&|\|\|)/g, '')
          .replace(/@([a-zA-Z0-9._]+)/g, (m, m1) => {
            m1 = m1.replace(/\./g, '/');
            return this.localLangText('text of conditional values/' + m1) + ',';
          })
          .replace(/&&|\|\|/g, m => m == '&&' ? '+,' : '/,')
          .replace(/\(|\)/g, m => m + ',')
          .replace(/^\(([^)]+)\)$/, (m, m1) => m1);

        str = str.split(',');
        if (str[str.length - 1] == '')
          str = str.slice(0, -1);
      }

      const equipments = str.map((p, i) => ({
        iid: i,
        text: p
      }));

      return {
        equipments,
        captions
      };
    },
    toggleShowStatDetail(e, stat) {
      if (this.detail.currentStat) {
        this.detail.currentStat != stat ?
          this.showStatDetail(e, stat) :
          this.clearStatDetail();
      }
      else {
        this.showStatDetail(e, stat);
      }
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
  },
  components: {
    'stat-detail-equipments': vue_statDetailEquipments
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

.detail-line-captions {
  > .caption {
    & + & {
      margin-left: 0.3rem;
    }
  }
}
.detail-line-captions-pre + .detail-line-captions {
  margin-left: 0.3rem;
}
</style>