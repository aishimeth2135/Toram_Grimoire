<template>
  <div :class="['branch', branch.name]">
    <template v-if="branch.name == 'damage'">
      <div class="inline-content">
        <span v-if="showData['constant'] != 0" class="divider"></span>
        <span class="attr-scope">{{ showData['base'] }}</span>
        <cy-icon-text iconify-name="ic-round-add" />
        <span class="attr-scope" v-if="showData['constant'] != 0">
          {{ showData['constant'] }}
        </span>
        <span v-if="showData['constant'] != 0" class="divider"></span>
        <cy-icon-text iconify-name="ic-round-clost" />
        <span class="attr-scope">{{ showData['multiplier'] }}</span>
      </div>
    </template>
  </div>
</template>

<script>
  import GetLang from "@global-modules/LanguageSystem.js";

  export default {
    props: ['branch'],
    computed: {
      showData(){
        const data = {};
        console.log(this.branch);
        const bch = this.branch;

        if ( bch.name == 'damage' ){
          const attrs = bch.attrs;
          
          // base
          if ( attrs['base'] != 'none' ){
            const p = attrs['base'] == 'auto'
              ? (attrs['damage_type'] == 'physical' ? 'atk' : 'matk')
              : attrs['base'];
            data['base'] = this.langText('damage/base/' + p);
          }

          //
          data['constant'] = attrs['constant'];
          data['multiplier'] = attrs['multiplier'];
          data['extra_constant'] = attrs['extra_constant'];
        }

        return data;
      }
    },
    methods: {
      langText(v, vs){
        return GetLang('Skill Query/Branch/' + v, vs);
      }
    }
  };
</script>

<style lang="less" scoped>
  .inline-content {
    display: inline-flex;
    align-items: center;
  }

  .attr-scope {
    padding: 0.2rem 0.4rem;

    > .value {
      color: var(--primary-light-4);
    }
  }

  .divider {
    border-left: 1px solid var(--primary-light);
    margin: 0 0.4rem;
    height: 1.2rem;
  }
</style>