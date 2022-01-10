<template>
  <section>
    <div
      @touchstart="toggleShowStatDetailDisplay('visible', false, true)"
      @click="toggleShowStatDetailDisplay('visible', false)"
    >
      <div
        v-for="data in showCharacterStatDatas"
        :key="data.name"
        class="px-2 mb-4"
      >
        <fieldset class="border-t border-solid border-light">
          <legend class="py-0 px-2 ml-3">
            <cy-icon-text
              icon="mdi-creation"
              text-color="purple"
              size="small"
            >
              {{ data.name }}
            </cy-icon-text>
          </legend>
        </fieldset>
        <div class="pl-4">
          <span
            v-for="stat in data.stats"
            :key="stat.id"
            class="stat-scope px-2 mx-2 my-1 inline-flex cursor-pointer relative border-b border-solid border-light"
            @mouseenter="toggleShowStatDetailDisplay('hovering', true) && setStatDetail($event, stat)"
            @mouseleave="toggleShowStatDetailDisplay('hovering', false)"
            @click.stop="toggleShowStatDetailDisplay('visible') && setStatDetail($event, stat)"
            @touchstart.prevent.stop="toggleShowStatDetailDisplay('visible', detail.currentStat != stat) && setStatDetail($event, stat)"
            @touchend.prevent.stop
          >
            <template v-if="!stat.origin.isBoolStat">
              <span class="mr-3">{{ stat.name }}</span>
              <span class="text-light-4">{{ stat.displayValue }}</span>
            </template>
            <span v-else class="text-light-4">{{ stat.name }}</span>
          </span>
        </div>
      </div>
    </div>
    <cy-detail-window
      v-if="detail.visible || detail.hovering"
      :position-element="detail.positionElement"
      @click.stop="toggleShowStatDetailDisplay('visible', false)"
    >
      <template #title>
        <div class="flex items-center mb-3">
          <cy-icon-text icon="mdi-ghost" text-color="purple">
            {{ detail.currentStat.name }}
          </cy-icon-text>
          <div v-if="detail.visible" class="ml-auto">
            <cy-icon-text
              icon="ic-round-close"
              text-color="light-3"
              size="small"
              class="ml-4"
            >
              {{ $lang('Click anywhere to close') }}
            </cy-icon-text>
          </div>
        </div>
      </template>
      <div
        v-if="showStatDetailCaption"
        class="stat-detail-caption text-sm mb-3 pl-2"
        v-html="showStatDetailCaption"
      />
      <cy-icon-text
        v-if="showStatDetailDatas.conditionalBase"
        icon="mdi-sword"
      >
        <stat-detail-equipments :equipment-texts="showStatDetailDatas.conditionalBase.title.equipments" />
      </cy-icon-text>
      <div
        v-for="data in showStatDetailDatas.datas"
        :key="data.iid"
        class="mt-1"
      >
        <cy-icon-text v-if="(typeof data.title !== 'object')">
          {{ data.title }}
        </cy-icon-text>
        <cy-icon-text v-else>
          <span>{{ data.title.text }}</span>
          <span class="ml-1 text-light-3">{{ data.title.value }}</span>
        </cy-icon-text>
        <div
          v-if="data.lines.length !== 0"
          class="pl-2 mt-0.5 pb-1"
        >
          <div
            v-for="line in data.lines"
            :key="'line' + line.iid"
            class="flex items-center"
          >
            <cy-icon-text
              v-if="typeof line.title == 'string'"
              icon="ic-round-add"
              size="small"
            >
              {{ line.title }}
            </cy-icon-text>
            <cy-icon-text v-else icon="ic-round-add" size="small">
              <stat-detail-equipments
                v-if="line.title.equipments.length != 0"
                :equipment-texts="line.title.equipments"
                class="mr-2"
              />
              <span>
                <span
                  v-for="(caption, i) in line.title.captions"
                  :key="caption.iid"
                  :class="{ 'mr-1': i !== line.title.captions.length - 1 }"
                >
                  {{ caption.text }}
                </span>
              </span>
            </cy-icon-text>
            <span class="text-sm text-light-3 ml-2">{{ line.value }}</span>
          </div>
        </div>
      </div>
    </cy-detail-window>
  </section>
</template>

<script>
import { StatTypes } from '@/lib/Character/Stat/enums';

import vue_statDetailEquipments from './stat-detail-equipments.vue';

export default {
  name: 'CharacterSimulatorCharacterStats',
  RegisterLang: {
    root: 'Character Simulator/show character stats',
  },
  components: {
    'stat-detail-equipments': vue_statDetailEquipments,
  },
  props: ['characterState', 'showCharacterStatDatas'],
  data() {
    return {
      detail: {
        positionElement: null,
        currentStat: null,
        visible: false,
        hovering: false,
      },
    };
  },
  computed: {
    showStatDetailCaption() {
      if (this.detail.currentStat) {
        return this.detail.currentStat.origin.caption
          .replace(/\(\(([^)]+)\)\)/g, (_, m1) => `<span class="separate-scope">${m1}</span>`);
      }
      return '';
    },
    showStatDetailDatas() {
      if (!this.detail.currentStat || this.detail.currentStat.origin.isBoolStat)
        return [];
      const vFix = v => v.toString()
        .replace(/^(-?\d+\.)(\d{3,})$/, (m, m1, m2) => m1 + m2.slice(0, 3))
        .replace(/^(-?\d+)(\.0+)$/, (m, m1) => m1);

      const stat = this.detail.currentStat;
      const base = stat.origin.linkedStatBase;
      const types = [null, StatTypes.Constant, StatTypes.Multiplier, StatTypes.Total];

      const list = (base ? ['base', 'constant', 'multiplier', 'total'] : ['base'])
        .map((p, i) => ({
          type: types[i],
          id: p,
        }));

      const conditionalBase = stat.conditionalBase ? {
        title: this.handleConditional(stat.conditionalBase),
      } : null;
      const datas = list
        .filter(item => item.id === 'base' || stat.statValueParts[item.id] !== 0)
        .map((item, itemIdx) => {
          const id = item.id,
            type = item.type;
          const v = stat.statValueParts[id];
          let title = id !== 'base' ? base.show(type, v) : {
            text: this.$lang('base value'),
            value: vFix(stat.statValueParts['base']),
          };
          if (id === 'multiplier')
            title += '｜' + Math.floor(v * stat.statValueParts['base'] / 100).toString();

          const isBase = id === 'base';

          const lines = [];
          const adds = stat.statPartsDetail.additionalValues[id].filter(p => p.value != 0);
          if (adds.length != 0) {
            const initValue = stat.statPartsDetail.initValue[id];
            let hasInit = false;
            if (initValue != 0) {
              lines.push({
                title: this.$lang('init value'),
                value: (id.value > 0 && !isBase ? '+' : '') + vFix(initValue),
                iid: 0,
              });
              hasInit = true;
            }
            const t = adds
              .sort(p => p.isMul ? 1 : -1)
              .map((p, i) => {
                let value = 0;
                if (p.isMul) {
                  value = p.value > 0 ? `×${vFix(p.value)}` : `×(${vFix(p.value)})`;
                } else {
                  value = (p.value > 0 && (hasInit || !isBase) ? '+' : '') + vFix(p.value);
                  if (!hasInit)
                    hasInit = true;
                }
                return {
                  iid: i + 1,
                  title: this.handleConditional(p),
                  value,
                };
              });
            lines.push(...t);
          }

          if (conditionalBase) {
            const ceqs = conditionalBase.title.equipments;
            lines.forEach(line => {
              if (typeof line.title === 'string')
                return;
              const eqs = line.title.equipments;
              eqs.forEach((text, i) => {
                if (eqs.length - i < ceqs.length)
                  return;
                if (ceqs.every((p, j) => p.text === eqs[i + j].text))
                  eqs.splice(i, ceqs.length);
              });
            });
          }

          return {
            iid: itemIdx,
            title,
            lines,
          };
        });

      return {
        datas,
        conditionalBase,
      };
    },
  },
  methods: {
    handleConditional(conditionObj) {
      const captions = [];
      conditionObj.options.forEach(p => {
        const m = p.match(/^"([^"]+)"$/);
        m && captions.push({
          iid: captions.length,
          text: m[1],
        });
      });

      let str = conditionObj.conditional;
      if (str === '#') {
        str = captions.length == 0 ? [this.$lang('additional value')] : [];
      } else {
        str = str.replace(/\s+/g, '')
          .replace(/(?:&&|\|\|)#[a-zA-Z0-9._]+/g, '')
          .replace(/#[a-zA-Z0-9._]+(?:&&|\|\|)/g, '')
          .replace(/@([a-zA-Z0-9._]+)/g, (m, m1) => {
            m1 = m1.replace(/\./g, '/');
            return this.$lang('text of conditional values/' + m1) + ',';
          })
          .replace(/&&|\|\|/g, m => m === '&&' ? '+,' : '/,')
          .replace(/\(|\)/g, m => m + ',')
          .replace(/^\(([^)]+)\)$/, (m, m1) => m1);

        str = str.split(',');
        if (str[str.length - 1] == '')
          str = str.slice(0, -1);
      }

      const equipments = str.map((p, i) => ({
        iid: i,
        text: p,
      }));

      return {
        equipments,
        captions,
      };
    },
    toggleShowStatDetailDisplay(target, force, clear = false) {
      force = force === undefined ? !this.detail[target] : force;
      this.detail[target] = force;

      if (clear && !force)
        this.detail.currentStat = null;
      return force;
    },
    setStatDetail(e, stat) {
      this.detail.positionElement = e.target.closest('.stat-scope');
      this.detail.currentStat = stat;
    },
  },
};
</script>

<style lang="postcss" scoped>
.stat-scope {
  &::before {
    content: '';
    @apply bg-light rounded-full w-2 h-2 absolute -bottom-1 -right-1 block;
  }
}

.separate-scope {
  border-left: 1px solid var(--primary-light-2);
  border-right: 1px solid var(--primary-light-2);
  padding: 0 0.4rem;
  margin: 0 0.4rem;
  color: var(--primary-light-3);
}
</style>
