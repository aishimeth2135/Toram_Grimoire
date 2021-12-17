<template>
  <cy-transition type="fade">
    <div class="m-3 flex flex-wrap items-start p-3">
      <div class="inline-block">
        <skill-area :attrs="branch.attrs" />
        <div class="text-center">
          <cy-icon-text
            icon="bx-bxs-circle"
            class="mr-2"
            icon-color="water-blue"
            size="small"
          >
            {{ $lang('skill area/point: character') }}
          </cy-icon-text>
          <cy-icon-text
            icon="bx-bxs-circle"
            icon-color="red"
            size="small"
          >
            {{ $lang('skill area/point: target') }}
          </cy-icon-text>
        </div>
      </div>
      <div class="inline-block pt-4 pl-4">
        <table class="attrs-table">
          <tbody>
            <tr>
              <td>{{ showData['effective_area: title'] }}</td>
              <td v-html="showData['effective_area']" />
            </tr>
            <tr v-if="branch.attrs['effective_area'] != 'sector'">
              <td>{{ showData['radius: title'] }}</td>
              <td v-html="showData['radius']" />
            </tr>
            <tr v-if="showData['move_distance']">
              <td>{{ showData['move_distance: title'] }}</td>
              <td v-html="showData['move_distance']" />
            </tr>
            <tr v-if="showData['angle']">
              <td>{{ showData['angle: title'] }}</td>
              <td v-html="showData['angle']" />
            </tr>
            <tr v-if="showData['start_position_offsets']">
              <td>{{ showData['start_position_offsets: title'] }}</td>
              <td v-html="showData['start_position_offsets']" />
            </tr>
            <tr v-if="showData['end_position_offsets']">
              <td>{{ showData['end_position_offsets: title'] }}</td>
              <td v-html="showData['end_position_offsets']" />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </cy-transition>
</template>

<script>
import vue_skillArea from './skill-area.vue';

export default {
  RegisterLang: 'Skill Query/Branch',
  components: {
    'skill-area': vue_skillArea,
  },
  props: ['branch', 'showData'],
};
</script>

<style lang="less" scoped>
.attrs-table {
  tr {
    td:nth-child(1) {
      text-align: right;
      padding-right: 0.6rem;
      border-right: 1px solid var(--primary-light);
    }
    td:nth-child(2) {
      padding-left: 0.6rem;
      color: var(--primary-light-4);
    }
  }
}
</style>
