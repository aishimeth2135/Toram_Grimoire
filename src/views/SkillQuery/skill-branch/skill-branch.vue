<template>
  <div :class="['branch', branch.name]">
    <div class="top">
      <cy-icon-text v-if="showData['name']" class="text-small name"
        iconify-name="mdi-checkbox-multiple-blank-circle">
        {{ showData['name'] }}
      </cy-icon-text>
      <div class="detail">
        <template v-if="branch.name == 'damage'">
          <span class="bg-scope">{{ showData['damage_type'] }}</span>
          <span v-if="showData['is_place']" class="bg-scope">{{ showData['is_place'] }}</span>
          <span v-if="showData['type']" class="bg-scope">{{ showData['type'] }}</span>
        </template>
      </div>
    </div>
    <template v-if="branch.name == 'damage'">
      <div class="content-line">
        <damage-formula v-if="!otherEquipmentShowDatas" :show-data="showData" />
        <damage-formula v-else :show-data="showData" class="line-button"
          @click.native="otherEquipmentDetailVisible = !otherEquipmentDetailVisible" />
      </div>
      <div v-if="otherEquipmentShowDatas && otherEquipmentDetailVisible"
        class="other-equipment-detail">
        <div v-for="(data, i) in otherEquipmentShowDatas" class="line">
          <div class="equipment">
            <template v-for="(name, i) in ['main', 'sub', 'body']">
              <span v-if="data.equipment[name] != -1">
                <span class="pretext">{{ langText('equipment pretext/' + name) }}</span>
                <span class="bg-scope">{{ data.equipment[name] }}</span>
              </span>
            </template>
          </div>
          <damage-formula :show-data="data.data" />
        </div>
      </div>
    </template>
    <template v-else-if="branch.name == 'proration'">
      <div class="content-line">
        <span class="attr-scope normal">
          <span class="title">{{ showData['damage: title'] }}</span>
          <span class="value">{{ showData['damage'] }}</span>
        </span>
        <span class="attr-scope normal">
          <span class="title">{{ showData['proration: title'] }}</span>
          <span class="value">{{ showData['proration'] }}</span>
        </span>
      </div>
    </template>
    <template v-else-if="branch.name == 'text'">
      <div class="text-scope">
        <cy-icon-text iconify-name="bx-bx-message-square-dots">
          <span v-html="showData['text']"></span>
        </cy-icon-text>
      </div>
    </template>
    <template v-else-if="branch.name == 'tips'">
      <div class="text-scope tips">
        <cy-icon-text iconify-name="bx-bx-message-rounded" class="text-small">
          <span v-html="showData['text']"></span>
        </cy-icon-text>
      </div>
    </template>
  </div>
</template>
<script>
import GetLang from "@global-modules/LanguageSystem.js";

import handleFormula from "../module/handleFormula.js";

import vue_damageFormula from "./damage-formula.vue";

export default {
  props: ['branch', 'skillState'],
  data(){
    return {
      otherEquipmentDetailVisible: false
    }
  },
  computed: {
    showData() {
      return this.handleShowData(this.branch);
    },
    otherEquipmentShowDatas(){
      if (this.branch.id == '-')
        return null;
      const states = this.skillState.states
        .filter(p => p.branchs.find(b => b.id == this.branch.id));
      const handleEquipment = eq => {
        const p = {
          main: eq.main != -1 ? GetLang('Skill Query/equipment/main-weapon')[eq.main] : -1,
          sub: eq.sub != -1 ? GetLang('Skill Query/equipment/sub-weapon')[eq.sub] : -1,
          body: eq.body != -1 ? GetLang('Skill Query/equipment/body-armor')[eq.body] : -1
        };
        console.log(p);
        return p;
      };
      const res = states
        .map((p, i) => ({
          equipment: handleEquipment(p.equipment),
          data: this.handleShowData(p.branchs.find(b => b.id == this.branch.id))
        }));
      return res.length == 0 ? null : res;
    }
  },
  methods: {
    handleShowData(bch){
      const attrs = bch.attrs;
      const data = Object.assign({}, attrs);
      console.log(bch);

      const hvs = this.handleValueStr;

      // 四個清單。會按照步驟對data內的資料做轉換。
      const handleValueList = []; // 1. 需計算公式的
      const hiddenList = [];      // 2. 驗證是否隱藏
      const langTextList = [];    // 3. 需轉換語言的
      const titleList = [];       // 4. 需從語言清單獲取標題的

      if (bch.name == 'proration'){
        if (data['proration'] == 'auto')
          data['proration'] = data['damage'];
        langTextList.push('damage', 'proration');
        titleList.push('damage', 'proration');
      }
      else if (!bch.mainBranch){
        if (bch.name == 'damage') {
          // base
          if (data['base'] == 'auto')
            data['base'] = data['damage_type'] == 'physical' ? 'atk' : 'matk';

          handleValueList.push('constant', 'multiplier', 'extra_constant', 'frequency', 'aliment_chance');
          hiddenList.push({
            name: ['constant', 'multiplier', 'extra_constant', 'is_place'],
            validation: v => v != '0'
          }, {
            name: 'frequency',
            validation: v => parseInt(v) > 1
          }, {
            name: 'name',
            validation: v => v,
            defaultValue: this.langText('damage/base name')
          }, {
            name: 'base',
            validation: v => v != 'none'
          }, {
            name: 'type',
            validation: v => v != 'single'
          });
          langTextList.push('base', 'damage_type', 'is_place', 'type');
        } else if (bch.name == 'text' || bch.name == 'tips') {
          data['branch'].split(/\s*,\s*/)
            .forEach(p => data['text'] = data['text'].replace(new RegExp(p, 'g'), m => `<span class="light-text">${m}</span>`));
        }

        // siffix
        data['@suffix'] = bch.suffix.map(p => this.handleShowData(p));
      }
      else {
        const mbch = bch.mainBranch;
        if (mbch.name == 'damage' && bch.name == 'extra'){

        }
      }


      handleValueList.forEach(k => data[k] = hvs(data[k]));

      hiddenList.forEach(({name, validation, defaultValue}) => {
        name = Array.isArray(name) ? name : [name];
        name.forEach(p => {
          if (!validation(data[p]))
            data[p] = defaultValue ? defaultValue : void 0;
        });
      });

      langTextList.forEach(k => {
        let p = data[k];
        if (!p)
          return;
        if (p == '1' || p == '0') // 轉換布林值
          p = p == '1' ? 'true' : 'false';
        data[k] = this.langText(`${bch.name}/${k}/${p}`);
      });

      titleList.forEach(k => {
        const p = data[k];
        if (!p)
          return;
        data[k + ': title'] = this.langText(`${bch.name}/${k}: title`);
      })

      console.log(data);

      return data;
    },
    handleValueStr(str) {
      if (!str) // str == '' || str == '0'
        return str;
      const ss = this.skillState;

      const slv = ss.slv,
        clv = ss.clv,
        stack = ss.stack;

      str = str.replace('SLv', slv)
        .replace('CLv', clv);

      function safeEval(str, dftv) {
        try {
          return eval(str);
        } catch (e) {
          console.warn('Unable to process: ' + str);
          return dftv === void 0 ? '??' : dftv;
        }
      }

      return handleFormula(str, safeEval);
    },
    langText(v, vs) {
      return GetLang('Skill Query/Branch/' + v, vs);
    }
  },
  components: {
    'damage-formula': vue_damageFormula
  }
};
</script>
<style lang="less" scoped>
@deep-operator: ~'>>>';

.branch {
  border-top: 1px solid var(--primary-light);
  padding: 0.6rem 0.2rem;

  > .top {
    margin-bottom: 0.4rem;
    display: flex;
    align-items: center;

    > .name {
      margin-right: 0.8rem;
      color: var(--primary-purple);
    }

    > .detail {
      display: inline-block;
    }
  }
}

.mb {
  margin-bottom: 0.4rem;
}

@{deep-operator} .light-text {
  color: var(--primary-light-4);
}

.content-line {
  margin-bottom: 0.4rem;
}

.bg-scope {
  background-color: var(--primary-dark);
  color: var(--white);
  display: inline-block;
  padding: 0.1rem 0.3rem;
  font-size: 0.9rem;
  border-radius: 0.2rem;
  margin-right: 0.3rem;
}

.other-equipment-detail {
  opacity: 0.7;
  > .line {
    display: flex;
    align-items: center;
    margin-bottom: 0.4rem;

    > .equipment {
      display: inline-block;
      font-size: 0.9rem;
    }
  }
}

@{deep-operator} .inline-content {
  display: inline-flex;
  align-items: center;
}

.line-button {
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: var(--primary-light);
    border-radius: 0.2rem;
  }
}

.text-scope {
  padding: 0.2rem 0;

  &.tips {
    color: var(--primary-light-3);

    @{deep-operator} .light-text {
      color: var(--primary-purple);
    }
  }
}

@{deep-operator} .attr-scope {
  padding: 0.1rem 0.4rem;
  display: inline-flex;
  align-items: center;
  line-height: 1.3rem;

  // &.normal {
  //   //border-left: 2px solid var(--primary-light-3);
  //   padding: 0 0.5rem;
  //   margin-right: 0.4rem;
  //   border-bottom: 1px solid var(--primary-light-2);
  // }
  &.normal {
    border-left: 2px solid var(--primary-light-3);
    padding: 0.1rem 0.7rem;
    margin-right: 0.3rem;
  }

  > .title {
    font-size: 0.9rem;
    align-self: flex-end;
  }

  >.value {
    margin-left: 0.4rem;
    color: var(--primary-light-4);
  }
}
</style>